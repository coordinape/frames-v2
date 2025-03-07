import { getNFTContracts } from "~/lib/getNFTContracts";

interface ContractGalleryProps {
  address: string;
}

export default async function ContractGallery({ address }: ContractGalleryProps) {
  const contracts = await getNFTContracts(address);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-gray-50">
      {contracts.map((contract, index) => (
        <div 
          key={`${contract.contractAddress}-${index}`}
          className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="aspect-[16/9] relative bg-gray-100">
            {contract.bannerImageUrl ? (
              <img
                src={contract.bannerImageUrl}
                alt={`${contract.name} banner`}
                className="w-full h-full object-cover"
              />
            ) : contract.imageUrl ? (
              <img
                src={contract.imageUrl}
                alt={contract.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <span className="text-gray-400 text-lg">No Image</span>
              </div>
            )}
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-3 text-gray-800">{contract.name || 'Unnamed Contract'}</h2>
          </div>
        </div>
      ))}
    </div>
  );
} 