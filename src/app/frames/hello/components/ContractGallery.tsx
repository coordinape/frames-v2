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

export default async function ContractGallery({ address, openSeaCollections = [] }: ContractGalleryProps) {
  const contracts = await getNFTContracts(address);

  return (
    <div className="space-y-8">
      {/* OpenSea Collections */}
      {openSeaCollections && openSeaCollections.length > 0 && (
        <>
          <h3 className="text-xl font-bold text-white mb-4 base-pixel">Latest onchain work</h3>
          <div className="grid grid-cols-2 gap-4">
            {openSeaCollections.map((collection, index) => (
              <div key={collection.id || index} className="bg-white/8 rounded-md overflow-hidden p-1">
                <div className="aspect-square overflow-hidden">
                  {collection.imageUrl ? (
                    <img src={collection.imageUrl} alt={collection.name || "Collection"} className="w-full h-full object-cover rounded-md" />
                  ) : (
                    <div className="w-full h-full bg-blue-800 flex items-center justify-center">
                      <span className="text-blue-100 text-sm">No Image</span>
                    </div>
                  )}
                </div>

                <div className="p-2">
                  <h4 className="text-white">{collection.name || "Unnamed Collection"}</h4>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
