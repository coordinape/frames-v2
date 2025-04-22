import {
  getOpenseaNFTContracts,
  ContractDetails as OpenSeaContractDetails,
} from "./getOpenseaNFTContracts";
import {
  getZapperNFTContracts,
  getZapperNFTCollectionsForOwners,
  ContractDetails as ZapperContractDetails,
} from "./getZapperNFTContracts";
import { debugLog, debugError } from "./constants";

export interface NFTContractDetails {
  name: string;
  contractAddress: string;
  chainId: string;
  imageUrl: string;
  bannerImageUrl: string;
  description: string;
  openseaUrl?: string;
  projectUrl?: string;
  discordUrl?: string;
  twitterUsername?: string;
  symbol?: string;
  nftStandard?: string;
  type?: string;
  supply?: number;
  totalSupply?: number;
  holdersCount?: number;
  circulatingSupply?: number;
  floorPriceUsd?: number;
  floorPriceNative?: number;
  floorPriceCurrency?: string;
  apiOriginSource?: string;
  fetchedAt: string; // Timestamp string in PST
  socialLinks?: Array<{
    name: string;
    label: string;
    url: string;
    logoUrl: string;
  }>;
}

function mergeContractDetails(
  openSeaContract: OpenSeaContractDetails | undefined,
  zapperContract: ZapperContractDetails | undefined,
): NFTContractDetails {
  if (!openSeaContract && !zapperContract) {
    throw new Error("At least one contract must be provided");
  }

  const base = openSeaContract || zapperContract!;
  const other = openSeaContract ? zapperContract : undefined;

  return {
    ...base,
    ...(other && {
      symbol: other.symbol,
      nftStandard: other.nftStandard,
      type: other.type,
      supply: other.supply,
      totalSupply: other.totalSupply,
      holdersCount: other.holdersCount,
      circulatingSupply: other.circulatingSupply,
      floorPriceUsd: other.floorPriceUsd,
      floorPriceNative: other.floorPriceNative,
      floorPriceCurrency: other.floorPriceCurrency,
      socialLinks: other.socialLinks,
    }),
    apiOriginSource: openSeaContract ? "OpenSea" : "Zapper",
    fetchedAt: Date.now().toString(), // Add current timestamp in milliseconds
  };
}

export async function getNFTContracts(
  deployerAddress: string,
  chain?: string,
  options: {
    excludeNoImage?: boolean;
  } = { excludeNoImage: true },
): Promise<NFTContractDetails[]> {
  try {
    // Fetch contracts from all three sources in parallel
    const [openSeaContracts, zapperContracts, zapperOwnerContracts] =
      await Promise.all([
        getOpenseaNFTContracts(deployerAddress, chain).catch((error) => {
          debugError("Error fetching OpenSea contracts:", error);
          return [];
        }),
        getZapperNFTContracts(deployerAddress, chain).catch((error) => {
          debugError("Error fetching Zapper deployer contracts:", error);
          return [];
        }),
        getZapperNFTCollectionsForOwners(deployerAddress, chain).catch(
          (error) => {
            debugError("Error fetching Zapper owner contracts:", error);
            return [];
          },
        ),
      ]);

    debugLog(
      `OpenSea returned ${openSeaContracts.length} NFT contracts for address ${deployerAddress}`,
    );
    debugLog(
      `Zapper deployer returned ${zapperContracts.length} NFT contracts for address ${deployerAddress}`,
    );
    debugLog(
      `Zapper owner returned ${zapperOwnerContracts.length} NFT contracts for address ${deployerAddress}`,
    );

    // Create a map to store merged contracts by address
    const contractMap = new Map<string, NFTContractDetails>();

    // some contracts with no contractAddress are bogus spam contracts

    // Process OpenSea contracts first
    for (const contract of openSeaContracts.filter(
      (contract) => contract.contractAddress,
    )) {
      contractMap.set(
        contract.contractAddress.toLowerCase(),
        mergeContractDetails(contract, undefined),
      );
    }

    // Merge or add Zapper deployer contracts
    for (const contract of zapperContracts) {
      const address = contract.contractAddress.toLowerCase();
      const existing = contractMap.get(address);
      if (existing) {
        contractMap.set(
          address,
          mergeContractDetails(existing as OpenSeaContractDetails, contract),
        );
      } else {
        contractMap.set(address, mergeContractDetails(undefined, contract));
      }
    }

    // Merge or add Zapper owner contracts
    for (const contract of zapperOwnerContracts) {
      const address = contract.contractAddress.toLowerCase();
      const existing = contractMap.get(address);
      if (existing) {
        contractMap.set(
          address,
          mergeContractDetails(existing as OpenSeaContractDetails, contract),
        );
      } else {
        contractMap.set(address, mergeContractDetails(undefined, contract));
      }
    }

    let results = Array.from(contractMap.values());

    // Filter out NFTs without images if the option is enabled
    if (options.excludeNoImage) {
      results = results.filter(
        (nft) => nft.imageUrl && nft.imageUrl.trim() !== "",
      );
      debugLog(
        `Filtered out ${contractMap.size - results.length} NFTs without images`,
      );
    }

    debugLog(`Total unique NFT contracts after merging: ${results.length}`);
    return results;
  } catch (error) {
    debugError("Error fetching NFT contracts:", error);
    throw error;
  }
}
