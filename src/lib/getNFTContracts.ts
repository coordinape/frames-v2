import {AssetTransfersCategory} from "alchemy-sdk";
import {alchemy} from "~/lib/alchemy";
import {viemConnector} from "@farcaster/auth-client";
import {isAddress} from "viem";


// First, get the username from the address
async function getOpenSeaUsernameFromAddress(address: string) {
  try {
    const response = await fetch(
      `https://api.opensea.io/api/v2/accounts/${address}`,
      {
        method: 'GET',
        headers: {
          'x-api-key': process.env.OPENSEA_API_KEY!,
          'accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`OpenSea API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.username || null;
  } catch (error) {
    console.error('Error fetching account from OpenSea:', error);
    throw error;
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

// Then get collections by username
export async function getNFTContracts(deployerAddress: string) {
  try {
    // First get the username
    const username = await getOpenSeaUsernameFromAddress(deployerAddress);
    
    if (!username) {
      throw new Error('No OpenSea username found for this address');
    }
    
    // Then get the collections
    const response = await fetch(
      `https://api.opensea.io/api/v2/collections?creator_username=${username}`,
      {
        method: 'GET',
        headers: {
          'x-api-key': process.env.OPENSEA_API_KEY!,
          'accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`OpenSea API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract detailed information from collections
    const contractDetails: ContractDetails[] = data.collections.map((collection: OpenSeaCollection): ContractDetails => ({
      name: collection.name,
      contractAddress: collection.contract,
      chainId: collection.chain?.name || 'unknown',
      imageUrl: collection.image_url,
      bannerImageUrl: collection.banner_image_url,
      description: collection.description,
      slug: collection.slug,
      createdDate: collection.created_date,
      totalSupply: collection.total_supply,
      externalUrl: collection.external_url,
      discordUrl: collection.discord_url,
      twitterUsername: collection.twitter_username
    }));
    
    return contractDetails;
  } catch (error) {
    console.error('Error fetching collection details from OpenSea:', error);
    throw error;
  }
}
