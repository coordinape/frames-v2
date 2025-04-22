"use server";

import { getApolloClientAuthed } from "~/lib/apollo-client";
import { gql } from "@apollo/client";
import { getNFTContracts } from "~/lib/getNFTContracts";
import { Creator, CreatorWithNFTData } from "~/app/features/directory/types";
import { resolveBasenameOrAddress } from "~/app/hooks/useBasenameResolver";
import { kv } from "@vercel/kv";
import {
  CIRCLE_ID,
  CREATORS_CACHE_KEY,
  REVALIDATION_LOCK_KEY,
  CACHE_DURATION,
  LOCK_DURATION,
  REVALIDATION_WINDOW,
} from "./constants";
import { debugLog } from "~/lib/constants";
import { getGivesForCreator } from "./creator-actions";

export interface CachedData {
  data: CreatorWithNFTData[];
}

/**
 * Utility function to process creators in chunks
 */
async function processInChunks<T, R>(
  items: T[],
  chunkSize: number,
  processor: (chunk: T[]) => Promise<R[]>,
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = await processor(chunk);
    results.push(...chunkResults);
  }
  return results;
}

/**
 * Batch process creator data with retries and timeouts
 */
async function batchProcessCreators(
  creators: Creator[],
  chunkSize = 20,
): Promise<CreatorWithNFTData[]> {
  return processInChunks(creators, chunkSize, async (chunk) => {
    const processWithTimeout = async (
      creator: Creator,
    ): Promise<CreatorWithNFTData> => {
      const timeout = 5000; // 5 second timeout
      try {
        const result = await Promise.race([
          Promise.all([
            getNFTContracts(creator.address).catch(() => []),
            resolveBasenameOrAddress(creator.address).catch(() => null),
            getGivesForCreator(creator.address).catch(() => []),
          ]),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), timeout),
          ),
        ]);

        const [contracts, resolution, gives] = result as [any[], any, any[]];

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
        console.error(`Error or timeout processing ${creator.address}:`, error);
        return {
          ...creator,
          resolution: null,
          gives: [],
          nftData: { collections: [] },
        };
      }
    };

    return Promise.all(chunk.map(processWithTimeout));
  });
}

/**
 * Fetches all creators from the API
 */
async function getCreatorsFromAPI(): Promise<CreatorWithNFTData[]> {
  const startTime = performance.now();
  debugLog("Starting getCreatorsFromAPI");

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

  const queryTime = performance.now();
  debugLog(
    `GraphQL query completed in ${(queryTime - startTime).toFixed(2)}ms`,
  );

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

  const transformTime = performance.now();
  debugLog(
    `Data transformation completed in ${(transformTime - queryTime).toFixed(2)}ms`,
  );
  debugLog(
    `Processing ${creators.length} creators for NFT data and basenames...`,
  );

  // Process creators in batches with improved error handling and timeouts
  const creatorsWithNFTData = await batchProcessCreators(creators);

  const endTime = performance.now();
  const totalTime = endTime - startTime;
  console.log(`getCreatorsFromAPI completed in ${totalTime.toFixed(2)}ms`);
  debugLog(
    `Average time per creator: ${(totalTime / creators.length).toFixed(2)}ms`,
  );

  return creatorsWithNFTData;
}

/**
 * Internal function to refresh creators data and update cache
 */
async function refreshCreatorsData(): Promise<CreatorWithNFTData[]> {
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

/**
 * Background revalidation function that updates the cache
 */
export async function revalidateCreators(): Promise<void> {
  try {
    await refreshCreatorsData();
  } catch (error) {
    console.error("Error revalidating creators:", error);
  } finally {
    await kv.del(REVALIDATION_LOCK_KEY);
  }
}

/**
 * Fetches all creators from the directory with caching
 */
export async function getCreators(): Promise<CreatorWithNFTData[]> {
  try {
    const multi = kv.multi();
    multi.get(CREATORS_CACHE_KEY);
    multi.ttl(CREATORS_CACHE_KEY);
    const [cached, ttl] = (await multi.exec()) as [CachedData | null, number];

    if (ttl < REVALIDATION_WINDOW) {
      const acquired = await kv.set(REVALIDATION_LOCK_KEY, Date.now(), {
        nx: true,
        ex: LOCK_DURATION,
      });

      if (acquired) {
        if (cached?.data) {
          revalidateCreators().catch(console.error);
        } else {
          return await refreshCreatorsData();
        }
      }
    }

    if (cached?.data) {
      return cached.data;
    }

    return await refreshCreatorsData();
  } catch (error) {
    console.error("Error fetching creators:", error);
    const cached = await kv.get<CachedData>(CREATORS_CACHE_KEY);
    if (cached?.data) {
      return cached.data;
    }
    return [];
  }
}
