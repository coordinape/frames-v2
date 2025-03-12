import ProfileClient from "./ProfileClient";
import ENSResolver from "./ENSResolver";
import ContractGallery from "~/app/frames/hello/components/ContractGallery";
import { Metadata } from "next";
import { resolveBasenameOrAddress } from "~/app/hooks/useBasenameResolver";
import { addressIsMember } from "~/app/features/directory/actions";
import JoinDirectoryButton from "./JoinDirectoryButton";

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

  return (
    <div className="space-y-6">
      {/* <ProfileClient username={username} /> */}
      <ENSResolver initialValue={username} initialData={resolution} />

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
        <p className="mt-2 text-sm text-gray-600">
          {isMember
            ? "This creator is a verified member of the Creator Directory."
            : "This creator is not currently part of the Creator Directory."}
        </p>
        {!isMember && resolution?.address && (
          <div className="mt-4">
            <JoinDirectoryButton
              address={resolution.address}
              name={resolution?.basename || username}
            />
          </div>
        )}
      </div>

      <ContractGallery address={resolution?.address || ""} />
    </div>
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
