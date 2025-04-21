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
import { BasenameTextRecordKeys } from "./[username]/basenames";
import { castCreateGive } from "~/app/features/directory/castCreateGive";
import { useSearchParams, useRouter } from "next/navigation";
import AboutGiveModal from "~/components/AboutGiveModal";

// Helper function to check if a creator has NFT images
const hasNFTImages = (creator: CreatorWithNFTData): boolean => {
  return (
    creator.nftData?.collections?.some((collection) => collection.imageUrl) ??
    false
  );
};

// Search component that uses useSearchParams
function SearchSection({
  searchQuery,
  setSearchQuery,
  searchType,
  setSearchType,
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchType: string;
  setSearchType: (type: string) => void;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Update search query and type when URL parameters change
    const searchFromUrl = searchParams.get("search");
    const typeFromUrl = searchParams.get("type");
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
    }
    if (typeFromUrl) {
      setSearchType(typeFromUrl);
    }
  }, [searchParams, setSearchQuery, setSearchType]);

  return (
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
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSearchType("");
            router.push("/creators");
          }}
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSearchType("");
              router.push("/creators");
            }}
            className="text-white/60 hover:text-white transition-colors cursor-pointer"
            aria-label="Clear search"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
      {searchQuery && searchType === "give" && (
        <div className="mt-2 flex justify-between gap-2 bg-gray-800/90 rounded-lg p-4 mt-4">
          <div className="flex flex-col justify-between w-full gap-3 relative">
            <h3 className="text-xl font-bold text-white base-pixel flex items-start flex-wrap gap-2 justify-between">
              <span>
                Creators with
                <br />
                Coordinape GIVE Skill
              </span>
              <span className="mt-1.5 absolute top-0 right-0">
                <AboutGiveModal />
              </span>
            </h3>
            <div className="flex justify-start gap-2 w-full items-center border-t border-white/20 pt-2">
              <Link
                href={`https://coordinape.com/give/skill/${searchQuery.toLowerCase()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 cursor-pointer text-white/90 text-xl"
              >
                <img
                  src="/images/give-icon.png"
                  alt="Coordinape Logo"
                  className="h-5"
                />
                <span className="font-bold mb-0.5">{searchQuery}</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreatorsList() {
  const searchParams = useSearchParams();
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("");
  const [creators, setCreators] = useState<CreatorWithNFTData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize search state from URL params after mount
  useEffect(() => {
    if (searchParams) {
      setSearchQuery(searchParams.get("search") || "");
      setSearchType(searchParams.get("type") || "");
    }
  }, [searchParams]);

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
        const creatorsWithData = await getCreators();
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

  const filteredCreators = creators.filter((creator) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();

    if (searchType === "give") {
      return (
        creator.gives?.some((giveGroup) =>
          giveGroup.skill.toLowerCase().includes(query),
        ) ?? false
      );
    }

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
      ) ||
      creator.gives?.some((giveGroup) => checkMatch("skill", giveGroup.skill))
    );
  });

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
            className="max-h-6"
          />
        </Link>
      </div>

      <SearchSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchType={searchType}
        setSearchType={setSearchType}
      />

      <div className="flex items-center justify-between mb-4">
        <p className="text-white font-medium text-sm">
          {filteredCreators.length} CREATORS FOUND
        </p>
        <ShareButton text="Share Directory" />
      </div>

      <div className="space-y-4">
        {filteredCreators.map((creator) => {
          const farcasterUserName =
            creator.resolution?.textRecords?.[
              BasenameTextRecordKeys.Farcaster
            ] || creator.farcasterUsername;

          const baseNameOrAddress =
            creator.resolution?.basename || creator.resolution?.address;

          return (
            <div key={creator.id} className="relative">
              {baseNameOrAddress && farcasterUserName && (
                <div className="relative group">
                  <span
                    className="bg-[#2664FF] text-xs rounded-full px-3 py-1 text-white absolute top-5 right-3 cursor-pointer hover:bg-[#5485FF] transition-all"
                    onClick={() =>
                      castCreateGive(farcasterUserName, baseNameOrAddress)
                    }
                  >
                    GIVE <span className="font-bold"> #create</span>
                  </span>
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
          );
        })}
      </div>
    </>
  );
}
