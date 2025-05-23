"use client";

import { useCallback, useEffect, useState } from "react";
import sdk from "@farcaster/frame-sdk";
import { useWalletOrFrameAddress } from "~/hooks/useWalletOrFrameAddress";
import { getCreator } from "~/app/features/directory/creator-actions";
import { isFollowing } from "~/app/features/directory/neynar";

interface FarcasterFollowButtonProps {
  fid?: number;
  username?: string;
}

export default function FarcasterFollowButton({
  fid,
  username,
}: FarcasterFollowButtonProps) {
  const { address } = useWalletOrFrameAddress();
  const [currentUserFid, setCurrentUserFid] = useState<number | null>(null);
  const [isFollowingUser, setIsFollowingUser] = useState<boolean>(false);

  useEffect(() => {
    const fetchCurrentUserFid = async () => {
      if (!address) return;
      const creatorData = await getCreator(address);
      if (creatorData?.farcasterFid) {
        console.log("Setting current user FID:", creatorData.farcasterFid);
        setCurrentUserFid(creatorData.farcasterFid);
      }
    };
    fetchCurrentUserFid();
  }, [address]);

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!currentUserFid || !fid) {
        console.log("Missing FIDs:", { currentUserFid, targetFid: fid });
        return;
      }
      console.log("Checking follow status:", {
        currentUserFid,
        targetFid: fid,
      });

      try {
        const following = await isFollowing(currentUserFid, fid);
        console.log("Follow status result:", following);
        setIsFollowingUser(following);
      } catch (error) {
        console.error("Error checking follow status:", error);
      } finally {
      }
    };
    checkFollowStatus();
  }, [currentUserFid, fid]);

  const handleClick = useCallback(async () => {
    const context = await sdk.context;
    const inFrame = !!context?.user?.fid;
    if (inFrame && fid) {
      try {
        await sdk.actions.viewProfile({ fid });
      } catch (e) {
        console.error(e);
      }
    } else if (username) {
      window.open(`https://warpcast.com/${username}`, "_blank");
    }
  }, [fid, username]);

  return (
    <div
      className="text-white px-0 pt-4 pb-4 cursor-pointer border-b border-t border-white/20 -mt-2"
      onClick={handleClick}
    >
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            version="1.1"
            fillRule="evenodd"
            clipRule="evenodd"
            strokeLinejoin="round"
            strokeMiterlimit="2"
            stroke="currentColor"
          >
            <g transform="matrix(1,0,0,1,-277.427,-0.045357)">
              <g
                id="Want"
                transform="matrix(0.13395,0,0,0.149263,251.963,-24.9564)"
              >
                <rect
                  x="190.107"
                  y="167.501"
                  width="179.172"
                  height="160.79"
                  fill="none"
                  stroke="none"
                />
                <g transform="matrix(0.238543,0,0,0.214069,159.361,140.861)">
                  <path
                    d="M257.778,155.556L742.222,155.556L742.222,844.445L671.111,844.445L671.111,528.889L670.414,528.889C662.554,441.677 589.258,373.333 500,373.333C410.742,373.333 337.446,441.677 329.586,528.889L328.889,528.889L328.889,844.445L257.778,844.445L257.778,155.556Z"
                    fillRule="nonzero"
                    fill="currentColor"
                  />
                </g>
                <g transform="matrix(0.238543,0,0,0.214069,159.361,140.861)">
                  <path
                    d="M128.889,253.333L157.778,351.111L182.222,351.111L182.222,746.667C169.949,746.667 160,756.616 160,768.889L160,795.556L155.556,795.556C143.283,795.556 133.333,805.505 133.333,817.778L133.333,844.445L382.222,844.445L382.222,817.778C382.222,805.505 372.273,795.556 360,795.556L355.556,795.556L355.556,768.889C355.556,756.616 345.606,746.667 333.333,746.667L306.667,746.667L306.667,253.333L128.889,253.333Z"
                    fillRule="nonzero"
                    fill="currentColor"
                  />
                </g>
                <g transform="matrix(0.238543,0,0,0.214069,159.361,140.861)">
                  <path
                    d="M675.556,746.667C663.283,746.667 653.333,756.616 653.333,768.889L653.333,795.556L648.889,795.556C636.616,795.556 626.667,805.505 626.667,817.778L626.667,844.445L875.556,844.445L875.556,817.778C875.556,805.505 865.606,795.556 853.333,795.556L848.889,795.556L848.889,768.889C848.889,756.616 838.94,746.667 826.667,746.667L826.667,351.111L851.111,351.111L880,253.333L702.222,253.333L702.222,746.667L675.556,746.667Z"
                    fillRule="nonzero"
                    fill="currentColor"
                  />
                </g>
              </g>
            </g>
          </svg>
          <span className="text-sm">Farcaster</span>
        </div>
        {fid === currentUserFid ? (
          <span
            className={`flex items-center px-4 py-1 text-xs rounded-full cursor-pointer transition-colors bg-white/10 text-white hover:bg-white/20`}
          >
            View Profile
          </span>
        ) : (
          <span
            className={`flex items-center px-4 py-1 text-xs rounded-full cursor-pointer transition-colors ${isFollowingUser ? "bg-white/10 text-white hover:bg-white/20" : " bg-white text-base-blue hover:bg-white/90"}`}
          >
            {isFollowingUser ? "Following" : "Follow"}
          </span>
        )}
      </div>
    </div>
  );
}
