import { OpenSeaCollection } from "~/app/features/directory/types";

interface ContractGalleryProps {
  address: string;
  openSeaCollections?: OpenSeaCollection[];
}

export default async function ContractGallery({
  openSeaCollections = [],
}: ContractGalleryProps) {
  return (
    <div className="space-y-8">
      {/* OpenSea Collections */}
      {openSeaCollections && openSeaCollections.length > 0 && (
        <>
          <h3 className="text-xl font-bold text-white mb-2 base-pixel">
            Latest onchain work
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {openSeaCollections.map((collection, index) => (
              <div
                key={collection.id || index}
                className="bg-white/8 rounded-md overflow-hidden p-1"
              >
                <div className="aspect-square overflow-hidden">
                  {collection.imageUrl ? (
                    <a
                      href={collection.openseaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={collection.imageUrl}
                        alt={collection.name || "Collection"}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </a>
                  ) : (
                    <div className="w-full h-full bg-blue-800 flex items-center justify-center">
                      <span className="text-blue-100 text-sm">No Image</span>
                    </div>
                  )}
                </div>
                <div className="p-2 space-y-1">
                  <div className="flex text-sm">
                    {collection.openseaUrl && (
                      <a
                        href={collection.openseaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/80 hover:text-white"
                      >
                        {collection.name || "OpenSea"}
                      </a>
                    )}
                    {collection.projectUrl && (
                      <a
                        href={collection.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Project
                      </a>
                    )}
                  </div>
                  {collection.contractAddress && (
                    <div className="text-white/50 text-xs font-mono">
                      <a
                        href={`https://basescan.org/address/${collection.contractAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white"
                      >
                        {`${collection.contractAddress.slice(
                          0,
                          6,
                        )}...${collection.contractAddress.slice(-4)}`}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
