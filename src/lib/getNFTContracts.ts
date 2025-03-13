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

async function fetchWithCache<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  if (LOCAL_CACHE) {
    return fetchWithLocalCache(cacheKey, fetchFn);
  }

  const cachedData = await kv.get(cacheKey);
  if (cachedData) {
    console.log(`Cache hit for ${cacheKey}`);
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
  fetchFn: () => Promise<T>
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
  name: string;
  contract: string;
  chain?: {
    name: string;
  };
  image_url: string;
  banner_image_url: string;
  description: string;
  slug: string;
  created_date: string;
  total_supply: number;
  external_url: string;
  discord_url: string;
  twitter_username: string;
}

interface ContractDetails {
  name: string;
  contractAddress: string;
  chainId: string;
  imageUrl: string;
  bannerImageUrl: string;
  description: string;
  slug: string;
  createdDate: string;
  totalSupply: number;
  externalUrl: string;
  discordUrl: string;
  twitterUsername: string;
}

// First, get the username from the address
async function getOpenSeaUsernameFromAddress(address: string) {
  const cacheKey = `opensea-username-${address}`;

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
          next: {
            revalidate: 3600,
            tags: [`opensea-username-${address}`],
          },
        }
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
export async function getNFTContracts(deployerAddress: string) {
  const cacheKey = `opensea-collections-${deployerAddress}`;

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
          next: {
            revalidate: 3600,
            tags: [`opensea-collections-${deployerAddress}`],
          },
        }
      );

      if (!response.ok) {
        throw new Error(`OpenSea API error: ${response.status}`);
      }

      const data = await response.json();

      // Extract detailed information from collections
      const contractDetails: ContractDetails[] = data.collections.map(
        (collection: OpenSeaCollection): ContractDetails => ({
          name: collection.name,
          contractAddress: collection.contract,
          chainId: collection.chain?.name || "unknown",
          imageUrl: collection.image_url,
          bannerImageUrl: collection.banner_image_url,
          description: collection.description,
          slug: collection.slug,
          createdDate: collection.created_date,
          totalSupply: collection.total_supply,
          externalUrl: collection.external_url,
          discordUrl: collection.discord_url,
          twitterUsername: collection.twitter_username,
        })
      );

      return contractDetails;
    } catch (error) {
      console.error("Error fetching collection details from OpenSea:", error);
      throw error;
    }
  });
}
