"use client";

import { useEffect, useState } from "react";
import sdk from "@farcaster/frame-sdk";
import { getCreators } from "~/app/features/directory/actions";
import { CreatorWithOpenSeaData } from "~/app/features/directory/types";
import Header from "../components/Header";
import Link from "next/link";
import ShareButton from "../components/ShareButton";
import ContractGallery from "~/app/components/ContractGallery";

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

    // Helper function to check and log matches
    const checkMatch = (field: string, value: string | undefined | null) => {
      if (!value) return false;
      return value.toLowerCase().includes(query);
    };

    return (
      checkMatch("name", creator.name) ||
      checkMatch("description", creator.description) ||
      checkMatch("address", creator.address) ||
      Object.entries(creator.resolution?.textRecords || {}).some(
        ([key, value]) => checkMatch(key, value),
      )
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
            placeholder="Search creators by name, creative medium, etc..."
            className="w-full bg-transparent border-none text-white py-3 px-2 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-white font-medium text-sm">
          {filteredCreators.length} CREATORS FOUND
        </p>
        <ShareButton text="Share Directory" />
      </div>

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

              <div className="pt-4">
                <ContractGallery
                  address={creator.address}
                  openSeaCollections={creator.openSeaData?.collections || []}
                  maxItems={3}
                  showDetails={false}
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
