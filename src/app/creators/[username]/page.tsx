import ContractGallery from "~/app/components/ContractGallery";
import { Metadata } from "next";
import { resolveBasenameOrAddress } from "~/app/hooks/useBasenameResolver";
import { addressIsMember, getCreator } from "~/app/features/directory/actions";
import MembershipStatus from "~/app/creators/[username]/MembershipStatus";
import Link from "next/link";
import Header from "~/app/components/Header";
import { EditProfile } from "~/app/components/EditProfile";
import ShareButton from "~/app/components/ShareButton";
import Gives from "./Gives";
import InfoCard from "./InfoCard";
import { FrameSDK } from "~/app/components/FrameSDK";
import { APP_BASE_URL, APP_PUBLIC_URL } from "~/lib/constants";
import { RefreshButton } from "~/app/creators/[username]/RefreshButton";
import { BasenameTextRecordKeys } from "./basenames";

interface Props {
  params: Promise<{
    username: string;
  }>;
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;

  // Resolve the basename or address server-side
  const resolution = await resolveBasenameOrAddress(username);

  // Check if the user is a member of the directory
  const isMember = resolution?.address
    ? await addressIsMember(resolution.address)
    : false;

  // Fetch creator data using getCreator if we have an address
  const creator = resolution?.address
    ? await getCreator(resolution.address)
    : null;

  if (!creator) {
    return (
      <>
        <Header />
        <div className="text-center my-10">
          <h1 className="text-4xl font-bold text-white mb-4 base-pixel">
            Creator Not Found
          </h1>
          <p className="text-white mb-6 text-white/60">
            We couldn&apos;t find this creator in our directory.
          </p>
          <Link
            href="/creators"
            className="bg-white text-blue-600 px-6 py-3 rounded-full font-medium hover:bg-opacity-90 transition-all"
          >
            Back to Creators
          </Link>
        </div>
      </>
    );
  }
  const displayName = creator.resolution?.basename || creator.name;
  const creatorProfileProdUrl = `${APP_PUBLIC_URL}/creators/${creator.resolution?.basename || creator.address}`;
  const farcasterUsername = (
    resolution?.textRecords[BasenameTextRecordKeys.Farcaster] ||
    creator.farcasterUsername
  )
    ?.replace("@", "")
    ?.replace(" ", "")
    ?.split("/")
    ?.pop();

  return (
    <>
      <FrameSDK />
      <Header />
      <div className="flex flex-col gap-8">
        <div className="flex justify-between mb-2">
          <Link
            href="/creators"
            className="flex items-center text-white hover:text-white/80 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Creators
          </Link>
          <div className="flex items-center gap-4">
            <ShareButton text="Share Profile" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            {creator.avatar ? (
              <img
                src={creator.avatar}
                alt={creator.name}
                className="w-22 h-22 rounded-full mr-4"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-300 flex items-center justify-center mr-4">
                <span className="text-blue-700 text-xl font-bold">
                  {creator.name.charAt(0)}
                </span>
              </div>
            )}
            <EditProfile
              address={resolution?.address || ""}
              basename={creator.resolution?.basename || ""}
            />
          </div>

          <div className="flex items-center gap-2 my-2">
            <h2
              className={`font-bold text-white base-pixel-display ${
                displayName.length > 25
                  ? "text-xl"
                  : displayName.length > 20
                    ? "text-2xl"
                    : "text-3xl"
              }`}
            >
              {displayName}
            </h2>
            <MembershipStatus isMember={isMember} />
          </div>

          {creator.description && (
            <p className="text-white text-sm">{creator.description}</p>
          )}
          <p className="text-white/80 text-xs font-mono">{creator.address}</p>
        </div>
        {resolution?.address && <InfoCard address={resolution.address} />}
        {resolution?.address && farcasterUsername && (
          <Gives address={resolution.address} />
        )}
        {resolution?.address && farcasterUsername && (
          <Link
            href={`https://warpcast.com/~/compose?text=${encodeURIComponent(`@givebot @${farcasterUsername} #create ${encodeURIComponent(creatorProfileProdUrl)}`)}&embeds[]=${encodeURIComponent(creatorProfileProdUrl)}`}
            target="_blank"
            className="px-3 py-2 text-sm bg-white text-base-blue rounded-full cursor-pointer hover:bg-white/90 transition-colors items-center mt-[-16px] text-center"
          >
            Send <span className="font-bold">#create</span> GIVE
          </Link>
        )}
        <ContractGallery
          address={resolution?.address || ""}
          nftCollections={creator.nftData?.collections || []}
        />
        {resolution?.address && <RefreshButton address={resolution.address} />}
      </div>
    </>
  );
}

const frame = ({ username }: { username: string }) => ({
  version: "next",
  imageUrl: `${APP_BASE_URL}/creators/${username}/ogimage`,
  button: {
    title: "View Creator Profile",
    action: {
      type: "launch_frame",
      name: "View Creator Profile",
      url: `${APP_BASE_URL}/creators/${username}`,
      splashImageUrl: `${APP_BASE_URL}/splash.png`,
      splashBackgroundColor: "#0053ff",
    },
  },
});

export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;

  return {
    title: `Creators Profile for ${username}`,
    openGraph: {
      title: `Creators Profile for ${username}`,
      description: `Creators Directory Profile for ${username}.`,
    },
    other: {
      "fc:frame": JSON.stringify(frame({ username })),
    },
  };
}
