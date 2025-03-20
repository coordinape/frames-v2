"use client";

import { useState, useEffect } from "react";
import { FrameOrWalletConnection } from "~/components/FrameOrWalletConnection";
import { getCreators } from "~/app/features/directory/actions";
import { CreatorWithOpenSeaData } from "~/app/features/directory/types";
import { truncateAddress } from "~/app/utils/address";
import Link from "next/link";

function JoinDirectoryButton() {
  return (
    <Link
      href="/creators/join"
      className="px-4 py-1 bg-white text-base-blue text-xs rounded-full ml-2 hover:bg-white/90 transition-colors"
    >
      Join the Directory
    </Link>
  );
}

export default function WhoAmI() {
  const [creators, setCreators] = useState<CreatorWithOpenSeaData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCreators() {
      try {
        const creatorsWithData = await getCreators();
        setCreators(creatorsWithData);
      } catch (err) {
        console.error("Failed to fetch creators:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCreators();
  }, []);

  return (
    <>
      <FrameOrWalletConnection>
        {({
          address,
          isFrame,
          connectWallet,
          disconnectWallet,
          isConnecting,
          error,
        }) => {
          const creator = address
            ? creators.find(
                (c) => c.address.toLowerCase() === address.toLowerCase(),
              )
            : null;
          const profileUrl = creator
            ? `/creators/${creator.resolution?.basename || creator.address}`
            : null;

          return (
            <>
              {loading ? (
                <div className="flex items-center flex-1 justify-end py-1">
                  <p className="text-xs text-white/60">Loading...</p>
                </div>
              ) : (
                <div
                  className={`flex gap-2 items-center flex-1 ${!creator ? "justify-between" : "justify-end"}`}
                >
                  {!creator && <JoinDirectoryButton />}
                  <div className="flex gap-2 items-center">
                    {error && (
                      <p className="text-red-500 text-xs">{error.message}</p>
                    )}
                    {isFrame && (
                      <p className="text-white/40 text-xs">In Frame</p>
                    )}
                    {isConnecting ? (
                      <p className="text-white/60 text-xs">Connecting...</p>
                    ) : (
                      <>
                        {!address && (
                          <button
                            onClick={connectWallet}
                            className="px-4 py-1 bg-white text-base-blue text-xs rounded-full cursor-pointer hover:bg-white/90 transition-colors"
                          >
                            Connect Wallet
                          </button>
                        )}
                      </>
                    )}
                    {address && (
                      <>
                        <div className="flex items-center justify-between gap-2">
                          {profileUrl && creator ? (
                            <Link href={profileUrl}>
                              <div className="flex items-center gap-2">
                                <img
                                  src={
                                    creator.avatar ||
                                    `https://api.samplefaces.com/face?width=32`
                                  }
                                  alt={creator.name}
                                  className="w-5 h-5 rounded-full"
                                />
                                <p
                                  className="text-white/60 text-xs font-mono hover:text-white/80 transition-colors overflow-hidden text-ellipsis whitespace-nowrap"
                                  style={{ maxWidth: "180px" }}
                                >
                                  {creator.resolution?.basename ||
                                    truncateAddress(address)}
                                </p>
                              </div>
                            </Link>
                          ) : (
                            <p className="text-white/60 text-xs font-mono">
                              {truncateAddress(address)}
                            </p>
                          )}
                          <button
                            onClick={disconnectWallet}
                            className="px-4 py-1 bg-white/10 text-white text-xs rounded-full cursor-pointer hover:bg-white/20 transition-colors"
                          >
                            Disconnect
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          );
        }}
      </FrameOrWalletConnection>
    </>
  );
}
