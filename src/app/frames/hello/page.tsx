import { Metadata } from "next";
import App from "~/app/app";
import {findAllRelatedContractDeployments, getDeployedContracts, getNFTContracts} from "~/lib/getNFTContracts";

const appUrl = process.env.NEXT_PUBLIC_URL;

const frame = {
  version: "next",
  imageUrl: `${appUrl}/frames/hello/opengraph-image`,
  button: {
    title: "Launch Frame",
    action: {
      type: "launch_frame",
      name: "Farcaster Frames v2 Demo",
      url: `${appUrl}/frames/hello/`,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#f7f7f7",
    },
  },
};

export const metadata: Metadata = {
  title: "Hello, world!",
  description: "A simple hello world frame",
  openGraph: {
    title: "Hello, world!",
    description: "A simple hello world frame",
  },
  other: {
    "fc:frame": JSON.stringify(frame),
  },
};

export default async function HelloFrame() {
  const addr = '0x333d0EBc54707c0a9D92caC749B3094c28a0E111';
  const contracts = await getNFTContracts(addr);
  
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
            {/* <div className="space-y-3">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 font-medium">Contract Address</span>
                <span className="font-mono text-sm text-gray-700 truncate">{contract.contractAddress}</span>
              </div>
              {contract.totalSupply && (
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 font-medium">Total Supply</span>
                  <span className="text-sm text-gray-700">{contract.totalSupply.toString()}</span>
                </div>
              )}
            </div> */}
          </div>
        </div>
      ))}
    </div>
  );
}
