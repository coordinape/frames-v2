import { NextRequest } from 'next/server';
import { alchemy } from '~/lib/alchemy';
import { isAddress, keccak256, toHex, getAddress } from 'viem';
import type { Nft, NftTokenType, AssetTransfersCategory, Alchemy } from 'alchemy-sdk';

// Base Name Service contract addresses (checksummed)
const BASE_REGISTRAR_ADDRESS = '0x03c4738ee98ae44591e1a4a4f3cab6641d95dd9a';  // BaseRegistrar
const BASE_RESOLVER_ADDRESS = '0xC6d566A56A1aFf6508b41f6c90ff131615583BCD';   // L2Resolver
const BASE_REGISTRY_ADDRESS = '0xb94704422c2a1e396835a571837aa5ae53285a95';   // Registry

interface NFTContract {
  address: string;
  name: string;
  symbol: string;
  tokenType: NftTokenType;
  totalSupply: string;
  sampleNFTs: Nft[];
}

interface BaseNameInfo {
  name: string;
  owner: string;
  resolver: string;
  ttl: string;
  records: {
    contentHash?: string;
    texts?: { key: string; value: string }[];
    addresses?: { coin: string; address: string }[];
  };
}

// Helper function to retry operations
async function retry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  throw lastError;
}

// Helper function to normalize a Base name
function normalizeBaseName(name: string): string {
  // Convert to lowercase
  name = name.toLowerCase();
  
  // Remove any trailing .base suffix
  if (name.endsWith('.base')) {
    name = name.slice(0, -5);
  }
  
  // Add .base.eth suffix if not present
  if (!name.endsWith('.base.eth')) {
    name = name + '.base.eth';
  }
  
  return name;
}

// Helper function to get name hash
function nameHash(name: string): string {
  console.log('Computing namehash for:', name);
  let node = '0000000000000000000000000000000000000000000000000000000000000000';
  if (name) {
    let labels = name.split('.');
    console.log('Labels:', labels);
    for(let i = labels.length - 1; i >= 0; i--) {
      let labelHash = keccak256(toHex(labels[i]));
      console.log(`Label "${labels[i]}" hash:`, labelHash);
      node = keccak256(toHex(node + labelHash.slice(2)));
      console.log('Intermediate node:', node);
    }
  }
  console.log('Final namehash:', node);
  return node;
}

