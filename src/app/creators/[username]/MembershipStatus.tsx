import JoinDirectoryButton from "./JoinDirectoryButton";

interface MembershipStatusProps {
  isMember: boolean;
  address?: string;
  username: string;
  basename?: string;
}

export default function MembershipStatus({
  isMember,
  address,
  username,
  basename,
}: MembershipStatusProps) {
  return (
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
      {!isMember && address && (
        <div className="mt-4">
          <JoinDirectoryButton address={address} name={basename || username} />
        </div>
      )}
    </div>
  );
}
