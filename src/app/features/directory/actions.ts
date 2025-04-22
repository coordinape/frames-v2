"use server";

import { getApolloClient, getApolloClientAuthed } from "~/lib/apollo-client";
import { gql } from "@apollo/client";
import { getNFTContracts } from "~/lib/getNFTContracts";
import {
  Creator,
  CreatorWithNFTData,
  Give,
  GroupedGives,
  SortedGiveGroup,
} from "~/app/features/directory/types";
import { resolveBasenameOrAddress } from "~/app/hooks/useBasenameResolver";
import { kv } from "@vercel/kv";
import {
  CIRCLE_ID,
  ENTRANCE,
  CREATORS_CACHE_KEY,
  REVALIDATION_LOCK_KEY,
  CACHE_DURATION,
  LOCK_DURATION,
  REVALIDATION_WINDOW,
} from "./constants";

interface CachedData {
  data: CreatorWithNFTData[];
}

/**
 * Checks if an address is a member of the hardcoded circle
 * @param address Ethereum address to check
 * @returns Promise<boolean> True if address is a member, false otherwise
 */
export async function addressIsMember(address: string): Promise<boolean> {
  try {
    const { data } = await getApolloClientAuthed().query({
      query: gql`
        query CreatorsDirCheckMembership(
          $address: String!
          $circleId: bigint!
        ) {
          users(
            where: {
              circle_id: { _eq: $circleId }
              profile: { address: { _ilike: $address } }
            }
          ) {
            id
            profile {
              name
              id
            }
          }
        }
      `,
      variables: {
        address: address,
        circleId: CIRCLE_ID,
      },
    });

    return data.users.length > 0;
  } catch (error) {
    console.error("Error checking membership:", error);
    return false;
  }
}

/**
 * Adds a user to the directory circle
 * @param address Ethereum address of the user
 * @param name Name of the user
 * @returns Promise<boolean> True if successfully added, false otherwise
 */
export async function joinDirectory(
  address: string,
  name: string,
): Promise<boolean> {
  try {
    const { data } = await getApolloClientAuthed().mutate({
      mutation: gql`
        mutation CreatorsDirJoinDirectory(
          $circleId: Int!
          $address: String!
          $name: String!
          $entrance: String!
        ) {
          createUsers(
            payload: {
              circle_id: $circleId
              users: { address: $address, name: $name, entrance: $entrance }
            }
          ) {
            id
          }
        }
      `,
      variables: {
        circleId: CIRCLE_ID,
        address,
        name,
        entrance: ENTRANCE,
      },
    });

    console.log("Join directory response:", data);
    return !!data.createUsers?.[0]?.id;
  } catch (error) {
    console.error("Error joining directory:", error);
    return false;
  }
}

/**
 * Fetches a single creator from the directory by their Ethereum address
 * @param address Ethereum address of the creator to fetch
 * @returns Promise<CreatorWithNFTData | null> The creator with their NFT data or null if not found
 */
export async function getCreator(
  address: string,
): Promise<CreatorWithNFTData | null> {
  try {
    const { data } = await getApolloClientAuthed().query({
      query: gql`
        query CreatorsDirGetSingleCreator(
          $circleId: bigint!
          $address: String!
        ) {
          users(
            where: {
              circle_id: { _eq: $circleId }
              profile: { address: { _ilike: $address } }
            }
          ) {
            id
            profile {
              id
              address
              name
              avatar
              description
              farcaster_account {
                username
              }
            }
          }
        }
      `,
      variables: {
        circleId: CIRCLE_ID,
        address: address,
      },
    });

    // If no creator found with this address
    if (!data.users.length) {
      return null;
    }

    // Transform the data to a more convenient format (using the first result)
    const user = data.users[0];
    const creator: Creator = {
      id: user.id,
      address: user.profile?.address || "",
      name: user.profile?.name || "",
      avatar: user.profile?.avatar
        ? user.profile.avatar.startsWith("http")
          ? user.profile.avatar
          : `https://coordinape-prod.s3.amazonaws.com/${user.profile.avatar}`
        : "",
      description: user.profile?.description || "",
      farcasterUsername: user.profile?.farcaster_account?.username || "",
    };

    try {
      // Get NFT contracts
      const contracts = await getNFTContracts(creator.address, "BASE_MAINNET", {
        excludeNoImage: true,
      });
      console.log("getNFTContracts", JSON.stringify(contracts, null, 2));

      // Resolve basename
      const resolution = await resolveBasenameOrAddress(creator.address);

      // Transform the resolution to match the BasenameResolution interface
      const formattedResolution = resolution
        ? {
            basename: resolution.basename,
            address: resolution.address,
            resolved: !!resolution.basename,
            textRecords: resolution.textRecords,
          }
        : null;

      return {
        ...creator,
        resolution: formattedResolution,
        nftData: {
          collections: contracts.map((contract) => ({
            id: contract.contractAddress,
            name: contract.name,
            description: contract.description,
            imageUrl: contract.imageUrl,
            bannerImageUrl: contract.bannerImageUrl,
            openseaUrl: `https://opensea.io/assets/base/${contract.contractAddress}`,
            projectUrl: contract.projectUrl || "",
            contractAddress: contract.contractAddress,
          })),
        },
      };
    } catch (error) {
      console.error(`Failed to fetch data for ${creator.address}:`, error);
      // Return creator without NFT data if there's an error
      return {
        ...creator,
        resolution: null,
        nftData: { collections: [] },
      };
    }
  } catch (error) {
    console.error(`Error fetching creator with address ${address}:`, error);
    return null;
  }
}