// Helper function to get Base name information
async function getBaseNameInfo(name: string): Promise<BaseNameInfo | null> {
  try {
    console.log('Starting getBaseNameInfo for:', name);
    const normalizedName = normalizeBaseName(name);
    console.log('Normalized name:', normalizedName);
    
    // Get the label (remove .base.eth)
    const label = normalizedName.replace(/\.base\.eth$/, '');
    console.log('Label:', label);
    
    // Get the label hash
    const labelHash = keccak256(toHex(label));
    console.log('Label hash:', labelHash);

    // Get owner from BaseRegistrar
    console.log('Calling BaseRegistrar.ownerOf...');
    const registrarOwnerData = await alchemy.core.call({
      to: getAddress(BASE_REGISTRAR_ADDRESS),
      data: `0x6352211e${labelHash.slice(2)}`, // ownerOf(uint256)
    });
    
    console.log('REGISTRAR OWNER DATA:', {registrarOwnerData});
    
    if (registrarOwnerData === '0x' || registrarOwnerData === '0x0000000000000000000000000000000000000000000000000000000000000000') {
      console.log(`Base name ${normalizedName} is not registered (no owner)`);
      return null;
    }
    
    const owner = getAddress(`0x${registrarOwnerData.slice(-40)}`);
    console.log('Found owner:', owner);

    // Get the full namehash for resolver queries
    const node = nameHash(normalizedName);
    console.log('Full namehash for resolver:', node);

    // Get resolver from Registry
    console.log('Getting resolver from Registry...');
    const resolverData = await alchemy.core.call({
      to: getAddress(BASE_REGISTRY_ADDRESS),
      data: `0x0178b8bf${node.slice(2)}`, // resolver(bytes32)
    });
    
    console.log('RESOLVER DATA:', {resolverData});
    
    // Use L2Resolver if no custom resolver is set
    let resolver;
    if (resolverData === '0x' || resolverData === '0x0000000000000000000000000000000000000000000000000000000000000000') {
      console.log('No custom resolver set, using L2Resolver');
      resolver = getAddress(BASE_RESOLVER_ADDRESS);
    } else {
      resolver = getAddress(`0x${resolverData.slice(-40)}`);
      console.log('Found custom resolver:', resolver);
    }

    // Get content hash if available
    console.log('Getting content hash from resolver...');
    let contentHash;
    try {
      const contentHashData = await alchemy.core.call({
        to: resolver,
        data: `0xbc1c58d1${node.slice(2)}`, // contenthash(bytes32)
      });
      console.log('CONTENT HASH DATA:', {contentHashData});
      // Check if the content hash is an empty string (0x0000...0020...0000)
      if (contentHashData && contentHashData !== '0x' && !contentHashData.startsWith('0x0000000000000000000000000000000000000000000000000000000000000020')) {
        contentHash = contentHashData;
      }
    } catch (error) {
      console.error('Error getting content hash:', error);
    }

    // Get text records
    console.log('Getting text records...');
    const textKeys = ['email', 'url', 'avatar', 'description', 'notice', 'keywords', 'com.twitter', 'com.github'];
    const textRecords = await Promise.all(
      textKeys.map(async (key) => {
        try {
          console.log(`Getting text record for ${key}...`);
          const keyHash = keccak256(toHex(key));
          
          // Try text(bytes32,string) first
          try {
            const textData = await alchemy.core.call({
              to: resolver,
              data: `0x59d1d43c${node.slice(2)}${keyHash.slice(2).padStart(64, '0')}`, // text(bytes32,string)
            });
            console.log(`Text record for ${key} (string):`, textData);
            if (textData && textData !== '0x') {
              return { key, value: textData };
            }
          } catch (error) {
            console.log(`text(bytes32,string) failed for ${key}, trying text(bytes32,bytes32)...`);
          }
          
          // Try text(bytes32,bytes32)
          const textData = await alchemy.core.call({
            to: resolver,
            data: `0x59d1d43c${node.slice(2)}${keyHash.slice(2)}`, // text(bytes32,bytes32)
          });
          console.log(`Text record for ${key} (bytes32):`, textData);
          if (textData && textData !== '0x') {
            return { key, value: textData };
          }
        } catch (error) {
          console.error(`Error getting text record for ${key}:`, error);
        }
        return null;
      })
    );

    // Get coin addresses (ETH, BTC, etc.)
    console.log('Getting coin addresses...');
    const coinTypes = ['60', '0']; // ETH and BTC
    const addressRecords = await Promise.all(
      coinTypes.map(async (coinType) => {
        try {
          console.log(`Getting address for coin type ${coinType}...`);
          const addressData = await alchemy.core.call({
            to: resolver,
            data: `0xf1cb7e06${node.slice(2)}${parseInt(coinType).toString(16).padStart(64, '0')}`, // addr(bytes32,uint256)
          });
          console.log(`Address data for coin type ${coinType}:`, addressData);
          if (addressData && addressData !== '0x') {
            return { coin: coinType === '60' ? 'ETH' : 'BTC', address: getAddress(`0x${addressData.slice(-40)}`) };
          }
        } catch (error) {
          console.error(`Error getting address for coin type ${coinType}:`, error);
        }
        return null;
      })
    );

    console.log('Returning full Base name info');
    return {
      name: normalizedName,
      owner,
      resolver,
      ttl: '0', // Base might not use TTL
      records: {
        contentHash,
        texts: textRecords.filter((record): record is NonNullable<typeof record> => record !== null),
        addresses: addressRecords.filter((record): record is NonNullable<typeof record> => record !== null),
      }
    };
  } catch (error) {
    console.error('Error getting Base name info:', error);
    return null;
  }
}

// Helper function to check if a contract implements ERC721
async function isERC721Contract(alchemy: Alchemy, contractAddress: string): Promise<boolean> {
  try {
    // Check for ERC721 interface ID (0x80ac58cd)
    const supportsERC721 = await alchemy.core.call({
      to: contractAddress,
      data: "0x01ffc9a780ac58cd00000000000000000000000000000000000000000000000000000000",
    });
    
    return supportsERC721 === "0x0000000000000000000000000000000000000000000000000000000000000001";
  } catch (error) {
    return false;
  }
}

// Helper function to check if a contract implements ERC1155
async function isERC1155Contract(alchemy: Alchemy, contractAddress: string): Promise<boolean> {
  try {
    // Check for ERC1155 interface ID (0xd9b67a26)
    const supportsERC1155 = await alchemy.core.call({
      to: contractAddress,
      data: "0x01ffc9a7d9b67a2600000000000000000000000000000000000000000000000000000000",
    });
    
    return supportsERC1155 === "0x0000000000000000000000000000000000000000000000000000000000000001";
  } catch (error) {
    return false;
  }
}

