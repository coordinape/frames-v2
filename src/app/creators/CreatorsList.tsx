"use client";

import { useEffect, useState } from "react";
import sdk from "@farcaster/frame-sdk";
import { getCreators } from "~/app/features/directory/actions";
import { CreatorWithOpenSeaData } from "~/app/features/directory/types";
import Header from "../components/Header";
import Link from "next/link";

export default function CreatorsList() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [creators, setCreators] = useState<CreatorWithOpenSeaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      await sdk.context;
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
        // Get creators with OpenSea data and basename resolution already included from the server action
        const creatorsWithData = await getCreators();
        setCreators(creatorsWithData);
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
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      creator.name.toLowerCase().includes(query) ||
      creator.address.toLowerCase().includes(query) ||
      creator.resolution?.basename?.toLowerCase().includes(query) ||
      creator.bio?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl base-pixel">Loading creators...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">{error}</div>
      </div>
    );
  }

  return (
    <>
      <Header />

      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold text-white mb-4 base-pixel">
          Creators
        </h1>
        <p className="text-white">Explore the top creators on base.</p>
      </div>

      <div className="relative mb-10">
        <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full border border-white/20 px-4">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
          <input
            type="text"
            placeholder="Name, Skill, Medium, Location..."
            className="w-full bg-transparent border-none text-white py-3 px-2 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </div>
      </div>

      <p className="text-white mb-4 font-medium text-sm">
        {filteredCreators.length} CREATORS FOUND
      </p>

      <div className="space-y-4">
        {filteredCreators.map((creator) => (
          <Link
            href={`/creators/${
              creator.resolution?.basename || creator.address
            }`}
            key={creator.id}
            className="block"
          >
            <div className="border-2 border-white/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {creator.avatar ? (
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                  ) : (
                    <div className="bg-white/70 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-700">
                        {creator.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h2 className="text-white">
                      {creator.resolution?.basename || creator.name}
                    </h2>
                  </div>
                </div>
                <div className="opacity-40">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                {creator.openSeaData?.collections &&
                creator.openSeaData.collections.length > 0 ? (
                  creator.openSeaData.collections
                    .slice(0, 3)
                    .map((collection, index) => (
                      <div
                        key={collection.id || index}
                        className="aspect-square overflow-hidden rounded-lg"
                      >
                        {collection.imageUrl ? (
                          <img
                            src={collection.imageUrl}
                            alt={collection.name || "Collection"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-blue-100 text-xs">
                              No Image
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                ) : (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-white/10 aspect-square overflow-hidden rounded-lg flex items-center justify-center"
                      >
                        <span className="text-white/80 text-xs font-medium">
                          No NFT
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