/**
 * Fetches all creators from the directory with caching
 * @returns Promise<Array<CreatorWithNFTData>> Array of creators with their NFT data and basename resolution
 */
export async function getCreators(): Promise<CreatorWithNFTData[]> {
  try {
    // Get both cached data and TTL in one atomic operation
    const multi = kv.multi();
    multi.get(CREATORS_CACHE_KEY);
    multi.ttl(CREATORS_CACHE_KEY);
    const [cached, ttl] = (await multi.exec()) as [CachedData | null, number];

    // Revalidate if TTL is negative (expired) or less than revalidation window
    if (ttl < REVALIDATION_WINDOW) {
      // Try to acquire the revalidation lock
      const acquired = await kv.set(REVALIDATION_LOCK_KEY, Date.now(), {
        nx: true,
        ex: LOCK_DURATION,
      });

      // If we got the lock, trigger revalidation
      if (acquired) {
        if (cached?.data) {
          // If we have cached data, revalidate in background
          revalidateCreators().catch(console.error);
        } else {
          // If no cached data, revalidate immediately
          const freshData = await getCreatorsFromAPI();
          await kv.set(
            CREATORS_CACHE_KEY,
            {
              data: freshData,
            },
            { ex: CACHE_DURATION },
          );
          return freshData;
        }
      }
    }

    // Return cached data if we have it
    if (cached?.data) {
      return cached.data;
    }

    // If we somehow have no cached data (first ever run), fetch and cache
    const freshData = await getCreatorsFromAPI();
    await kv.set(
      CREATORS_CACHE_KEY,
      {
        data: freshData,
      },
      { ex: CACHE_DURATION },
    );
    return freshData;
  } catch (error) {
    console.error("Error fetching creators:", error);
    // If there's an error but we have cached data, return it
    const cached = await kv.get<CachedData>(CREATORS_CACHE_KEY);
    if (cached?.data) {
      return cached.data;
    }
    return [];
  }
}

/**
 * Background revalidation function that updates the cache
 */
export async function revalidateCreators(): Promise<void> {
  try {
    const freshData = await getCreatorsFromAPI();

    await kv.set(
      CREATORS_CACHE_KEY,
      {
        data: freshData,
      },
      { ex: CACHE_DURATION },
    );
  } catch (error) {
    console.error("Error revalidating creators:", error);
  } finally {
    // Clean up the lock regardless of success/failure
    await kv.del(REVALIDATION_LOCK_KEY);
  }
}

/**
 * Internal function to fetch creators from the API
 */
