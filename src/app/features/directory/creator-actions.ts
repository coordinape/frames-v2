"use server";

import { getApolloClient, getApolloClientAuthed } from "~/lib/apollo-client";
import { gql } from "@apollo/client";
import { getNFTContracts } from "~/lib/getNFTContracts";
import { Creator, CreatorWithNFTData } from "~/app/features/directory/types";
import { resolveBasenameOrAddress } from "~/app/hooks/useBasenameResolver";
import { kv } from "@vercel/kv";
import {
  CIRCLE_ID,
  SINGLE_CREATOR_CACHE_PREFIX,
  SINGLE_CREATOR_LOCK_PREFIX,
  SINGLE_CREATOR_CACHE_DURATION,
  SINGLE_CREATOR_REVALIDATION_WINDOW,
  LOCK_DURATION,
} from "./constants";
import { debugLog } from "~/lib/constants";
import { Give, SortedGiveGroup, GroupedGives } from "./types";

/**
 * Helper function to fetch and transform creator data from the API
 */
async function refreshSingleCreatorData(
  address: string,
): Promise<CreatorWithNFTData | null> {
  try {
    debugLog(`[refreshSingleCreatorData] Starting fetch for ${address}`);

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

    if (!data.users.length) {
      return null;
    }

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

    const contracts = await getNFTContracts(creator.address, "BASE_MAINNET", {
      excludeNoImage: true,
    });

    const resolution = await resolveBasenameOrAddress(creator.address);
    const formattedResolution = resolution
      ? {
          basename: resolution.basename || "",
          address: resolution.address || "",
          resolved: !!resolution.basename,
          textRecords: resolution.textRecords || {},
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
    console.error(`Error fetching creator data for ${address}:`, error);
    return null;
  }
}

/**
 * Helper function to get basic creator data when full data fetch fails
 */
async function getBasicCreatorData(
  address: string,
): Promise<CreatorWithNFTData | null> {
  try {
    const { data } = await getApolloClientAuthed().query({
      query: gql`
        query CreatorsDirGetBasicCreator(
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

    if (!data.users.length) {
      return null;
    }

    const user = data.users[0];
    return {
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
      resolution: null,
      nftData: { collections: [] },
    };
  } catch (error) {
    console.error(`Error fetching basic creator data for ${address}:`, error);
    return null;
  }
}

/**
 * Internal function to refresh a single creator's data and update cache
 */
export async function refreshCreatorData(
  address: string,
): Promise<CreatorWithNFTData | null> {
  try {
    debugLog(`[refreshCreatorData] Starting refresh for ${address}`);
    const creatorData = await refreshSingleCreatorData(address);

    if (!creatorData) {
      return null;
    }

    await kv.set(
      `${SINGLE_CREATOR_CACHE_PREFIX}${address.toLowerCase()}`,
      { data: creatorData },
      { ex: SINGLE_CREATOR_CACHE_DURATION },
    );

    return creatorData;
  } catch (error) {
    console.error(`Failed to fetch data for ${address}:`, error);
    const basicData = await getBasicCreatorData(address);
    if (basicData) {
      await kv.set(
        `${SINGLE_CREATOR_CACHE_PREFIX}${address.toLowerCase()}`,
        { data: basicData },
        { ex: SINGLE_CREATOR_CACHE_DURATION },
      );
    }
    return basicData;
  }
}

/**
 * Background revalidation function for a single creator
 */
async function revalidateCreator(address: string): Promise<void> {
  try {
    await refreshCreatorData(address);
  } catch (error) {
    console.error(`Error revalidating creator ${address}:`, error);
  } finally {
    await kv.del(`${SINGLE_CREATOR_LOCK_PREFIX}${address.toLowerCase()}`);
  }
}

/**
 * Fetches a single creator from the directory by their Ethereum address with caching
 */
export async function getCreator(
  address: string,
): Promise<CreatorWithNFTData | null> {
  const normalizedAddress = address.toLowerCase();
  const cacheKey = `${SINGLE_CREATOR_CACHE_PREFIX}${normalizedAddress}`;
  const lockKey = `${SINGLE_CREATOR_LOCK_PREFIX}${normalizedAddress}`;

  try {
    debugLog(`[getCreator] Starting fetch for ${normalizedAddress}`);

    const multi = kv.multi();
    multi.get(cacheKey);
    multi.ttl(cacheKey);
    const [cached, ttl] = (await multi.exec()) as [
      { data: CreatorWithNFTData } | null,
      number,
    ];

    if (ttl < SINGLE_CREATOR_REVALIDATION_WINDOW) {
      const acquired = await kv.set(lockKey, Date.now(), {
        nx: true,
        ex: LOCK_DURATION,
      });

      if (acquired) {
        if (cached?.data) {
          revalidateCreator(normalizedAddress).catch(console.error);
        } else {
          return await refreshCreatorData(normalizedAddress);
        }
      }
    }

    if (cached?.data) {
      return cached.data;
    }

    return await refreshCreatorData(normalizedAddress);
  } catch (error) {
    console.error(`Error fetching creator ${address}:`, error);
    const cached = await kv.get<{ data: CreatorWithNFTData }>(cacheKey);
    if (cached?.data) {
      return cached.data;
    }
    return null;
  }
}

/**
 * Fetches all gives for a specific creator address
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

    return groupAndSortGives(data.colinks_gives);
  } catch (error) {
    console.error(`Error fetching gives for address ${address}:`, error);
    return [];
  }
}

/**
 * Helper function to group gives by skill
 */
function groupedGives(gives: Give[]): GroupedGives {
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
}

/**
 * Helper function to sort gives by count and skill
 */
function sortedGives(groupedGives: GroupedGives): SortedGiveGroup[] {
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
}

/**
 * Helper function to group and sort gives
 */
function groupAndSortGives(gives: Give[]): SortedGiveGroup[] {
  return sortedGives(groupedGives(gives));
}
