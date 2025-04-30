"use client";

import { OpenSeaCollection } from "~/app/features/directory/types";
import ExternalLinkButton from "./ExternalLinkButton";

interface ContractGalleryProps {
  address: string;
  nftCollections: OpenSeaCollection[];
  maxItems?: number;
  showDetails?: boolean;
}

export default function ContractGallery({
  nftCollections,
  maxItems,
  showDetails = true,
}: ContractGalleryProps) {
  const displayCollections = nftCollections.slice(0, maxItems);

  return (
    <div className="space-y-8">
      {/* OpenSea Collections */}
      {displayCollections && displayCollections.length > 0 && (
        <>
          {showDetails && (
            <h3 className="text-xl font-bold text-white mb-2 base-pixel">
              Latest onchain work
            </h3>
          )}
          <div
            className={`grid ${maxItems === 3 ? "grid-cols-3" : "grid-cols-2"} gap-4`}
          >
            {displayCollections.map((collection, index) => (
              <div
                key={collection.id || index}
                className={`${showDetails ? "bg-white/8" : ""} rounded-md overflow-hidden ${showDetails ? "p-1" : ""}`}
              >
                <div className="aspect-square overflow-hidden">
                  {collection.imageUrl ? (
                    showDetails ? (
                      <ExternalLinkButton
                        url={collection.openseaUrl || ""}
                        className="w-full h-full cursor-pointer"
                      >
                        <img
                          src={collection.imageUrl}
                          alt={collection.name || "Collection"}
                          className="w-full h-full object-cover rounded-md aspect-square"
                        />
                      </ExternalLinkButton>
                    ) : (
                      <div className="cursor-default">
                        <img
                          src={collection.imageUrl}
                          alt={collection.name || "Collection"}
                          className="w-full h-full object-cover rounded-md aspect-square"
                        />
                      </div>
                    )
                  ) : (
                    <div className="w-full h-full bg-blue-800 flex items-center justify-center">
                      <span className="text-blue-100 text-sm">No Image</span>
                    </div>
                  )}
                </div>
                {showDetails && (
                  <div className="p-2 space-y-1">
                    <div className="flex text-sm">
                      {collection.openseaUrl && (
                        <ExternalLinkButton
                          url={collection.openseaUrl}
                          className="text-white/80 hover:text-white cursor-pointer"
                        >
                          {collection.name || "OpenSea"}
                        </ExternalLinkButton>
                      )}
                      {collection.projectUrl && (
                        <ExternalLinkButton
                          url={collection.projectUrl}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          Project
                        </ExternalLinkButton>
                      )}
                    </div>
                    {collection.contractAddress && (
                      <div className="text-white/50 text-xs font-mono">
                        <ExternalLinkButton
                          url={`https://basescan.org/address/${collection.contractAddress}`}
                          className="hover:text-white"
                        >
                          {`${collection.contractAddress.slice(
                            0,
                            6,
                          )}...${collection.contractAddress.slice(-4)}`}
                        </ExternalLinkButton>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
