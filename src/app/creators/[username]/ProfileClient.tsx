"use client";

import { useEffect, useState } from "react";
import sdk, { type Context } from "@farcaster/frame-sdk";

interface TokenInfo {
  symbol: string;
  price: number;
  marketCap: number;
  earnings: number;
}

interface NFT {
  id: string;
  title: string;
  image: string;
  price: number;
}

interface Profile {
  username: string;
  profilePicture: string;
  location: string;
  credentials: string[];
  tokenInfo: TokenInfo;
  nfts: NFT[];
}

interface ProfileClientProps {
  username: string;
}

export default function ProfileClient({ username }: ProfileClientProps) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();

  // Mock data - would come from your backend
  const [profile] = useState<Profile>({
    username: username,
    profilePicture: "https://api.samplefaces.com/face?width=300",
    location: "San Francisco, CA",
    credentials: ["verified by grails", "cartoon"],
    tokenInfo: {
      symbol: "$GDUP",
      price: 0.0045,
      marketCap: 450000,
      earnings: 12500,
    },
    nfts: [
      {
        id: "1",
        title: "Cosmic Dreams #1",
        image: "https://api.samplefaces.com/face?width=400",
        price: 0.5,
      },
      {
        id: "2",
        title: "Digital Horizons #7",
        image: "https://api.samplefaces.com/face?width=401",
        price: 0.75,
      },
      // Add more NFTs...
    ],
  });

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      setContext(context);
      console.log("Profile Frame: Calling ready");
      sdk.actions.ready({});
    };

    if (sdk && !isSDKLoaded) {
      console.log("Profile Frame: Calling load");
      setIsSDKLoaded(true);
      load();
      return () => {
        sdk.removeAllListeners();
      };
    }
  }, [isSDKLoaded]);

  const copyContractAddress = () => {
    // Mock contract address
    navigator.clipboard.writeText("0x1234...5678");
    // Add toast notification here
  };

  const openSwap = () => {
    // Open swap interface
    window.open("https://app.uniswap.org/", "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 to-pink-500">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <img
                src={profile.profilePicture}
                alt={profile.username}
                className="w-24 h-24 rounded-full mr-6"
              />
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {profile.username}
                </h1>
                <p className="text-white/80">{profile.location}</p>
                <div className="flex gap-2 mt-2">
                  {profile.credentials.map((credential, index) => (
                    <span
                      key={index}
                      className="bg-white/20 text-white text-sm px-3 py-1 rounded-full"
                    >
                      {credential}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Token Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white/5 rounded-lg">
              <div>
                <p className="text-white/60 text-sm">Token</p>
                <p className="text-white text-xl font-bold">
                  {profile.tokenInfo.symbol}
                </p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Price</p>
                <p className="text-white text-xl font-bold">
                  ${profile.tokenInfo.price}
                </p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Market Cap</p>
                <p className="text-white text-xl font-bold">
                  ${profile.tokenInfo.marketCap.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Earnings</p>
                <p className="text-white text-xl font-bold">
                  ${profile.tokenInfo.earnings.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={copyContractAddress}
                className="flex-1 bg-white/10 text-white px-6 py-3 rounded-lg hover:bg-white/20 transition-colors"
              >
                Copy CA
              </button>
              <button
                onClick={openSwap}
                className="flex-1 bg-white text-purple-700 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
              >
                Swap
              </button>
            </div>
          </div>

          {/* NFT Gallery */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Latest Work</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.nfts.map((nft) => (
                <div
                  key={nft.id}
                  className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden"
                >
                  <img
                    src={nft.image}
                    alt={nft.title}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-white font-semibold mb-2">
                      {nft.title}
                    </h3>
                    <p className="text-white/80">{nft.price} ETH</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}