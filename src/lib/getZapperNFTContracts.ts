"use server";

import { kv } from "@vercel/kv";

const CACHE_DURATION = 3600 * 1000 * 24; // 24 hours in milliseconds

// Types for Zapper API response
type Network = string;
type Address = string;

interface MediaAsset {
  thumbnail?: string;
  original?: string;
  large?: string;
}

interface Media {
  logo: MediaAsset;
  banner: MediaAsset;
}

interface FloorPriceDenomination {
  symbol: string;
  network: Network;
  address: string;
}

interface FloorPrice {
  valueUsd: number;
  valueWithDenomination: number;
  denomination: FloorPriceDenomination;
}

interface SocialLink {
  name: string;
  label: string;
  url: string;
  logoUrl: string;
}

interface NFTCollection {
  id: string;
  address: string;
  name: string;
  symbol: string;
  description: string;
  network: Network;
  nftStandard: string;
  type: string;
  supply: number;
  totalSupply: number;
  holdersCount: number;
  circulatingSupply: number;
  floorPrice: FloorPrice;
  medias: Media;
  socialLinks: SocialLink[];
  deployer: string;
}

interface PageInfo {
  hasNextPage: boolean;
  endCursor: string;
  startCursor: string;
  hasPreviousPage: boolean;
}

interface ZapperResponse {
  data: {
    nftCollectionsForDeployers: {
      edges: Array<{
        node: NFTCollection;
      }>;
      pageInfo: PageInfo;
    };
  };
}

// Helper function to generate consistent cache keys
function generateCacheKey(type: string, identifier: string): string {
  return `zapper-${type}-${identifier}`.toLowerCase();
}

async function fetchWithCache<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
): Promise<T> {
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

export interface ContractDetails {
  name: string;
  contractAddress: string;
  chainId: string;
  imageUrl: string;
  bannerImageUrl: string;
  description: string;
  symbol: string;
  nftStandard: string;
  type: string;
  supply: number;
  totalSupply: number;
  holdersCount: number;
  circulatingSupply: number;
  floorPriceUsd?: number;
  floorPriceNative?: number;
  floorPriceCurrency?: string;
  socialLinks: SocialLink[];
}

function filterCollectionsByChain(
  collections: ContractDetails[],
  chain: string,
): ContractDetails[] {
  return collections.filter((collection) => collection.chainId === chain);
}

export async function getZapperNFTContracts(
  deployerAddress: string,
  chain?: string,
  first: number = 100,
) {
  const cacheKey = generateCacheKey("collections", deployerAddress);

  return fetchWithCache<ContractDetails[]>(cacheKey, async () => {
    try {
      const query = `
        query DeployerCollections($deployers: [Address!], $networks: [Network!]!, $first: Int, $after: String) {
          nftCollectionsForDeployers(input: { deployers: $deployers, networks: $networks, first: $first, after: $after }) {
            edges {
              node {
                id
                address
                name
                symbol
                description
                network
                nftStandard
                type
                supply
                totalSupply
                holdersCount
                circulatingSupply
                floorPrice {
                  valueUsd
                  valueWithDenomination
                  denomination {
                    symbol
                    network
                    address
                  }
                }
                medias {
                  logo {
                    thumbnail
                    original
                  }
                  banner {
                    original
                    large
                  }
                }
                socialLinks {
                  name
                  label
                  url
                  logoUrl
                }
                deployer
              }
            }
            pageInfo {
              hasNextPage
              endCursor
              startCursor
              hasPreviousPage
            }
          }
        }
      `;

      const variables = {
        deployers: [deployerAddress],
        networks: chain 
          ? [chain.toUpperCase()] 
          : ["ETHEREUM_MAINNET", "OPTIMISM_MAINNET", "POLYGON_MAINNET", "ARBITRUM_MAINNET", "BASE_MAINNET"],
        first,
      };

      const response = await fetch("https://public.zapper.xyz/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-zapper-api-key": process.env.ZAPPER_API_KEY || "",
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      if (!response.ok) {
        throw new Error(`Zapper API error: ${response.status}`);
      }

      const data = (await response.json()) as ZapperResponse;
      
      console.log('Zapper API Response:', JSON.stringify(data, null, 2));

      if (!data || !data.data) {
        console.error('Invalid response structure from Zapper API:', data);
        throw new Error('Invalid response structure from Zapper API');
      }

      if (!data.data.nftCollectionsForDeployers) {
        console.error('No NFT collections data in response:', data);
        return [];
      }

      const contractDetails: ContractDetails[] = data.data.nftCollectionsForDeployers.edges
        .filter(({ node }) => node?.address && typeof node.address === 'string')
        .map(({ node }) => ({
          name: node.name,
          contractAddress: node.address.toLowerCase(),
          chainId: node.network,
          imageUrl: node.medias?.logo?.original || node.medias?.logo?.thumbnail || "",
          bannerImageUrl: node.medias?.banner?.original || node.medias?.banner?.large || "",
          description: node.description,
          symbol: node.symbol,
          nftStandard: node.nftStandard,
          type: node.type,
          supply: node.supply,
          totalSupply: node.totalSupply,
          holdersCount: node.holdersCount,
          circulatingSupply: node.circulatingSupply,
          floorPriceUsd: node.floorPrice?.valueUsd,
          floorPriceNative: node.floorPrice?.valueWithDenomination,
          floorPriceCurrency: node.floorPrice?.denomination?.symbol,
          socialLinks: node.socialLinks,
        }));

      return chain ? filterCollectionsByChain(contractDetails, chain) : contractDetails;
    } catch (error) {
      console.error("Error fetching collection details from Zapper:", error);
      throw error;
    }
  });
}

export async function bustCache(cacheKey: string): Promise<void> {
  await kv.del(cacheKey);
  console.log(`Busted KV cache for ${cacheKey}`);
}

export async function bustZapperCollectionsCache(address: string): Promise<void> {
  await bustCache(generateCacheKey("collections", address));
} 