import { getNFTContracts } from "~/lib/getNFTContracts";

interface OpenSeaCollection {
  id?: string;
  name?: string;
  imageUrl?: string;
}

interface ContractGalleryProps {
  address: string;
  openSeaCollections?: OpenSeaCollection[];
}

export default async function ContractGallery({
  address,
  openSeaCollections = [],
}: ContractGalleryProps) {
  const contracts = await getNFTContracts(address);

  return (
    <div className="space-y-8">
      {/* OpenSea Collections */}
      {openSeaCollections && openSeaCollections.length > 0 && (
        <div className="bg-blue-500 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">NFT Collections</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {openSeaCollections.map((collection, index) => (
              <div
                key={collection.id || index}
                className="bg-blue-400/50 rounded-lg overflow-hidden"
              >
                <div className="aspect-square overflow-hidden">
                  {collection.imageUrl ? (
                    <img
                      src={collection.imageUrl}
                      alt={collection.name || "Collection"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-400 flex items-center justify-center">
                      <span className="text-blue-100 text-sm">No Image</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h4 className="text-white font-medium">
                    {collection.name || "Unnamed Collection"}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
