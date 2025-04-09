"use client";

import { useState } from "react";
import {
  getZapperNFTContracts,
  getZapperNFTCollectionsForOwners,
} from "~/lib/getZapperNFTContracts";
import { getOpenseaNFTContracts } from "~/lib/getOpenseaNFTContracts";
import { resolveBasenameOrAddress } from "~/app/hooks/useBasenameResolver";

function getTimeAgo(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? "" : "s"} ago`;
    }
  }

  return "just now";
}

function findOldestFetchTime(data: any[]): string | null {
  if (!Array.isArray(data) || data.length === 0) return null;

  const timestamps = data
    .filter((item) => item?.fetchedAt)
    .map((item) => item.fetchedAt);

  if (timestamps.length === 0) return null;

  return timestamps.reduce((oldest, current) =>
    current < oldest ? current : oldest,
  );
}

export default function NFTContractDebugger({
  testAddress,
}: {
  testAddress: string;
}) {
  const [zapperDeployerData, setZapperDeployerData] = useState<any>(null);
  const [zapperOwnerData, setZapperOwnerData] = useState<any>(null);
  const [openSeaData, setOpenSeaData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);

  // Find the oldest fetch time across all data sources
  const oldestFetchTime = (() => {
    const allData = [
      ...(zapperDeployerData || []),
      ...(zapperOwnerData || []),
      ...(openSeaData || []),
    ];
    return findOldestFetchTime(allData);
  })();

  const fetchAllData = async () => {
    if (!testAddress) return;
    setIsLoading(true);
    setError(null);

    try {
      // First resolve the address if it's a basename
      const resolution = await resolveBasenameOrAddress(testAddress);
      if (!resolution?.address) {
        throw new Error("Could not resolve address from input");
      }
      setResolvedAddress(resolution.address);

      const [zapperDeployer, zapperOwner, openSea] = await Promise.all([
        getZapperNFTContracts(resolution.address, "BASE_MAINNET"),
        getZapperNFTCollectionsForOwners(resolution.address, "BASE_MAINNET"),
        getOpenseaNFTContracts(resolution.address, "BASE_MAINNET"),
      ]);

      setZapperDeployerData(zapperDeployer);
      setZapperOwnerData(zapperOwner);
      setOpenSeaData(openSea);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch NFT data");
    } finally {
      setIsLoading(false);
    }
  };

  const ResultSection = ({ title, data }: { title: string; data: any }) => {
    const count = data?.length || 0;
    const hasResults = count > 0;

    return (
      <div className="flex flex-col bg-white/5 rounded-xl overflow-hidden">
        <div className="flex items-center px-3 py-2.5 bg-white/5">
          <span className="text-sm text-white flex-1">{title}</span>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-xs min-w-[1.5rem] text-center">
              {count}
            </span>
            {hasResults ? (
              <span className="text-green-400 text-sm">✓</span>
            ) : (
              <span className="text-red-400 text-sm">✗</span>
            )}
          </div>
        </div>
        <div className="max-h-[300px] overflow-auto">
          {isLoading ? (
            <div className="p-4 text-center text-white/60">
              Loading NFT data...
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-400">{error}</div>
          ) : !data ? (
            <div className="p-4 text-center text-white/60">
              No data available. Click &quot;Check&quot; to fetch NFT data.
            </div>
          ) : (
            <pre className="p-4 overflow-auto bg-black/20 text-xs sm:text-sm font-mono whitespace-pre-wrap">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-base sm:text-lg font-semibold tracking-wide">
            NFT Contract Debug {resolvedAddress && `(${resolvedAddress})`}
          </h2>
          {oldestFetchTime && (
            <p className="text-sm text-white/60">
              Last fetched {getTimeAgo(oldestFetchTime)}
            </p>
          )}
        </div>
        <button
          onClick={fetchAllData}
          disabled={!testAddress || isLoading}
          className="w-full sm:w-auto px-4 py-2 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Checking..." : "Check"}
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <ResultSection title="Zapper (Deployer)" data={zapperDeployerData} />
        <ResultSection title="Zapper (Owner)" data={zapperOwnerData} />
        <ResultSection title="OpenSea" data={openSeaData} />
      </div>
    </div>
  );
}
