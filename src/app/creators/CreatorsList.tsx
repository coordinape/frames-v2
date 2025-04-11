"use client";

import { useEffect, useState } from "react";
import sdk from "@farcaster/frame-sdk";
import { getCreators } from "~/app/features/directory/actions";
import { CreatorWithNFTData } from "~/app/features/directory/types";
import Header from "../components/Header";
import Link from "next/link";
import ShareButton from "../components/ShareButton";
import ContractGallery from "~/app/components/ContractGallery";
import { PATHS } from "~/constants/paths";
import { APP_PUBLIC_URL } from "~/lib/constants";
import { BasenameTextRecordKeys } from "./[username]/basenames";

// Helper function to check if a creator has NFT images
const hasNFTImages = (creator: CreatorWithNFTData): boolean => {
  return (
    creator.nftData?.collections?.some((collection) => collection.imageUrl) ??
    false
  );
};

export default function CreatorsList() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [creators, setCreators] = useState<CreatorWithNFTData[]>([]);
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
        // Sort creators - prioritize those with NFT images
        const sortedCreators = creatorsWithData.sort((a, b) => {
          const aHasImages = hasNFTImages(a);
          const bHasImages = hasNFTImages(b);

          if (aHasImages === bHasImages) return 0;
          return aHasImages ? -1 : 1;
        });
        setCreators(sortedCreators);
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

      <div className="text-center mb-10 flex flex-col items-center justify-center gap-2">
        <h1 className="text-5xl font-bold text-white mb-4 base-pixel">
          Creators
        </h1>
        <p className="text-white">Explore the top creators on base</p>
        <Link
          href={PATHS.COORDINAPE}
          target="_blank"
          className="cursor-pointer"
        >
          <img
            src="/images/coordinape-x-base-x-creators.png"
            alt="Coordinape x Base x Creators"
            className="h-6"
          />
        </Link>
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
          <div key={creator.id} className="relative">
            {(creator.resolution?.textRecords?.[
              BasenameTextRecordKeys.Farcaster
            ] ||
              creator.farcasterUsername) && (
              <div className="relative group">
                <Link
                  href={`https://warpcast.com/~/compose?text=${encodeURIComponent(
                    `@givebot @${(
                      creator.resolution?.textRecords?.[
                        BasenameTextRecordKeys.Farcaster
                      ] || creator.farcasterUsername
                    )
                      ?.replace("@", "")
                      ?.replace(" ", "")
                      ?.split("/")
                      ?.pop()} #create ${encodeURIComponent(`${APP_PUBLIC_URL}/creators/${creator.resolution?.basename || creator.resolution?.address}`)}`,
                  )}&embeds[]=${encodeURIComponent(`${APP_PUBLIC_URL}/creators/${creator.resolution?.basename || creator.resolution?.address}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 text-xs rounded-full px-3 py-1 text-white absolute top-5 right-3 cursor-pointer hover:bg-white/20 transition-all"
                >
                  GIVE <span className="font-bold"> #create</span>
                </Link>
                <div className="absolute mb-2 hidden group-hover:block bg-black text-white text-xs rounded p-3 right-3 top-12 w-40 shadow-lg shadow-black/20">
                  Attest your support for this creator with{" "}
                  <span className="font-bold">#create</span> on Warpcast
                </div>
              </div>
            )}
            <Link
              href={`/creators/${
                creator.resolution?.basename || creator.address
              }`}
              className="block"
            >
              <div className="border-2 border-white/20 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {creator.avatar ? (
                      <img
                        src={creator.avatar}
                        alt={creator.name}
                        className="w-9 h-9 rounded-full mr-3"
                      />
                    ) : (
                      <div className="bg-white/70 w-9 h-9 rounded-full flex items-center justify-center mr-3">
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
                </div>
                <div className="pt-4">
                  <ContractGallery
                    address={creator.address}
                    nftCollections={creator.nftData?.collections || []}
                    maxItems={3}
                    showDetails={false}
                  />
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}
