import { useEffect, useState } from "react";
import { resolveBasenameOrAddress } from "~/app/hooks/useBasenameResolver";
import { getNFTContracts } from "~/lib/getNFTContracts";
import {
  bustZapperCollectionsCache,
  bustZapperOwnerCollectionsCache,
} from "~/lib/getZapperNFTContracts";
import { bustOpenSeaCollectionsCache } from "~/lib/getOpenseaNFTContracts";

export interface EligibilityStatus {
  hasBasename: boolean;
  basename: string;
  hasNFTsOnBase: boolean;
  isLoading: boolean;
}

export const initialEligibility: EligibilityStatus = {
  hasBasename: false,
  basename: "",
  hasNFTsOnBase: false,
  isLoading: true,
};

const DEBUG_MODE_KEY = "creators-directory-debug-mode";

export function useDebugMode() {
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [testAddress, setTestAddress] = useState("");
  const [testEligibility, setTestEligibility] =
    useState<EligibilityStatus>(initialEligibility);
  const [isTestingEligibility, setIsTestingEligibility] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);

  useEffect(() => {
    // Check localStorage on mount
    const debugMode = localStorage.getItem(DEBUG_MODE_KEY) === "true";
    setIsDebugMode(debugMode);

    // Listen for storage changes (in case debug mode is toggled in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === DEBUG_MODE_KEY) {
        setIsDebugMode(e.newValue === "true");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const toggleDebugMode = () => {
    const newValue = !isDebugMode;
    localStorage.setItem(DEBUG_MODE_KEY, String(newValue));
    setIsDebugMode(newValue);
  };

  const checkTestAddressEligibility = async () => {
    if (!testAddress) return;

    setIsTestingEligibility(true);
    setTestEligibility((prev) => ({ ...prev, isLoading: true }));

    try {
      // First try to resolve the input as either a basename or address
      const resolution = await resolveBasenameOrAddress(testAddress);
      if (!resolution?.address) {
        setTestEligibility({
          hasBasename: false,
          basename: "",
          hasNFTsOnBase: false,
          isLoading: false,
        });
        return;
      }

      // Now we have the address, check basename ownership
      const hasBasename = !!resolution.basename;
      const basename = resolution.basename || "";

      // Check NFT releases on Base using the resolved address
      const contracts = await getNFTContracts(
        resolution.address,
        "BASE_MAINNET",
      );
      const hasNFTsOnBase = contracts.length > 0;

      setTestEligibility({
        hasBasename,
        basename,
        hasNFTsOnBase,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error checking test address eligibility:", error);
      setTestEligibility({
        hasBasename: false,
        basename: "",
        hasNFTsOnBase: false,
        isLoading: false,
      });
    } finally {
      setIsTestingEligibility(false);
    }
  };

  const clearTestAddressCache = async () => {
    if (!testAddress) return;

    setIsClearingCache(true);
    try {
      // First resolve the input to get the address
      const resolution = await resolveBasenameOrAddress(testAddress);
      if (!resolution?.address) {
        console.error("Could not resolve address");
        return;
      }

      await bustZapperCollectionsCache(resolution.address);
      await bustOpenSeaCollectionsCache(resolution.address);
      await bustZapperOwnerCollectionsCache(resolution.address);
      // Reset the test eligibility to trigger a fresh check
      setTestEligibility(initialEligibility);
    } catch (error) {
      console.error("Error clearing cache:", error);
    } finally {
      setIsClearingCache(false);
    }
  };

  return {
    isDebugMode,
    toggleDebugMode,
    testAddress,
    setTestAddress,
    testEligibility,
    isTestingEligibility,
    isClearingCache,
    checkTestAddressEligibility,
    clearTestAddressCache,
  };
}
