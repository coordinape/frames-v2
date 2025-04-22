"use client";

import { useEffect, useState, Suspense } from "react";
import sdk from "@farcaster/frame-sdk";
import { getCreators } from "~/app/features/directory/creators-actions";
import { CreatorWithNFTData } from "~/app/features/directory/types";
import Header from "../components/Header";
import Link from "next/link";
import ShareButton from "../components/ShareButton";
import ContractGallery from "~/app/components/ContractGallery";
import { PATHS } from "~/constants/paths";
import { BasenameTextRecordKeys } from "./[username]/basenames";
import { castCreateGive } from "~/app/features/directory/castCreateGive";
import { useSearchParams, useRouter } from "next/navigation";
import { CreatorsSearch } from "./components/CreatorsSearch";

// Helper function for logging with timestamps
const logWithTime = (message: string) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
};

// Helper function to check if a creator has NFT images
const hasNFTImages = (creator: CreatorWithNFTData): boolean => {
  return (
    creator.nftData?.collections?.some((collection) => collection.imageUrl) ??
    false
  );
};

function CreatorsListInner() {
  logWithTime("CreatorsListInner component initialized");
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [searchType, setSearchType] = useState(searchParams.get("type") || "");
  const [sortOption, setSortOption] = useState("recent");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [creators, setCreators] = useState<CreatorWithNFTData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      logWithTime("Starting SDK context load");
      const startTime = performance.now();
      await sdk.context;
      const endTime = performance.now();
      logWithTime(
        `SDK context loaded in ${(endTime - startTime).toFixed(2)}ms`,
      );

      console.log("Directory Frame: Calling ready");
      sdk.actions.ready({});
      logWithTime("SDK ready action called");
    };

    if (sdk && !isSDKLoaded) {
      logWithTime("Initializing SDK load");
      setIsSDKLoaded(true);
      load();
      return () => {
        logWithTime("Cleaning up SDK listeners");
        sdk.removeAllListeners();
      };
    }
  }, [isSDKLoaded]);

  useEffect(() => {
    async function fetchCreators() {
      try {
        logWithTime("Starting creators fetch");
        const fetchStartTime = performance.now();
        setLoading(true);

        // Get creators with OpenSea data and basename resolution already included from the server action
        const creatorsWithData = await getCreators();
        const fetchEndTime = performance.now();
        logWithTime(
          `Creators fetched in ${(fetchEndTime - fetchStartTime).toFixed(2)}ms`,
        );

        logWithTime(`Retrieved ${creatorsWithData.length} creators`);

        // Sort creators - prioritize those with NFT images
        const sortStartTime = performance.now();
        const sortedCreators = creatorsWithData.sort((a, b) => {
          const aHasImages = hasNFTImages(a);
          const bHasImages = hasNFTImages(b);

          if (aHasImages === bHasImages) return 0;
          return aHasImages ? -1 : 1;
        });
        const sortEndTime = performance.now();
        logWithTime(
          `Creators sorted in ${(sortEndTime - sortStartTime).toFixed(2)}ms`,
        );

        setCreators(sortedCreators);
        logWithTime("Creators state updated");
      } catch (err) {
        console.error("Failed to fetch creators:", err);
        logWithTime("Error occurred while fetching creators");
        setError("Failed to load creators. Please try again later.");
      } finally {
        setLoading(false);
        logWithTime("Loading state set to false");
      }
    }

    fetchCreators();
  }, []);

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
  }, [searchParams]);

  const filteredCreators = creators.filter((creator) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();

    // If searchType is "give", only search in GIVE skills
    if (searchType === "give") {
      return (
        creator.gives?.some((giveGroup) =>
          giveGroup.skill.toLowerCase().includes(query),
        ) ?? false
      );
    }

    // Helper function to check and log matches
    const checkMatch = (field: string, value: string | undefined | null) => {
      if (!value) return false;
      return value.toLowerCase().includes(query);
    };

    // For other search types, search across all fields
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

  const sortCreators = (creatorsToSort: CreatorWithNFTData[]) => {
    let sorted = [...creatorsToSort];

    switch (sortOption) {
      case "nfts":
        sorted.sort((a, b) => {
          const aCount = a.nftData?.collections?.length || 0;
          const bCount = b.nftData?.collections?.length || 0;
          return sortDirection === "desc" ? bCount - aCount : aCount - bCount;
        });
        break;
      case "gives":
        sorted.sort((a, b) => {
          const aCount =
            a.gives?.reduce((sum, group) => sum + group.count, 0) || 0;
          const bCount =
            b.gives?.reduce((sum, group) => sum + group.count, 0) || 0;
          return sortDirection === "desc" ? bCount - aCount : aCount - bCount;
        });
        break;
      case "alphabetical":
        sorted.sort((a, b) => {
          const aName = (a.resolution?.basename || a.name).toLowerCase();
          const bName = (b.resolution?.basename || b.name).toLowerCase();
          return sortDirection === "desc"
            ? bName.localeCompare(aName)
            : aName.localeCompare(bName);
        });
        break;
      case "reverse-alphabetical":
        sorted.sort((a, b) => {
          const aName = (a.resolution?.basename || a.name).toLowerCase();
          const bName = (b.resolution?.basename || b.name).toLowerCase();
          return bName.localeCompare(aName);
        });
        break;
      default: // "recent"
        // For recent, we'll reverse the array if ascending is selected
        if (sortDirection === "asc") {
          sorted.reverse();
        }
        break;
    }
    return sorted;
  };

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
            className="max-h-6"
          />
        </Link>
      </div>

      <Suspense>
        <CreatorsSearch
          searchQuery={searchQuery}
          searchType={searchType}
          onSearchChange={setSearchQuery}
          onSearchTypeChange={setSearchType}
        />
        <p className="text-white/40 text-xs text-center mb-5 italic">
          {filteredCreators.length} creators
        </p>
      </Suspense>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 bg-white/10 text-white rounded-full px-2 py-1 text-xs">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="focus:outline-none pr-1 bg-transparent"
          >
            <option value="recent">Newest</option>
            <option value="nfts">Most NFTs</option>
            <option value="gives">GIVE received</option>
            <option value="alphabetical">A to Z</option>
            <option value="reverse-alphabetical">Z to A</option>
          </select>
        </div>
        <ShareButton text="Share Directory" />
      </div>

      <div className="space-y-4">
        {sortCreators(filteredCreators).map((creator) => {
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
                onClick={() => {
                  // Let the Link handle the navigation
                  document.startViewTransition(() => {
                    router.push(
                      `/creators/${
                        creator.resolution?.basename || creator.address
                      }`,
                    );
                  });
                }}
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

export default function CreatorsList() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white text-xl base-pixel">
            Loading creators...
          </div>
        </div>
      }
    >
      <CreatorsListInner />
    </Suspense>
  );
}