async function findNFTContractsByDeployer(deployerAddress: string) {
  try {
    // Get all transactions from the deployer address
    const txs = await alchemy.core.getAssetTransfers({
      fromAddress: deployerAddress,
      category: ["EXTERNAL" as AssetTransfersCategory],
      excludeZeroValue: true,
      withMetadata: true,
      maxCount: 1000, // You may need to paginate for prolific deployers
    });
    
    // Filter for contract creation transactions
    // Contract creation transactions have null as the 'to' address
    const contractCreationTxs = txs.transfers.filter(tx => tx.to === null);
    
    // Get the contract addresses from the receipts
    const contractAddresses: string[] = [];
    
    for (const tx of contractCreationTxs) {
      const receipt = await alchemy.core.getTransactionReceipt(tx.hash);
      if (receipt && receipt.contractAddress) {
        // Check if the contract is an NFT contract (implements ERC721 or ERC1155)
        const isERC721 = await isERC721Contract(alchemy, receipt.contractAddress);
        const isERC1155 = await isERC1155Contract(alchemy, receipt.contractAddress);
        
        if (isERC721 || isERC1155) {
          contractAddresses.push(receipt.contractAddress);
        }
      }
    }
    
    return contractAddresses;
  } catch (error) {
    console.error("Error finding NFT contracts:", error);
    throw error;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ basename: string }> }
) {
  try {
    const resolvedParams = await params;
    const input = resolvedParams.basename;

    // If input is an address, use it directly
    if (isAddress(input)) {
      console.log('Input is an address, using directly:', input);
      const address = getAddress(input);
      
      try {
        // Find all NFT contracts deployed by this address
        const contractAddresses = await findNFTContractsByDeployer(address);
        console.log('contractAddresses', contractAddresses);
        if (contractAddresses.length === 0) {
          return Response.json({
            address: address,
            deployedNFTContracts: [],
            network: 'base',
          });
        }

        // Get metadata and sample NFTs for each contract
        const deployedContracts = await Promise.all(
          contractAddresses.map(async (contractAddress) => {
            try {
              const metadata = await retry(() => alchemy.nft.getContractMetadata(contractAddress));
              const nfts = await retry(() => alchemy.nft.getNftsForContract(contractAddress, {
                pageSize: 3,
              }));

              return {
                address: contractAddress,
                name: metadata.name || 'Unnamed Collection',
                symbol: metadata.symbol || 'N/A',
                tokenType: metadata.tokenType || 'unknown',
                totalSupply: metadata.totalSupply || 'N/A',
                sampleNFTs: nfts.nfts,
              };
            } catch (error) {
              console.error(`Error fetching contract data for ${contractAddress}:`, error);
              return null;
            }
          })
        );

        // Filter out nulls (failed lookups)
        const nftContracts = deployedContracts.filter((contract): contract is NFTContract => contract !== null);

        return Response.json({
          address: address,
          deployedNFTContracts: nftContracts,
          network: 'base',
        });
      } catch (error) {
        console.error('Failed to get contract data:', error);
        return Response.json({
          address: address,
          deployedNFTContracts: [],
          network: 'base',
        });
      }
    }

    // If input is not an address, try to resolve it as a Base name
    console.log('Input is not an address, trying to resolve as Base name:', input);
    const baseNameInfo = await getBaseNameInfo(input);
    
    if (!baseNameInfo) {
      return Response.json({ error: 'Invalid Base name' }, { status: 400 });
    }

    try {
      // Find all NFT contracts deployed by this address
      const contractAddresses = await findNFTContractsByDeployer(baseNameInfo.owner);
      console.log('contractAddresses', contractAddresses);
      if (contractAddresses.length === 0) {
        return Response.json({
          address: baseNameInfo.owner,
          deployedNFTContracts: [],
          network: 'base',
          baseNameInfo,
        });
      }

      // Get metadata and sample NFTs for each contract
      const deployedContracts = await Promise.all(
        contractAddresses.map(async (contractAddress) => {
          try {
            const metadata = await retry(() => alchemy.nft.getContractMetadata(contractAddress));
            const nfts = await retry(() => alchemy.nft.getNftsForContract(contractAddress, {
              pageSize: 3,
            }));

            return {
              address: contractAddress,
              name: metadata.name || 'Unnamed Collection',
              symbol: metadata.symbol || 'N/A',
              tokenType: metadata.tokenType || 'unknown',
              totalSupply: metadata.totalSupply || 'N/A',
              sampleNFTs: nfts.nfts,
            };
          } catch (error) {
            console.error(`Error fetching contract data for ${contractAddress}:`, error);
            return null;
          }
        })
      );

      // Filter out nulls (failed lookups)
      const nftContracts = deployedContracts.filter((contract): contract is NFTContract => contract !== null);

      return Response.json({
        address: baseNameInfo.owner,
        deployedNFTContracts: nftContracts,
        network: 'base',
        baseNameInfo,
      });
    } catch (error) {
      console.error('Failed to get contract data:', error);
      return Response.json({
        address: baseNameInfo.owner,
        deployedNFTContracts: [],
        network: 'base',
        baseNameInfo,
      });
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return Response.json(
      { error: 'Error fetching data' },
      { status: 500 }
    );
  }
}
