"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Basename, BasenameTextRecordKeys, getBasenameTextRecords, setText, setMultipleTextRecords, textRecordsKeysEnabled } from "~/app/creators/[username]/basenames";
import { useAccount, useConnect, useDisconnect, useWalletClient } from "wagmi";
import { base } from "viem/chains";
import LayoutWrapper from "~/app/components/LayoutWrapper";
import Header from "~/app/components/Header";
import Link from "next/link";
import { truncateAddress } from "~/app/utils/address";

interface TagInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function TagInput({ value, onChange, placeholder }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const tags = value
    ? value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  const addTag = (newTag: string) => {
    if (newTag && !tags.includes(newTag)) {
      const newTags = [...tags, newTag];
      onChange(newTags.join(", "));
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue.trim());
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      const newTags = tags.slice(0, -1);
      onChange(newTags.join(", "));
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue.trim());
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    onChange(newTags.join(", "));
  };

  return (
    <div className="flex flex-wrap gap-2 p-2 border border-white/30 rounded-lg bg-white/10">
      {tags.map((tag, index) => (
        <div key={index} className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-md">
          <span className="text-white text-sm">{tag}</span>
          <button type="button" onClick={() => removeTag(tag)} className="text-white/60 hover:text-white">
            ×
          </button>
        </div>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className="flex-1 min-w-[100px] bg-transparent text-white outline-none placeholder:text-white/50"
        placeholder={tags.length === 0 ? placeholder : "Add more tags..."}
      />
    </div>
  );
}

// Define field configurations in one place
const FIELD_CONFIG: Record<
  BasenameTextRecordKeys,
  {
    label: string;
    placeholder: string;
    isTextarea?: boolean;
    type?: "text" | "boolean" | "tags"; // Add tags type
  }
> = {
  [BasenameTextRecordKeys.Description]: {
    label: "Bio/Description",
    placeholder: "Tell us about yourself...",
    isTextarea: true,
    type: "text",
  },
  [BasenameTextRecordKeys.Keywords]: {
    label: "Keywords",
    placeholder: "Comma-separated keywords",
    type: "text",
  },
  [BasenameTextRecordKeys.Url]: {
    label: "Website URL",
    placeholder: "https://yourwebsite.com",
    type: "text",
  },
  [BasenameTextRecordKeys.Email]: {
    label: "Email",
    placeholder: "your@email.com",
    type: "text",
  },
  [BasenameTextRecordKeys.Phone]: {
    label: "Phone",
    placeholder: "+1 123 456 7890",
    type: "text",
  },
  [BasenameTextRecordKeys.Github]: {
    label: "GitHub Username",
    placeholder: "yourusername",
    type: "text",
  },
  [BasenameTextRecordKeys.Twitter]: {
    label: "Twitter Username",
    placeholder: "yourusername",
    type: "text",
  },
  [BasenameTextRecordKeys.Farcaster]: {
    label: "Farcaster",
    placeholder: "yourfarcasterhandle",
    type: "text",
  },
  [BasenameTextRecordKeys.Lens]: {
    label: "Lens Handle",
    placeholder: "yourlenshandle",
    type: "text",
  },
  [BasenameTextRecordKeys.Telegram]: {
    label: "Telegram",
    placeholder: "yourtelegramusername",
    type: "text",
  },
  [BasenameTextRecordKeys.Discord]: {
    label: "Discord",
    placeholder: "yourdiscordusername",
    type: "text",
  },
  [BasenameTextRecordKeys.Avatar]: {
    label: "Avatar URL",
    placeholder: "https://example.com/avatar.jpg",
    type: "text",
  },
  [BasenameTextRecordKeys.Frames]: {
    label: "Frames URL",
    placeholder: "https://example.com/frames",
    type: "text",
  },
  [BasenameTextRecordKeys.Medium]: {
    label: "Medium",
    placeholder: "digital-animation, painting, sculpture",
    type: "tags",
  },
  [BasenameTextRecordKeys.AvailableForHire]: {
    label: "Available for Hire",
    placeholder: "",
    type: "boolean",
  },
};

interface EditBasenameProfileProps {
  username: string;
}

export default function EditBasenameProfile({ username }: EditBasenameProfileProps) {
  const router = useRouter();
  const [basename, setBasename] = useState<Basename>(() => {
    if (!username.endsWith(".base.eth")) {
      throw new Error(`Invalid basename: ${username}. Basename must end with .base.eth`);
    }
    return username as Basename;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [textRecords, setTextRecords] = useState<Record<BasenameTextRecordKeys, string>>({} as Record<BasenameTextRecordKeys, string>);
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
        setError("Failed to connect to wallet. Please make sure you have a wallet installed and connected to Base network.");
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

  const handleTextRecordChange = (key: BasenameTextRecordKeys, value: string) => {
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
          return newValue !== currentValue;
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
      setError("Failed to update profile. Please check your wallet connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />

      <div className="flex flex-col gap-8">
        <div className="flex justify-start mb-4">
          <Link href={`/creators/${basename}`} className="flex items-center text-white hover:text-white/80 transition-colors">
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
            Back to Profile
          </Link>
        </div>

        <div className="">
          <h2 className="text-2xl font-bold mb-4 text-white base-pixel">Edit Profile</h2>
          <p className="text-white/80 mb-6 text-sm">Update your profile information stored on the Base blockchain.</p>

          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <span className="ml-2 text-white">Loading profile data...</span>
            </div>
          ) : (
            <>
              {!isConnected ? (
                <div className="mb-6">
                  <button
                    onClick={() => {
                      const injector = connectors.find((c) => c.id === "injected");
                      if (injector) connect({ connector: injector });
                    }}
                    className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-all"
                  >
                    Connect Wallet
                  </button>
                  <p className="mt-2 text-sm text-white/70">Please connect your wallet to edit your profile.</p>
                </div>
              ) : (
                <div className="mb-6 p-3 bg-white/20 text-white rounded-lg flex justify-between items-center">
                  <span className="text-sm font-mono">Connected: {truncateAddress(address || "")}</span>
                  <button onClick={() => disconnect()} className="text-sm hover:text-white/80 transition-colors cursor-pointer">
                    Disconnect
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-white mb-1">Basename</label>
                  <div className="w-full px-3 py-2 border border-white/30 rounded-lg bg-white/10 text-white">{basename}</div>
                  <p className="mt-1 text-xs text-white/60">Your basename cannot be changed here.</p>
                </div>

                {textRecordsKeysEnabled.map((key) => (
                  <div key={key} className="mb-4">
                    <label htmlFor={key} className="block text-sm font-medium text-white mb-1">
                      {FIELD_CONFIG[key].label}
                    </label>
                    {FIELD_CONFIG[key].type === "boolean" ? (
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => handleTextRecordChange(key, textRecords[key] === "true" ? "false" : "true")}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 ${
                            textRecords[key] === "true" ? "bg-green-600" : "bg-blue-900"
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${textRecords[key] === "true" ? "translate-x-6" : "translate-x-1"}`} />
                        </button>
                        <span className="ml-2 text-sm text-white/80">{textRecords[key] === "true" ? "Yes" : "No"}</span>
                      </div>
                    ) : FIELD_CONFIG[key].type === "tags" ? (
                      <TagInput value={textRecords[key] || ""} onChange={(value) => handleTextRecordChange(key, value)} placeholder={FIELD_CONFIG[key].placeholder} />
                    ) : FIELD_CONFIG[key].isTextarea ? (
                      <textarea
                        id={key}
                        value={textRecords[key] || ""}
                        onChange={(e) => handleTextRecordChange(key, e.target.value)}
                        className="w-full px-3 py-2 border border-white/30 rounded-lg bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                        placeholder={FIELD_CONFIG[key].placeholder}
                        rows={3}
                      />
                    ) : (
                      <input
                        type="text"
                        id={key}
                        value={textRecords[key] || ""}
                        onChange={(e) => handleTextRecordChange(key, e.target.value)}
                        className="w-full px-3 py-2 border border-white/30 rounded-lg bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                        placeholder={FIELD_CONFIG[key].placeholder}
                      />
                    )}
                  </div>
                ))}

                {error && <div className="mb-4 p-3 bg-red-500/20 text-red-200 rounded-lg">{error}</div>}

                {success && <div className="mb-4 p-3 bg-green-500/20 text-green-200 rounded-lg">{success}</div>}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || !isConnected}
                    className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 transition-all"
                  >
                    {isSubmitting ? "Updating..." : "Update Profile"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
