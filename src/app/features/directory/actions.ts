"use server";

import { getApolloClient } from "~/lib/apollo-client";
import { gql } from "@apollo/client";
import { getNFTContracts } from "~/lib/getNFTContracts";
import {
  Creator,
  OpenSeaCollection,
  CreatorWithOpenSeaData,
} from "~/app/features/directory/types";
import { resolveBasenameOrAddress } from "~/app/hooks/useBasenameResolver";

const CIRCLE_ID = 31712;
const ENTRANCE = "frames-be";

/**
 * Checks if an address is a member of the hardcoded circle
 * @param address Ethereum address to check
 * @returns Promise<boolean> True if address is a member, false otherwise
 */
export async function addressIsMember(address: string): Promise<boolean> {
  try {
    const { data } = await getApolloClient().query({
      query: gql`
        query CheckMembership($address: String!, $circleId: bigint!) {
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

    console.log("data", data);
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
  name: string
): Promise<boolean> {
  try {
    const { data } = await getApolloClient().mutate({
      mutation: gql`
        mutation JoinDirectory(
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
 * @returns Promise<CreatorWithOpenSeaData | null> The creator with their OpenSea data or null if not found
 */
export async function getCreator(
  address: string
): Promise<CreatorWithOpenSeaData | null> {
  try {
    const { data } = await getApolloClient().query({
      query: gql`
        query GetCreator($circleId: bigint!, $address: String!) {
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
              bio
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
      bio: user.profile?.bio || "",
    };

    try {
      // Get NFT contracts
      const contracts = await getNFTContracts(creator.address);

      // Resolve basename
      const resolution = await resolveBasenameOrAddress(creator.address);

      // Transform the resolution to match the BasenameResolution interface
      const formattedResolution = resolution
        ? {
            basename: resolution.basename,
            address: resolution.address,
            resolved: !!resolution.basename,
          }
        : null;

      return {
        ...creator,
        resolution: formattedResolution,
        openSeaData: {
          collections: contracts.map((contract) => ({
            id: contract.contractAddress,
            name: contract.name,
            description: contract.description,
            imageUrl: contract.imageUrl,
            bannerImageUrl: contract.bannerImageUrl,
          })),
        },
      };
    } catch (error) {
      console.error(`Failed to fetch data for ${creator.address}:`, error);
      // Return creator without OpenSea data if there's an error
      return {
        ...creator,
        resolution: null,
      };
    }
  } catch (error) {
    console.error(`Error fetching creator with address ${address}:`, error);
    return null;
  }
}

/**
 * Fetches all creators from the directory
 * @returns Promise<Array<CreatorWithOpenSeaData>> Array of creators with their OpenSea data and basename resolution
 */
export async function getCreators(): Promise<CreatorWithOpenSeaData[]> {
  try {
    const { data } = await getApolloClient().query({
      query: gql`
        query GetCreators($circleId: bigint!) {
          users(
            where: { circle_id: { _eq: $circleId } }
            order_by: { created_at: desc }
          ) {
            id
            profile {
              id
              address
              name
              avatar
              bio
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
          bio?: string;
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
        bio: user.profile?.bio || "",
      })
    );

    // Fetch OpenSea data and resolve basenames for each creator on the server side
    const creatorsWithOpenSeaData: CreatorWithOpenSeaData[] = await Promise.all(
      creators.map(async (creator: Creator) => {
        try {
          // Get NFT contracts
          const contracts = await getNFTContracts(creator.address);

          // Resolve basename
          const resolution = await resolveBasenameOrAddress(creator.address);

          // Transform the resolution to match the BasenameResolution interface
          const formattedResolution = resolution
            ? {
                basename: resolution.basename,
                address: resolution.address,
                resolved: !!resolution.basename,
              }
            : null;

          return {
            ...creator,
            resolution: formattedResolution,
            openSeaData: {
              collections: contracts.map((contract) => ({
                id: contract.contractAddress,
                name: contract.name,
                description: contract.description,
                imageUrl: contract.imageUrl,
                bannerImageUrl: contract.bannerImageUrl,
              })),
            },
          };
        } catch (error) {
          console.error(`Failed to fetch data for ${creator.address}:`, error);
          // Return creator without OpenSea data if there's an error
          return {
            ...creator,
            resolution: null,
          };
        }
      })
    );

    return creatorsWithOpenSeaData;
  } catch (error) {
    console.error("Error fetching creators:", error);
    return [];
  }
}
