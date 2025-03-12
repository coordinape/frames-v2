"use client";

import { useEffect, useState } from "react";
import sdk, { type Context } from "@farcaster/frame-sdk";
import { getCreators } from "~/app/features/directory/actions";

// Update the Creator type to match what's returned from the API
type Creator = {
  id: string;
  address: string;
  name: string;
  avatar: string;
  bio: string;
};

export default function CreatorsClient() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    async function fetchCreators() {
      try {
        setLoading(true);
        const data = await getCreators();
        setCreators(data);
      } catch (err) {
        console.error("Failed to fetch creators:", err);
        setError("Failed to load creators. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchCreators();
  }, []);

  const filteredCreators = creators.filter((creator) => {
    const matchesRegion =
      selectedRegion === "All" || creator.address.includes(selectedRegion);
    const matchesCategory =
      selectedCategory === "All" || creator.name.includes(selectedCategory);
    return matchesRegion && matchesCategory;
  });

  if (loading) {
    return <div className="p-4 text-center">Loading creators...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (creators.length === 0) {
    return <div className="p-4 text-center">No creators found.</div>;
  }

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
                  (window.location.href = `/creators/${creator.address}`)
                }
              >
                <div className="flex items-center mb-4">
                  {creator.avatar ? (
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      className="w-16 h-16 rounded-full mr-4"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">{creator.name.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {creator.name}
                    </h2>
                    <p className="text-white/80">{creator.address}</p>
                  </div>
                </div>

                {creator.bio && (
                  <p className="text-white/80">{creator.bio}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
