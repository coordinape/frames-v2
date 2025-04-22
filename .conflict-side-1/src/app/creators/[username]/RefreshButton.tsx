"use client";
import { refreshRequirementsCache } from "~/app/creators/join/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useWalletOrFrameAddress } from "~/hooks/useWalletOrFrameAddress";

export const RefreshButton = ({ address }: { address: string }) => {
  const router = useRouter();
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [refreshLoading, setRefreshLoading] = useState(false);

  const { address: myAddress } = useWalletOrFrameAddress();

  const isMe = address.toLowerCase() === myAddress?.toLowerCase();

  const [hide, setHidden] = useState(false);
  const handleRefresh = async () => {
    if (!address) return;

    setRefreshLoading(true);
    setRefreshError(null);

    try {
      const result = await refreshRequirementsCache(address);
      if (!result.success) {
        setRefreshError(result.error ?? "An error occurred while refreshing");
        return;
      }

      setHidden(true);
      router.refresh();
    } catch (error) {
      console.error("Error refreshing NFTs:", error);
      setRefreshError("An error occurred while refreshing");
    } finally {
      setRefreshLoading(false);
    }
  };

  if (!isMe) {
    return null;
  }
  if (hide) {
    return null;
  }

  return (
    <>
      {refreshError && (
        <p className="text-sm text-amber-400 text-center">{refreshError}</p>
      )}
      <button
        className="w-full py-2 bg-white text-base-blue text-sm rounded-full hover:bg-white/90 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        onClick={handleRefresh}
        disabled={refreshLoading || !!refreshError}
      >
        {refreshLoading ? "Refreshing..." : "Reload my NFTs"}
      </button>
    </>
  );
};
