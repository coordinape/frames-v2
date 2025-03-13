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
import { IsItMe } from "~/app/components/IsItMe";
import { headers } from "next/headers";
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

      <WhoAmI />
      <IsItMe address={resolution?.address || ""} />
      <div className="space-y-8">
        <div className="flex justify-start mb-4">
          <Link
            href="/creators"
            className="flex items-center text-white hover:text-blue-300 transition-colors"
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
        </div>

        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-white mb-4 base-pixel">
            {creator.resolution?.basename || creator.name}
          </h1>
          {creator.bio && (
            <p className="text-white max-w-2xl mx-auto">{creator.bio}</p>
          )}
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

const appUrl = `https://${process.env.NEXT_PUBLIC_URL ?? process.env.VERCEL_URL}`;
// const appUrl = process.env.NEXT_PUBLIC_URL;
// const appUrl = process.env.VERCEL_URL;

const frame = ({ username }: { username: string }) => ({
  version: "next",
  imageUrl: `${appUrl}/opengraph-image?title=${username}`,
  button: {
    title: "View Creator Profile",
    action: {
      type: "launch_frame",
      name: "View Creator Profile",
      url: `${appUrl}/creators/${username}`,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#f7f7f7",
    },
  },
});

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const fullUrl = headersList.get('x-url') || '';
  
  // Split the URL by '/' and get the last part
  const urlParts = fullUrl.split('/');
  const username = urlParts[urlParts.length - 1];
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
