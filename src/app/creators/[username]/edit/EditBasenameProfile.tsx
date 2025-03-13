"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Basename,
  BasenameTextRecordKeys,
  getBasenameTextRecords,
  setText,
  setMultipleTextRecords,
  textRecordsKeysEnabled,
} from "~/app/creators/[username]/basenames";
import { useAccount, useConnect, useDisconnect, useWalletClient } from "wagmi";
import { base } from "viem/chains";

// Define field configurations in one place
const FIELD_CONFIG: Record<
  BasenameTextRecordKeys,
  { label: string; placeholder: string; isTextarea?: boolean }
> = {
  [BasenameTextRecordKeys.Description]: {
    label: "Bio/Description",
    placeholder: "Tell us about yourself...",
    isTextarea: true,
  },
  [BasenameTextRecordKeys.Keywords]: {
    label: "Keywords",
    placeholder: "Comma-separated keywords",
  },
  [BasenameTextRecordKeys.Url]: {
    label: "Website URL",
    placeholder: "https://yourwebsite.com",
  },
  [BasenameTextRecordKeys.Email]: {
    label: "Email",
    placeholder: "your@email.com",
  },
  [BasenameTextRecordKeys.Phone]: {
    label: "Phone",
    placeholder: "+1 123 456 7890",
  },
  [BasenameTextRecordKeys.Github]: {
    label: "GitHub Username",
    placeholder: "yourusername",
  },
  [BasenameTextRecordKeys.Twitter]: {
    label: "Twitter Username",
    placeholder: "yourusername",
  },
  [BasenameTextRecordKeys.Farcaster]: {
    label: "Farcaster",
    placeholder: "yourfarcasterhandle",
  },
  [BasenameTextRecordKeys.Lens]: {
    label: "Lens Handle",
    placeholder: "yourlenshandle",
  },
  [BasenameTextRecordKeys.Telegram]: {
    label: "Telegram",
    placeholder: "yourtelegramusername",
  },
  [BasenameTextRecordKeys.Discord]: {
    label: "Discord",
    placeholder: "yourdiscordusername",
  },
  [BasenameTextRecordKeys.Avatar]: {
    label: "Avatar URL",
    placeholder: "https://example.com/avatar.jpg",
  },
  [BasenameTextRecordKeys.Frames]: {
    label: "Frames URL",
    placeholder: "https://example.com/frames",
  },
};

interface EditBasenameProfileProps {
  username: string;
}

export default function EditBasenameProfile({
  username,
}: EditBasenameProfileProps) {
  const router = useRouter();
  const [basename, setBasename] = useState<Basename>(() => {
    if (!username.endsWith(".base.eth")) {
      throw new Error(
        `Invalid basename: ${username}. Basename must end with .base.eth`
      );
    }
    return username as Basename;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [textRecords, setTextRecords] = useState<
    Record<BasenameTextRecordKeys, string>
  >({} as Record<BasenameTextRecordKeys, string>);
  const [isLoading, setIsLoading] = useState(true);

  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    const connectWallet = async () => {
      try {
        const injector = connectors.find((c) => c.id === "injected");
        if (injector && !isConnected) {
          connect({ connector: injector });
        }
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        setError(
          "Failed to connect to wallet. Please make sure you have a wallet installed and connected to Base network."
        );
      }
    };

    connectWallet();
  }, [connect, connectors, isConnected]);

  useEffect(() => {
    const fetchTextRecords = async () => {
      try {
        setIsLoading(true);
        const records = await getBasenameTextRecords(basename);

        if (records) {
          const recordsObj = {} as Record<BasenameTextRecordKeys, string>;

          textRecordsKeysEnabled.forEach((key, index) => {
            const result = records[index];
            recordsObj[key] = (result.result as string) || "";
          });

          setTextRecords(recordsObj);
        }
      } catch (err) {
        console.error("Failed to fetch text records:", err);
        setError("Failed to load profile data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (basename) {
      fetchTextRecords();
    }
  }, [basename]);

  const handleTextRecordChange = (
    key: BasenameTextRecordKeys,
    value: string
  ) => {
    setTextRecords((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!walletClient || !isConnected) {
      setError("Wallet not connected. Please connect your wallet first.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Fetch current text records to compare with new values
      const currentRecords = await getBasenameTextRecords(basename);
      const currentValues = {} as Record<BasenameTextRecordKeys, string>;

      if (currentRecords) {
        textRecordsKeysEnabled.forEach((key, index) => {
          const result = currentRecords[index];
          currentValues[key] = (result.result as string) || "";
        });
      }

      // Collect all changed fields
      const changedRecords = textRecordsKeysEnabled
        .filter((key) => {
          const newValue = textRecords[key] || "";
          const currentValue = currentValues[key] || "";
          return newValue && newValue !== currentValue;
        })
        .map((key) => ({
          key,
          value: textRecords[key] || "",
        }));

      const successCount = changedRecords.length;

      if (successCount > 0) {
        if (successCount === 1) {
          // If only one field changed, use the single setText method
          const { key, value } = changedRecords[0];
          await setText(basename, key, value, walletClient);
        } else {
          // If multiple fields changed, use the multicall method
          await setMultipleTextRecords(basename, changedRecords, walletClient);
        }

        router.refresh();
        setSuccess(`Successfully updated ${successCount} profile fields.`);
      } else {
        setSuccess("No changes detected.");
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError(
        "Failed to update profile. Please check your wallet connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mb-8 p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
          <span className="ml-2">Loading profile data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
      <p className="text-gray-600 mb-4">
        Update your profile information stored on the Base blockchain.
      </p>

      {!isConnected ? (
        <div className="mb-4">
          <button
            onClick={() => {
              const injector = connectors.find((c) => c.id === "injected");
              if (injector) connect({ connector: injector });
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Connect Wallet
          </button>
          <p className="mt-2 text-sm text-gray-500">
            Please connect your wallet to edit your profile.
          </p>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md flex justify-between items-center">
          <span>
            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
          <button
            onClick={() => disconnect()}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Disconnect
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Basename
          </label>
          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700">
            {basename}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Your basename cannot be changed here.
          </p>
        </div>

        {textRecordsKeysEnabled.map((key) => (
          <div key={key} className="mb-4">
            <label
              htmlFor={key}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {FIELD_CONFIG[key].label}
            </label>
            {FIELD_CONFIG[key].isTextarea ? (
              <textarea
                id={key}
                value={textRecords[key] || ""}
                onChange={(e) => handleTextRecordChange(key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={FIELD_CONFIG[key].placeholder}
                rows={3}
              />
            ) : (
              <input
                type="text"
                id={key}
                value={textRecords[key] || ""}
                onChange={(e) => handleTextRecordChange(key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={FIELD_CONFIG[key].placeholder}
              />
            )}
          </div>
        ))}

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !isConnected}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
}
