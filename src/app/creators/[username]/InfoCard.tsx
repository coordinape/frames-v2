import { Address } from "viem";
import { resolveBasenameOrAddress } from "~/app/hooks/useBasenameResolver";
import { BasenameTextRecordKeys } from "./basenames";
import Link from "next/link";

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
  ];

  const availableContactMethods = contactMethods.filter(
    (method) => method.value,
  );

  const isAvailableForWork =
    resolution.textRecords[BasenameTextRecordKeys.AvailableForHire] === "true";

  return (
    <>
      {(isAvailableForWork ||
        availableContactMethods.length > 0 ||
        creativeMediumValue) && (
        <div className="flex flex-col gap-8">
          {isAvailableForWork && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <h3 className="text-sm font-medium text-white">
                Available for Work
              </h3>
            </div>
          )}
          {availableContactMethods.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {availableContactMethods.map((method) => (
                <a
                  key={method.key}
                  href={method.href(method.value!)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-white hover:text-white/90 transition-colors"
                >
                  {method.icon}
                  <span>{method.label}</span>
                </a>
              ))}
            </div>
          )}
          {creativeMediumValue && (
            <div className="text-white">
              <div className="text-xl mb-2 base-pixel">Creative Medium</div>
              <div className="flex flex-wrap gap-2">
                {creativeMediumTags.map((tag, index) => (
                  <Link
                    key={index}
                    href={`/creators?search=${encodeURIComponent(tag)}&type=medium`}
                    className="flex items-center px-2 py-1 bg-white/10 rounded-md hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    <span className="text-white text-sm">{tag}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
