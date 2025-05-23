import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { getBestAddressForFid } from "~/app/features/directory/neynar";
import sdk from "@farcaster/frame-sdk";

const USE_FRAME_ADDRESS = false;

export function useWalletOrFrameAddress() {
  const { address: walletAddress } = useAccount();
  const [frameAddress, setFrameAddress] = useState<string | null>(null);
  const [isLoadingFrame, setIsLoadingFrame] = useState(true);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      console.log("Join Frame: Calling ready");
      sdk.actions.ready({});
      if (USE_FRAME_ADDRESS && context?.user?.fid) {
        const bestAddress = await getBestAddressForFid(`${context.user.fid}`);
        setFrameAddress(bestAddress);
      }
      setIsLoadingFrame(false);
    };

    if (mounted && sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
      return () => {
        sdk.removeAllListeners();
      };
    }
  }, [isSDKLoaded, mounted]);

  const isWalletAddress = Boolean(walletAddress);
  const address = walletAddress || frameAddress;

  return {
    address,
    isWalletAddress,
    isLoadingFrame,
  };
}
