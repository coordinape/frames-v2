import { Address } from "viem";
import { resolveBasenameOrAddress } from "~/app/hooks/useBasenameResolver";
import { BasenameTextRecordKeys } from "./basenames";

interface ForHireCardProps {
  address: Address;
}

export default async function ForHireCard({ address }: ForHireCardProps) {
  const resolution = await resolveBasenameOrAddress(address);

  if (!resolution?.textRecords[BasenameTextRecordKeys.AvailableForHire]) {
    return null;
  }

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
      key: BasenameTextRecordKeys.Email,
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
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      ),
      label: "Email",
      value: resolution.textRecords[BasenameTextRecordKeys.Email],
      href: (value: string) => `mailto:${value}`,
    },
    {
      key: BasenameTextRecordKeys.Phone,
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
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
      label: "Phone",
      value: resolution.textRecords[BasenameTextRecordKeys.Phone],
      href: (value: string) => `tel:${value}`,
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
      key: BasenameTextRecordKeys.Twitter,
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
          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
        </svg>
      ),
      label: "Twitter",
      value: resolution.textRecords[BasenameTextRecordKeys.Twitter],
      href: (value: string) => `https://twitter.com/${value}`,
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
          <path d="M12 3c1.2 0 2.4.6 3 1.7l7 12.3c.6 1.1.6 2.4 0 3.4-.6 1-1.8 1.6-3 1.6H5c-1.2 0-2.4-.6-3-1.6-.6-1-.6-2.3 0-3.4l7-12.3c.6-1.1 1.8-1.7 3-1.7z" />
          <path d="M12 12v4" />
          <path d="M12 8h.01" />
        </svg>
      ),
      label: "Farcaster",
      value: resolution.textRecords[BasenameTextRecordKeys.Farcaster],
      href: (value: string) => `https://warpcast.com/${value}`,
    },
    {
      key: BasenameTextRecordKeys.Lens,
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
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
      ),
      label: "Lens",
      value: resolution.textRecords[BasenameTextRecordKeys.Lens],
      href: (value: string) => `https://lenster.xyz/u/${value}`,
    },
    {
      key: BasenameTextRecordKeys.Telegram,
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
          <path d="M21.5 2L2.5 11l4 3L19.5 4l-4 13l4 3l2-18z" />
        </svg>
      ),
      label: "Telegram",
      value: resolution.textRecords[BasenameTextRecordKeys.Telegram],
      href: (value: string) => `https://t.me/${value}`,
    },
    {
      key: BasenameTextRecordKeys.Discord,
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
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      ),
      label: "Discord",
      value: resolution.textRecords[BasenameTextRecordKeys.Discord],
      href: (value: string) => `https://discord.com/users/${value}`,
    },
  ];

  const availableContactMethods = contactMethods.filter(
    (method) => method.value,
  );

  if (availableContactMethods.length === 0) {
    return null;
  }

  return (
    <div className="border-2 border-white/20 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        <h3 className="text-xl font-bold text-white base-pixel">
          Available for Work
        </h3>
      </div>

      <div className="flex flex-wrap gap-4">
        {availableContactMethods.map((method) => (
          <a
            key={method.key}
            href={method.href(method.value!)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            {method.icon}
            <span className="text-white/90">{method.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
