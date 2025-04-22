"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import AboutGiveModal from "~/components/AboutGiveModal";

interface CreatorsSearchProps {
  searchQuery: string;
  searchType: string;
  onSearchChange: (query: string) => void;
  onSearchTypeChange: (type: string) => void;
}

export function CreatorsSearch({
  searchQuery,
  searchType,
  onSearchChange,
  onSearchTypeChange,
}: CreatorsSearchProps) {
  const router = useRouter();

  const handleSearchChange = (value: string) => {
    onSearchChange(value);
    onSearchTypeChange("");
    router.push("/creators");
  };

  const handleClearSearch = () => {
    onSearchChange("");
    onSearchTypeChange("");
    router.push("/creators");
  };

  return (
    <div className="relative mb-1">
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
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={handleClearSearch}
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
