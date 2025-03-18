"use client";

import { useEffect, useState } from "react";
import sdk, { type Context } from "@farcaster/frame-sdk";
import LayoutWrapper from "~/app/components/LayoutWrapper";
import Header from "~/app/components/Header";
import { useAccount, useDisconnect, useConnect } from "wagmi";
import { config } from "~/components/providers/WagmiProvider";
import { resolveBasenameOrAddress } from "~/app/hooks/useBasenameResolver";
import { getOpenseaNFTContracts } from "~/lib/getOpenseaNFTContracts";
import { refreshRequirementsCache } from "./actions";

interface EligibilityStatus {
  hasBasename: boolean;
  basename: string;
  hasNFTsOnBase: boolean;
  isLoading: boolean;
}

export default function JoinClient() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();
  const [eligibility, setEligibility] = useState<EligibilityStatus>({
    hasBasename: false,
    basename: "",
    hasNFTsOnBase: false,
    isLoading: true,
  });

  const [refreshError, setRefreshError] = useState<string | null>(null);

  // Get wallet connection info
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect } = useConnect();

  // Check eligibility when address changes
  useEffect(() => {
    const checkEligibility = async () => {
      if (!address) return;

      setEligibility((prev) => ({ ...prev, isLoading: true }));

      try {
        // Check basename ownership
        const resolution = await resolveBasenameOrAddress(address);
        const hasBasename = !!resolution?.basename;
        const basename = resolution?.basename || "";

        // Check NFT releases on Base
        const contracts = await getOpenseaNFTContracts(address);
        const hasNFTsOnBase = contracts.some(
          (contract) => contract.chainId.toLowerCase() === "base"
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

    if (address) {
      checkEligibility();
    } else {
      setEligibility({
        hasBasename: false,
        basename: "",
        hasNFTsOnBase: false,
        isLoading: false,
      });
    }
  }, [address]);

  // Load SDK context
  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      setContext(context);
      console.log("Join Frame: Calling ready");
      sdk.actions.ready({});
    };

    if (sdk && !isSDKLoaded) {
      console.log("Join Frame: Calling load");
      setIsSDKLoaded(true);
      load();
      return () => {
        sdk.removeAllListeners();
      };
    }
  }, [isSDKLoaded]);

  // Get user info from context or wallet
  // Fix: Use optional chaining for context.user.address which might not exist in UserContext
  const userAddress = address || context?.user?.fid?.toString();
  const userName =
    context?.user?.username ||
    (eligibility.hasBasename
      ? eligibility.basename
      : userAddress
      ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`
      : "");

  // Check if all requirements are met
  const allRequirementsMet =
    eligibility.hasBasename && eligibility.hasNFTsOnBase;

  const handleRefresh = async () => {
    if (!address) return;

    setEligibility((prev) => ({ ...prev, isLoading: true }));
    setRefreshError(null);

    // Call the server action
    const result = await refreshRequirementsCache(address);

    if (!result.success) {
      setRefreshError(result.error ?? "An error occurred while refreshing");
      setEligibility((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    // Re-run the eligibility check
    const resolution = await resolveBasenameOrAddress(address);
    const hasBasename = !!resolution?.basename;
    const basename = resolution?.basename || "";

    const contracts = await getOpenseaNFTContracts(address);
    const hasNFTsOnBase = contracts.some(
      (contract) => contract.chainId.toLowerCase() === "base"
    );

    setEligibility({
      hasBasename,
      basename,
      hasNFTsOnBase,
      isLoading: false,
    });
  };

  return (
    <LayoutWrapper>
      <Header logoOnly />

      {/* Title */}
      <h1 className="text-center font-mono text-5xl font-bold mb-4 base-pixel">
        Create
        <br />
        on Base
      </h1>

      {/* Description */}
      <p className="text-center mb-12 opacity-90 px-8">
        Get listed on thecreators directory for better discovery and
        collaboration opportunities.
      </p>

      {/* Requirements */}
      <div className="bg-[#0052CC] bg-opacity-30 rounded-xl p-6 mb-8">
        <h2 className="text-sm uppercase tracking-wider mb-4 opacity-80">
          Requirements
        </h2>
        <ul className="space-y-4">
          <li className="flex items-center">
            <div
              className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                eligibility.hasBasename ? "bg-green-500" : "bg-white/20"
              }`}
            >
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
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            Own a basename
          </li>
          <li className="flex items-center">
            <div
              className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                eligibility.hasNFTsOnBase ? "bg-green-500" : "bg-white/20"
              }`}
            >
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
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            Release NFTs on Base
          </li>
        </ul>
      </div>

      {/* User Info */}
      {userAddress && (
        <div className="flex items-center justify-center gap-2 mb-4 text-sm">
          <span className="opacity-80">Signed in as</span>
          <div className="flex items-center">
            {context?.user?.pfpUrl && (
              <img
                src={context.user.pfpUrl}
                alt="Profile"
                className="w-5 h-5 rounded-full mr-2"
              />
            )}
            <span>{userName}</span>
          </div>
        </div>
      )}
      <button
        className="w-full text-center py-3 text-sm opacity-80 hover:opacity-100"
        onClick={() => disconnect()}
      >
        Disconnect
      </button>

      {/* Buttons */}
      <div className="space-y-3">
        {!userAddress ? (
          <button
            className="w-full bg-[#0052CC] text-white py-3 rounded-xl font-medium hover:bg-[#0047B3] transition-colors"
            onClick={() => connect({ connector: config.connectors[0] })}
          >
            Connect Wallet
          </button>
        ) : (
          <>
            <button
              className={`w-full py-3 rounded-xl font-medium transition-colors ${
                allRequirementsMet
                  ? "bg-[#0052CC] text-white hover:bg-[#0047B3]"
                  : "bg-[#0052CC] bg-opacity-50 text-white cursor-not-allowed"
              }`}
              onClick={() =>
                allRequirementsMet &&
                (window.location.href = "/creators/join/requirements")
              }
              disabled={!allRequirementsMet}
            >
              {eligibility.isLoading
                ? "Checking requirements..."
                : allRequirementsMet
                ? "Continue to profile creation"
                : "Requirements not met"}
            </button>

            <div className="space-y-2">
              <button
                className="w-full bg-white/10 text-white py-3 rounded-xl font-medium hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          </>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-white/20" />
    </LayoutWrapper>
  );
}
