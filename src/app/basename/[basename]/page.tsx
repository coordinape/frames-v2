'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import type { Nft, NftTokenType } from 'alchemy-sdk';

interface NFTContract {
  address: string;
  name: string;
  symbol: string;
  tokenType: NftTokenType;
  totalSupply: string;
  sampleNFTs: Nft[];
}

interface APIResponse {
  address: string;
  deployedNFTContracts: NFTContract[];
  network: string;
}

interface Props {
  params: Promise<{ basename: string }>;
}

function getNFTImage(nft: Nft): string | null {
  if (nft.raw.metadata?.image) {
    return nft.raw.metadata.image as string;
  }
  return null;
}

function getNFTTitle(nft: Nft): string {
  if (nft.raw.metadata?.name) {
    return nft.raw.metadata.name as string;
  }
  return `Token ID: ${nft.tokenId}`;
}

export default function BasenameProfile({ params }: Props) {
  const resolvedParams = use(params);
  const [data, setData] = useState<APIResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/ens/${resolvedParams.basename}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.basename]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No Data Found</h1>
          <p className="text-gray-700">No information found for {resolvedParams.basename}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{resolvedParams.basename}</h1>
          <p className="text-gray-600 mb-2">Address: {data.address}</p>
          <p className="text-gray-600 mb-4">Network: Base Mainnet</p>
        </div>

        {data.deployedNFTContracts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8 text-center">
            <p className="text-gray-600">No NFT contracts deployed by this address on Base.</p>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Deployed NFT Contracts</h2>
            {data.deployedNFTContracts.map((contract, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <div className="border-b pb-4 mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {contract.name} ({contract.symbol})
                  </h3>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Contract:</span>{' '}
                      <code className="bg-gray-100 px-2 py-1 rounded">{contract.address}</code>
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Type:</span> {contract.tokenType}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Total Supply:</span> {contract.totalSupply}
                    </p>
                  </div>
                </div>

                {contract.sampleNFTs.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Sample NFTs</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {contract.sampleNFTs.map((nft, nftIndex) => {
                        const imageUrl = getNFTImage(nft);
                        const title = getNFTTitle(nft);
                        
                        return (
                          <div key={nftIndex} className="bg-gray-50 rounded-lg p-4">
                            {imageUrl ? (
                              <div className="h-48 mb-4">
                                <img
                                  src={imageUrl}
                                  alt={title}
                                  className="w-full h-full rounded-lg object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                                <p className="text-gray-400">No image</p>
                              </div>
                            )}
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {title}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 