"use server";

import fs from "fs";
import path from "path";
import { kv } from "@vercel/kv";

// Cache directory setup
const CACHE_DIR = path.join(process.cwd(), ".cache");
const CACHE_DURATION = 3600 * 1000 * 24; // 24 hours in milliseconds

const LOCAL_CACHE = false;

// Ensure cache directory exists
try {
  if (LOCAL_CACHE && !fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
} catch (error) {
  console.error("Failed to create cache directory:", error);
}

// Helper function to generate consistent cache keys
function generateCacheKey(type: string, identifier: string): string {
  return `opensea-${type}-${identifier}`.toLowerCase();
}

async function fetchWithCache<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
): Promise<T> {
  if (LOCAL_CACHE) {
    return fetchWithLocalCache(cacheKey, fetchFn);
  }

  const cachedData = await kv.get(cacheKey);
  if (cachedData) {
    console.log(`Cache hit for ${cacheKey}`);
    console.log({ cachedData });
    return cachedData as T;
  }

  console.log(`Cache miss for ${cacheKey}`);
  const data = await fetchFn();
  await kv.set(cacheKey, data, { ex: CACHE_DURATION });
  return data;
}

// Function to get cached data or fetch new data
async function fetchWithLocalCache<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
): Promise<T> {
  const cacheFile = path.join(CACHE_DIR, `${cacheKey}.json`);

  try {
    // Check if cache file exists and is not expired
    if (fs.existsSync(cacheFile)) {
      const stats = fs.statSync(cacheFile);
      const fileAge = Date.now() - stats.mtimeMs;

      // If cache is still valid, return cached data
      if (fileAge < CACHE_DURATION) {
        const cachedData = await fs.promises.readFile(cacheFile, "utf-8");
        return JSON.parse(cachedData);
      }
    }

    // Cache expired or doesn't exist, fetch fresh data
    const data = await fetchFn();

    // Save to cache
    await fs.promises.writeFile(cacheFile, JSON.stringify(data), "utf-8");

    return data;
  } catch (error) {
    console.error(`Cache error for ${cacheKey}:`, error);
    // If cache operations fail, fall back to direct fetch
    return fetchFn();
  }
}

interface OpenSeaCollection {
  collection: string;
  name: string;
  description: string;
  image_url: string;
  banner_image_url: string;
  owner: string;
  opensea_url: string;
  project_url: string;
  discord_url: string;
  twitter_username: string;
  contracts: {
    address: string;
    chain: string;
  }[];
}

interface ContractDetails {
  name: string;
  contractAddress: string;
  chainId: string;
  imageUrl: string;
  bannerImageUrl: string;
  description: string;
  openseaUrl: string;
  projectUrl: string;
  discordUrl: string;
  twitterUsername: string;
}

// Add a function to filter collections by chain
function filterCollectionsByChain(
  collections: ContractDetails[],
  chain: string,
): ContractDetails[] {
  return collections.filter((collection) => collection.chainId === chain);
}

// First, get the username from the address
export async function getOpenSeaUsernameFromAddress(address: string) {
  const cacheKey = generateCacheKey("username", address);

  return fetchWithCache<string | null>(cacheKey, async () => {
    try {
      const response = await fetch(
        `https://api.opensea.io/api/v2/accounts/${address}`,
        {
          method: "GET",
          headers: {
            "x-api-key": process.env.OPENSEA_API_KEY!,
            accept: "application/json",
          },
        },
      );

      if (response.status === 404 || response.status === 400) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`OpenSea API error: ${response.status}`);
      }

      const data = await response.json();
      return data.username || null;
    } catch (error) {
      console.error("Error fetching account from OpenSea:", error);
      throw error;
    }
  });
}

// Then get collections by username
export async function getOpenseaNFTContracts(
  deployerAddress: string,
  chain?: string,
) {
  const cacheKey = generateCacheKey("collections", deployerAddress);

  return fetchWithCache<ContractDetails[]>(cacheKey, async () => {
    try {
      // First get the username
      const username = await getOpenSeaUsernameFromAddress(deployerAddress);

      if (!username) {
        return [];
        // throw new Error("No OpenSea username found for this address");
      }

      // Then get the collections
      const response = await fetch(
        `https://api.opensea.io/api/v2/collections?creator_username=${username}`,
        {
          method: "GET",
          headers: {
            "x-api-key": process.env.OPENSEA_API_KEY!,
            accept: "application/json",
          },
        },
      );

      console.log("response", JSON.stringify(response, null, 2));

      if (!response.ok) {
        throw new Error(`OpenSea API error: ${response.status}`);
      }

      const data = await response.json();

      // Extract detailed information from collections
      const contractDetails: ContractDetails[] = data.collections.flatMap(
        (collection: OpenSeaCollection): ContractDetails[] =>
          collection.contracts.map(
            (contract): ContractDetails => ({
              name: collection.name,
              contractAddress: contract.address,
              chainId: contract.chain,
              imageUrl: collection.image_url,
              bannerImageUrl: collection.banner_image_url,
              description: collection.description,
              openseaUrl: collection.opensea_url,
              projectUrl: collection.project_url,
              discordUrl: collection.discord_url,
              twitterUsername: collection.twitter_username,
            }),
          ),
      );

      // Filter by chain if specified
      return chain
        ? filterCollectionsByChain(contractDetails, chain)
        : contractDetails;
    } catch (error) {
      console.error("Error fetching collection details from OpenSea:", error);
      throw error;
    }
  });
}

/**
 * Busts the cache for a given key
 * @param cacheKey The key to remove from cache
 */
export async function bustCache(cacheKey: string): Promise<void> {
  if (LOCAL_CACHE) {
    // Delete local cache file if it exists
    const cacheFile = path.join(CACHE_DIR, `${cacheKey}.json`);
    if (fs.existsSync(cacheFile)) {
      await fs.promises.unlink(cacheFile);
      console.log(`Busted local cache for ${cacheKey}`);
    }
  } else {
    // Delete key from Vercel KV
    await kv.del(cacheKey);
    console.log(`Busted KV cache for ${cacheKey}`);
  }
}

/**
 * Busts the cache for a specific OpenSea username
 * @param address The Ethereum address associated with the username
 */
export async function bustOpenSeaUsernameCache(address: string): Promise<void> {
  await bustCache(generateCacheKey("username", address));
}

/**
 * Busts the cache for OpenSea collections
 * @param address The Ethereum address associated with the collections
 */
export async function bustOpenSeaCollectionsCache(
  address: string,
): Promise<void> {
  await bustCache(generateCacheKey("collections", address));
}

/**
 * Busts all OpenSea-related caches for an address
 * @param address The Ethereum address to bust caches for
 */
export async function bustAllOpenSeaCaches(address: string): Promise<void> {
  await Promise.all([
    bustOpenSeaUsernameCache(address),
    bustOpenSeaCollectionsCache(address),
  ]);
}
