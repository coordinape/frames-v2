"use client";

import { useEffect, useState } from "react";
import sdk, { type Context } from "@farcaster/frame-sdk";

interface Creator {
  id: string;
  username: string;
  profilePicture: string;
  location: string;
  category: string;
  credentials: string[];
}

export default function CreatorsClient() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Mock data - would come from your backend
  const [creators] = useState<Creator[]>([
    {
      id: "1",
      username: "alice.base",
      profilePicture: "https://api.samplefaces.com/face?width=200",
      location: "San Francisco, CA",
      category: "Memes",
      credentials: ["verified by grails", "cartoon"],
    },
    // Add more mock creators...
  ]);

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      setContext(context);
      console.log("Directory Frame: Calling ready");
      sdk.actions.ready({});
    };

    if (sdk && !isSDKLoaded) {
      console.log("Directory Frame: Calling load");
      setIsSDKLoaded(true);
      load();
      return () => {
        sdk.removeAllListeners();
      };
    }
  }, [isSDKLoaded]);

  const filteredCreators = creators.filter((creator) => {
    const matchesRegion =
      selectedRegion === "All" || creator.location.includes(selectedRegion);
    const matchesCategory =
      selectedCategory === "All" || creator.category === selectedCategory;
    return matchesRegion && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 to-pink-500">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Creator Directory</h1>
            <div className="flex space-x-4">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-white/10 text-white border border-white/20 rounded px-4 py-2"
              >
                <option value="All">All Regions</option>
                <option value="US">United States</option>
                <option value="EU">Europe</option>
                <option value="Asia">Asia</option>
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white/10 text-white border border-white/20 rounded px-4 py-2"
              >
                <option value="All">All Categories</option>
                <option value="Memes">Memes</option>
                <option value="Art">Art</option>
                <option value="Music">Music</option>
              </select>
            </div>
          </div>

          <p className="text-white mb-6">
            {filteredCreators.length} creators found
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCreators.map((creator) => (
              <div
                key={creator.id}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-colors cursor-pointer"
                onClick={() =>
                  (window.location.href = `/creators/${creator.username}`)
                }
              >
                <div className="flex items-center mb-4">
                  <img
                    src={creator.profilePicture}
                    alt={creator.username}
                    className="w-16 h-16 rounded-full mr-4"
                  />
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {creator.username}
                    </h2>
                    <p className="text-white/80">{creator.location}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {creator.credentials.map((credential, index) => (
                    <span
                      key={index}
                      className="bg-white/20 text-white text-sm px-3 py-1 rounded-full"
                    >
                      {credential}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
