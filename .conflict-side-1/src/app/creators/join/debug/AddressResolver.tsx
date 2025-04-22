"use client";

import { useState } from "react";
import { useWalletOrFrameAddress } from "~/hooks/useWalletOrFrameAddress";
import { getBestAddressForFid } from "~/app/features/directory/neynar";

export default function AddressResolver() {
  const [testFid, setTestFid] = useState("");
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address, isWalletAddress, isLoadingFrame } =
    useWalletOrFrameAddress();

  const handleResolveAddress = async () => {
    if (!testFid) return;

    setIsResolving(true);
    setError(null);
    try {
      const bestAddress = await getBestAddressForFid(testFid);
      setResolvedAddress(bestAddress);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to resolve address",
      );
    } finally {
      setIsResolving(false);
    }
  };

  const formatAddress = (addr: string | null) => {
    if (!addr) return "None";
    return addr;
  };

  return (
    <div className="flex flex-col gap-4 p-6 bg-white/5 rounded-xl backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <h2 className="text-lg font-semibold tracking-wide">
          Address Resolver Debug
        </h2>
        <div className="px-3 py-1 rounded-full bg-white/10 text-xs">
          {isLoadingFrame ? "Loading..." : "Ready"}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter Warpcast FID (e.g. 7)"
            value={testFid}
            onChange={(e) => setTestFid(e.target.value)}
            className="flex-1 px-6 py-3 bg-white/5 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-white/20 border border-white/10"
          />
          <button
            onClick={handleResolveAddress}
            disabled={!testFid || isResolving}
            className="px-8 py-3 bg-blue-500 text-white rounded-xl text-base font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500"
          >
            {isResolving ? "Resolving..." : "Resolve"}
          </button>
        </div>

        <div className="space-y-4 p-4 bg-white/5 rounded-xl text-sm">
          <div className="grid gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-white/60 text-xs uppercase tracking-wider">
                Current Address
              </span>
              <code className="font-mono text-sm break-all bg-black/20 p-2 rounded">
                {formatAddress(address)}
              </code>
              <span className="text-xs text-white/40 mt-1">
                Source: {isWalletAddress ? "Wallet" : "Frame"}
              </span>
            </div>

            {testFid && (
              <>
                <div className="flex flex-col gap-1 pt-3 border-t border-white/10">
                  <span className="text-white/60 text-xs uppercase tracking-wider">
                    Test FID
                  </span>
                  <code className="font-mono text-sm break-all bg-black/20 p-2 rounded">
                    {testFid}
                  </code>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-white/60 text-xs uppercase tracking-wider">
                    Best Address For Fid
                  </span>
                  <code className="font-mono text-sm break-all bg-black/20 p-2 rounded">
                    {formatAddress(resolvedAddress)}
                  </code>
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
              <span className="font-medium">Error:</span> {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
