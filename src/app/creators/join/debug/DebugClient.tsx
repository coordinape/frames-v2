"use client";

import { useEffect, useState } from "react";
import { useDebugMode } from "../useDebugMode";
import Header from "~/app/components/Header";
import AddressResolver from "./AddressResolver";
import NFTContractDebugger from "./NFTContractDebugger";

export default function DebugClient() {
  const [mounted, setMounted] = useState(false);
  const {
    testAddress,
    setTestAddress,
    testEligibility,
    isTestingEligibility,
    isClearingCache,
    checkTestAddressEligibility,
    clearTestAddressCache,
  } = useDebugMode();

  // Handle mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Header logoOnly />
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-4 text-center">
          <h1 className="font-mono text-6xl font-bold base-pixel">
            Debug Join
            <br />
            Experience
          </h1>
          <p className="opacity-90">
            Test eligibility and cache management for the join experience.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase tracking-wider opacity-80">
              Debug Tools
            </h2>
          </div>
          <div className="flex flex-col">
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter address or basename"
                  value={testAddress}
                  onChange={(e) => setTestAddress(e.target.value)}
                  className="flex-1 px-4 py-2 bg-white/10 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                />
                <button
                  onClick={checkTestAddressEligibility}
                  disabled={!testAddress || isTestingEligibility}
                  className="px-4 py-2 bg-white/10 text-white rounded-full text-sm hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTestingEligibility ? "Checking..." : "Check"}
                </button>
                <button
                  onClick={clearTestAddressCache}
                  disabled={!testAddress || isClearingCache}
                  className="px-4 py-2 bg-white/10 text-white rounded-full text-sm hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isClearingCache ? "Clearing..." : "Clear Cache"}
                </button>
              </div>

              {!testEligibility.isLoading && testAddress && (
                <div className="space-y-2 p-3 bg-white/5 rounded-lg text-sm">
                  <div className="flex justify-between">
                    <span>Basename:</span>
                    <span>
                      {testEligibility.hasBasename
                        ? testEligibility.basename
                        : "None"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Has NFTs on Base:</span>
                    <span>{testEligibility.hasNFTsOnBase ? "Yes" : "No"}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <NFTContractDebugger testAddress={testAddress} />

        <AddressResolver />

        <div className="fixed bottom-0 left-0 right-0 h-1 bg-white/20" />
      </div>
    </>
  );
}
