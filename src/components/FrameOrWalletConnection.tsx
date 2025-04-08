"use client";

import { useState } from "react";
import { useConnect, useDisconnect, useAccount } from "wagmi";
import { config } from "~/components/providers/WagmiProvider";
import { useWalletOrFrameAddress } from "~/hooks/useWalletOrFrameAddress";

interface FrameOrWalletConnectionProps {
  children: (props: {
    address: string | null;
    isFrame: boolean;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
    isConnecting: boolean;
    error: Error | null;
  }) => React.ReactNode;
}

// Hook that handles all wallet connection logic
function useWalletConnection() {
  const [error, setError] = useState<Error | null>(null);

  // Use wagmi hooks
  const { address, isWalletAddress } = useWalletOrFrameAddress();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  // Connect wallet function
  const connectWallet = async () => {
    setError(null);

    try {
      // // Check if any wallet is available
      // // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // if (typeof window !== "undefined" && !(window as any).ethereum) {
      //   throw new Error(
      //     "No wallet found. Please install MetaMask or another Ethereum wallet.",
      //   );
      // }

      connect({
        connector: config.connectors[0],
      });
    } catch (err) {
      console.error("Error connecting wallet:", err);
      // Provide a more user-friendly error message
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorMessage = (window as any).ethereum
        ? "Failed to connect wallet. Please try again."
        : "Please install MetaMask or another Ethereum wallet to connect.";
      setError(new Error(errorMessage));
    }
  };

  // Disconnect wallet function
  const disconnectWallet = () => {
    disconnect();
  };

  // Get the effective address
  const effectiveAddress = address || null;

  return {
    address: effectiveAddress,
    isFrame: !isWalletAddress && !!effectiveAddress,
    connectWallet,
    disconnectWallet,
    isConnecting,
    error,
  };
}

export function FrameOrWalletConnection({
  children,
}: FrameOrWalletConnectionProps) {
  const walletConnection = useWalletConnection();
  return children(walletConnection);
}
