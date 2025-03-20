import { Address } from "viem";
import { resolveBasenameOrAddress } from "~/app/hooks/useBasenameResolver";
import { BasenameTextRecordKeys } from "./basenames";

interface InfoCardProps {
  address: Address;
}

export default async function InfoCard({ address }: InfoCardProps) {
  const resolution = await resolveBasenameOrAddress(address);

  if (!resolution) {
    return null;
  }

  // Display raw CreativeMedium value
  const creativeMediumValue =
    resolution.textRecords[BasenameTextRecordKeys.CreativeMedium];

  if (!creativeMediumValue) {
    return null;
  }

  console.log("Creative Medium Value:", creativeMediumValue);

  const creativeMediumTags = creativeMediumValue
    ? creativeMediumValue
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  const contactMethods = [
    {
      key: BasenameTextRecordKeys.Url,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      ),
      label: "Website",
      value: resolution.textRecords[BasenameTextRecordKeys.Url],
      href: (value: string) => value,
    },
    {
      key: BasenameTextRecordKeys.Github,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
        </svg>
      ),
      label: "GitHub",
      value: resolution.textRecords[BasenameTextRecordKeys.Github],
      href: (value: string) => `https://github.com/${value}`,
    },
    {
      key: BasenameTextRecordKeys.Farcaster,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      ),
      label: "Farcaster",
      value: resolution.textRecords[BasenameTextRecordKeys.Farcaster],
      href: (value: string) => `https://warpcast.com/${value}`,
    },
    {
      key: BasenameTextRecordKeys.CreativeMedium,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 19l7-7 3 3-7 7-3-3z" />
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
          <path d="M2 2l7.586 7.586" />
          <path d="M11 11l-4 4" />
        </svg>
      ),
      label: "Creative Medium",
      value: resolution.textRecords[BasenameTextRecordKeys.CreativeMedium],
      href: (value: string) => value,
    },
  ];

  const availableContactMethods = contactMethods.filter(
    (method) => method.value,
  );

  if (availableContactMethods.length === 0) {
    return null;
  }

  const isAvailableForWork =
    resolution.textRecords[BasenameTextRecordKeys.AvailableForHire] === "true";

  return (
    <div className="flex flex-col gap-4">
      <div className="text-white/70">
        <div className="text-sm font-medium mb-1">Creative Medium:</div>
        <div className="flex flex-wrap gap-2">
          {creativeMediumTags.map((tag, index) => (
            <div
              key={index}
              className="flex items-center px-2 py-1 bg-white/20 rounded-md"
            >
              <span className="text-white text-sm">{tag}</span>
            </div>
          ))}
        </div>
      </div>

      {isAvailableForWork && (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <h3 className="text-sm font-medium text-white/90 base-pixel">
            Available for Work
          </h3>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {availableContactMethods.map((method) => (
          <a
            key={method.key}
            href={method.href(method.value!)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white/90 transition-colors"
          >
            {method.icon}
            <span>{method.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