async function getCreatorsFromAPI(): Promise<CreatorWithNFTData[]> {
  const { data } = await getApolloClientAuthed().query({
    query: gql`
      query CreatorsDirGetAllCreators($circleId: bigint!) {
        users(
          where: {
            circle_id: { _eq: $circleId }
            profile: {
              address: { _neq: "0x4fd59e958a4eaf440d761c41c73e40bffd069f4d" }
            }
          }
          order_by: { created_at: desc }
        ) {
          id
          profile {
            id
            address
            name
            avatar
            description
            farcaster_account {
              username
            }
          }
        }
      }
    `,
    variables: {
      circleId: CIRCLE_ID,
    },
  });

  // Transform the data to a more convenient format
  const creators: Creator[] = data.users.map(
    (user: {
      id: string;
      profile?: {
        address?: string;
        name?: string;
        avatar?: string;
        description?: string;
        farcaster_account?: {
          username?: string;
        };
      };
    }) => ({
      id: user.id,
      address: user.profile?.address || "",
      name: user.profile?.name || "",
      avatar: user.profile?.avatar
        ? user.profile.avatar.startsWith("http")
          ? user.profile.avatar
          : `https://coordinape-prod.s3.amazonaws.com/${user.profile.avatar}`
        : "",
      description: user.profile?.description || "",
      farcasterUsername: user.profile?.farcaster_account?.username || "",
    }),
  );

  // Fetch NFT data and resolve basenames for each creator on the server side
  const creatorsWithNFTData: CreatorWithNFTData[] = await Promise.all(
    creators.map(async (creator: Creator) => {
      try {
        // Get NFT contracts
        const contracts = await getNFTContracts(creator.address);

        // Resolve basename
        const resolution = await resolveBasenameOrAddress(creator.address);

        // Get gives data
        const gives = await getGivesForCreator(creator.address);

        // Transform the resolution to match the BasenameResolution interface
        const formattedResolution = resolution
          ? {
              basename: resolution.basename,
              address: resolution.address,
              resolved: !!resolution.basename,
              textRecords: resolution.textRecords,
            }
          : null;

        return {
          ...creator,
          resolution: formattedResolution,
          gives: gives,
          nftData: {
            collections: contracts.map((contract) => ({
              id: contract.contractAddress,
              name: contract.name,
              description: contract.description,
              imageUrl: contract.imageUrl,
              bannerImageUrl: contract.bannerImageUrl,
              openseaUrl: `https://opensea.io/assets/base/${contract.contractAddress}`,
              projectUrl: contract.projectUrl || "",
              contractAddress: contract.contractAddress,
            })),
          },
        };
      } catch (error) {
        console.error(`Failed to fetch data for ${creator.address}:`, error);
        // Return creator without NFT data if there's an error
        return {
          ...creator,
          resolution: null,
          gives: [],
        };
      }
    }),
  );

  return creatorsWithNFTData;
}

const groupedGives = (gives: Give[]): GroupedGives => {
  return gives.reduce((acc, give) => {
    if (give.skill) {
      if (!acc[give.skill]) {
        acc[give.skill] = [];
      }
      acc[give.skill].push(give);
    } else {
      if (!acc[""]) {
        acc[""] = [];
      }
      acc[""].push(give);
    }
    return acc;
  }, {} as GroupedGives);
};

const sortedGives = (groupedGives: GroupedGives): SortedGiveGroup[] => {
  return Object.entries(groupedGives)
    .map(([skill, gives]) => ({
      count: gives.length,
      gives: gives,
      skill: skill,
    }))
    .sort((a, b) => {
      const diff = b.count - a.count;
      if (diff === 0) {
        return a.skill.localeCompare(b.skill);
      }
      return diff;
    });
};

const groupAndSortGives = (gives: Give[]): SortedGiveGroup[] => {
  return sortedGives(groupedGives(gives));
};

/**
 * Fetches all gives for a specific creator address
 * @param address Ethereum address of the creator
 * @returns Promise<SortedGiveGroup[]> Array of sorted and grouped gives for the creator
 */
export async function getGivesForCreator(
  address: string,
): Promise<SortedGiveGroup[]> {
  try {
    const { data } = await getApolloClient().query({
      query: gql`
        query CreatorsDirGetCreatorGives($address: String!) {
          colinks_gives(
            where: {
              target_profile_public: { address: { _ilike: $address } }
              skill: { _is_null: false }
            }
          ) {
            id
            skill
            created_at
          }
        }
      `,
      variables: {
        address: address,
      },
    });

    // console.log("data for gives", JSON.stringify(data, null, 2));
    return groupAndSortGives(data.colinks_gives);
  } catch (error) {
    console.error(`Error fetching gives for address ${address}:`, error);
    return [];
  }
}
