import ENSResolver from "./ENSResolver";
import ContractGallery from "~/app/frames/hello/components/ContractGallery";
import { Metadata } from "next";
import { resolveBasenameOrAddress } from "~/app/hooks/useBasenameResolver";
import { addressIsMember, getCreator } from "~/app/features/directory/actions";
import MembershipStatus from "~/app/creators/[username]/MembershipStatus";
import Link from "next/link";
import LayoutWrapper from "~/app/components/LayoutWrapper";
import Header from "~/app/components/Header";
import WhoAmI from "~/components/WhoAmI";
import { useWalletConnection } from "~/components/FrameOrWalletConnection";
import { IsItMe } from "~/app/components/IsItMe";

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
      <LayoutWrapper>
        <Header />
        <div className="text-center my-10">
          <h1 className="text-4xl font-bold text-white mb-4">
            Creator Not Found
          </h1>
          <p className="text-white mb-6">
            We couldn&apos;t find this creator in our directory.
          </p>
          <Link
            href="/creators"
            className="bg-white text-blue-600 px-6 py-3 rounded-full font-medium hover:bg-opacity-90 transition-all"
          >
            Back to Creators
          </Link>
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <Header />

      <WhoAmI/>

      <IsItMe address={resolution?.address || ""} />


      {/* Membership Status UI */}
      <div className="p-4 rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center space-x-3">
          <div
            className={`w-3 h-3 rounded-full ${
              isMember ? "bg-green-500" : "bg-gray-400"
            }`}
          ></div>
          <h3 className="text-lg font-medium">
            {isMember ? "Verified Directory Member" : "Not a Directory Member"}
          </h3>
        </div>

        <div className="bg-blue-500 rounded-xl p-6">
          <div className="flex items-center mb-6">
            {creator.avatar ? (
              <img
                src={creator.avatar}
                alt={creator.name}
                className="w-16 h-16 rounded-full mr-4"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-300 flex items-center justify-center mr-4">
                <span className="text-blue-700 text-xl font-bold">
                  {creator.name.charAt(0)}
                </span>
              </div>
            )}

            <MembershipStatus
              isMember={isMember}
              address={resolution?.address}
              username={username}
              basename={resolution?.basename}
            />

            <div>
              <h2 className="text-2xl font-bold text-white">
                {creator.resolution?.basename || creator.name}
              </h2>
              <p className="text-white/80 text-sm">{creator.address}</p>
            </div>
          </div>
        </div>

        <ContractGallery
          address={resolution?.address || ""}
          openSeaCollections={creator.openSeaData?.collections || []}
        />
      </div>
    </LayoutWrapper>
  );
}

const appUrl = `https://${process.env.VERCEL_URL}`;
// const appUrl = process.env.NEXT_PUBLIC_URL;
// const appUrl = process.env.VERCEL_URL;

const frame = {
  version: "next",
  imageUrl: `${appUrl}/opengraph-image`,
  button: {
    title: "Launch Frame",
    action: {
      type: "launch_frame",
      name: "Join Frame",
      url: `${appUrl}/join`,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#f7f7f7",
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Join Frame",
    openGraph: {
      title: "Join Frame",
      description: "Join the creatordirectory.",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}
