"use client";

import { useEffect, useState } from "react";
import sdk, { type Context } from "@farcaster/frame-sdk";
import Header from "~/app/components/Header";
import { useAccount, useDisconnect, useConnect } from "wagmi";
import { config } from "~/components/providers/WagmiProvider";
import { resolveBasenameOrAddress } from "~/app/hooks/useBasenameResolver";
import { getOpenseaNFTContracts } from "~/lib/getOpenseaNFTContracts";
import { refreshRequirementsCache } from "./actions";
import { truncateAddress } from "~/app/utils/address";
import { useRouter } from "next/navigation";
import {
  addressIsMember,
  joinDirectory,
} from "~/app/features/directory/actions";
import Link from "next/link";

interface EligibilityStatus {
  hasBasename: boolean;
  basename: string;
  hasNFTsOnBase: boolean;
  isLoading: boolean;
}

const initialEligibility: EligibilityStatus = {
  hasBasename: false,
  basename: "",
  hasNFTsOnBase: false,
  isLoading: true,
};

export default function JoinClient() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();
  const [eligibility, setEligibility] =
    useState<EligibilityStatus>(initialEligibility);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createStatus, setCreateStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  // Get wallet connection info
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect } = useConnect();

  // Handle mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkEligibility = async () => {
      if (!address) {
        setEligibility(initialEligibility);
        return;
      }

      setEligibility((prev) => ({ ...prev, isLoading: true }));

      try {
        // Check basename ownership
        const resolution = await resolveBasenameOrAddress(address);
        const hasBasename = !!resolution?.basename;
        const basename = resolution?.basename || "";

        // Check NFT releases on Base
        const contracts = await getOpenseaNFTContracts(address);
        const hasNFTsOnBase = contracts.some(
          (contract) => contract.chainId.toLowerCase() === "base",
        );

        setEligibility({
          hasBasename,
          basename,
          hasNFTsOnBase,
          isLoading: false,
        });
      } catch (error) {
        console.error("Error checking eligibility:", error);
        setEligibility({
          hasBasename: false,
          basename: "",
          hasNFTsOnBase: false,
          isLoading: false,
        });
      }
    };

    if (mounted && address) {
      checkEligibility();
    }
  }, [address, mounted]);

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      setContext(context);
      console.log("Join Frame: Calling ready");
      sdk.actions.ready({});
    };

    if (mounted && sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
      return () => {
        sdk.removeAllListeners();
      };
    }
  }, [isSDKLoaded, mounted]);

  const userAddress = address || context?.user?.fid?.toString();
  const userName =
    context?.user?.username ||
    (eligibility.hasBasename
      ? eligibility.basename
      : userAddress
        ? truncateAddress(userAddress)
        : "");
  const allRequirementsMet =
    eligibility.hasBasename && eligibility.hasNFTsOnBase;

  const handleRefresh = async () => {
    if (!address) return;

    setEligibility((prev) => ({ ...prev, isLoading: true }));
    setRefreshError(null);

    try {
      const result = await refreshRequirementsCache(address);

      if (!result.success) {
        setRefreshError(result.error ?? "An error occurred while refreshing");
        setEligibility((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      const resolution = await resolveBasenameOrAddress(address);
      const hasBasename = !!resolution?.basename;
      const basename = resolution?.basename || "";

      const contracts = await getOpenseaNFTContracts(address);
      const hasNFTsOnBase = contracts.some(
        (contract) => contract.chainId.toLowerCase() === "base",
      );

      setEligibility({
        hasBasename,
        basename,
        hasNFTsOnBase,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error refreshing requirements:", error);
      setRefreshError("An error occurred while refreshing");
      setEligibility((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleProfileCreation = async () => {
    if (!allRequirementsMet) return;
    if (!address) return;

    const resolution = await resolveBasenameOrAddress(address);
    const basename = resolution?.basename || "";
    if (basename === "") return;

    try {
      setIsCreating(true);
      setCreateStatus("idle");

      // First check if profile exists
      const exists = await addressIsMember(address);
      if (exists) {
        // If profile exists, just redirect to their profile
        router.push(`/creators/${userName}`);
        return;
      }

      // If no profile exists, create one
      const success = await joinDirectory(address, basename);

      if (success) {
        setCreateStatus("success");
        router.push(`/creators/${userName}`);
      } else {
        setCreateStatus("error");
      }
    } catch (error) {
      console.error("Error joining directory:", error);
      setCreateStatus("error");
    } finally {
      setIsCreating(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Header logoOnly />
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-4 text-center">
          <h1 className="font-mono text-6xl font-bold base-pixel">
            Create
            <br />
            on Base
          </h1>
          <p className="opacity-90">
            Get listed on thecreators directory for better discovery and
            collaboration opportunities.
          </p>
        </div>

        <div className="flex flex-col">
          <h2 className="text-xs uppercase tracking-wider mb-2 opacity-80">
            Requirements
          </h2>
          <ul className="space-y-4">
            <li className="flex items-center">
              <div className="w-5 h-5 rounded-full mr-3 flex items-center justify-center border-1">
                {eligibility.hasBasename && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <div className="flex items-baseline justify-between w-full">
                Own a basename
                {!eligibility.hasBasename && (
                  <Link
                    href="https://basenames.xyz/"
                    className="text-xs text-white/80 hover:text-white ml-3"
                  >
                    Get your basename
                  </Link>
                )}
              </div>
            </li>
            <li className="flex items-center">
              <div className="w-5 h-5 rounded-full mr-3 flex items-center justify-center border-1">
                {eligibility.hasNFTsOnBase && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <div className="flex items-baseline justify-between w-full">
                Release NFTs on Base
                {!eligibility.hasNFTsOnBase && (
                  <Link
                    href="https://manifold.xyz/"
                    className="text-xs text-white/80 hover:text-white ml-3"
                  >
                    Publish an NFT
                  </Link>
                )}
              </div>
            </li>
          </ul>
        </div>

        {userAddress && (
          <div className="flex flex-col">
            <h2 className="text-xs uppercase tracking-wider mb-2 opacity-80">
              Connected as
            </h2>
            <div className="flex gap-4 w-full justify-between">
              {userAddress && (
                <div className="flex items-center justify-center text-sm gap-2">
                  <div className="flex items-center">
                    {context?.user?.pfpUrl && (
                      <img
                        src={context.user.pfpUrl}
                        alt="Profile"
                        className="w-5 h-5 rounded-full mr-2"
                      />
                    )}
                    <span className="font-mono">{userName}</span>
                  </div>
                </div>
              )}
              <button
                className="px-4 py-1 bg-white/10 text-white text-xs rounded-full cursor-pointer hover:bg-white/20 transition-colors"
                onClick={() => disconnect()}
              >
                Disconnect
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {!userAddress ? (
            <button
              className="w-full px-4 py-3 bg-white text-sm text-base-blue rounded-full cursor-pointer hover:bg-white/90 transition-colors"
              onClick={() => connect({ connector: config.connectors[0] })}
            >
              Check Requirements
            </button>
          ) : (
            <>
              <button
                className={`w-full py-3 rounded-full transition-colors ${
                  allRequirementsMet
                    ? createStatus === "success"
                      ? "bg-white text-base-blue"
                      : createStatus === "error"
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : "bg-white text-base-blue hover:bg-white/90"
                    : "bg-black/10 text-white"
                } ${isCreating ? "opacity-70 cursor-not-allowed" : allRequirementsMet ? "cursor-pointer" : "cursor-not-allowed"}`}
                onClick={handleProfileCreation}
                disabled={
                  !allRequirementsMet ||
                  isCreating ||
                  createStatus === "success"
                }
              >
                {isCreating
                  ? "Preparing Profile..."
                  : createStatus === "success"
                    ? "Redirecting to Profile..."
                    : createStatus === "error"
                      ? "Failed to proceed - Try Again"
                      : eligibility.isLoading
                        ? "Checking requirements..."
                        : allRequirementsMet
                          ? "Join Directory"
                          : "Requirements not met"}
              </button>

              {createStatus === "error" && (
                <p className="text-sm text-red-100 text-center mt-2">
                  There was an error proceeding to profile creation. Please try
                  again.
                </p>
              )}
              {!allRequirementsMet && (
                <div className="flex flex-col gap-2">
                  <button
                    className="w-full py-3 bg-white text-base-blue rounded-full hover:bg-white/90 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    onClick={handleRefresh}
                    disabled={eligibility.isLoading || !!refreshError}
                  >
                    {eligibility.isLoading
                      ? "Refreshing..."
                      : "Refresh Requirements"}
                  </button>

                  {refreshError && (
                    <p className="text-sm text-amber-400 text-center">
                      {refreshError}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 h-1 bg-white/20" />
      </div>
    </>
  );
}
