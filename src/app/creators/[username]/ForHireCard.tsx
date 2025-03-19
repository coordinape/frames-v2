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
  ];

  const availableContactMethods = contactMethods.filter(
    (method) => method.value,
  );

  if (availableContactMethods.length === 0) {
    return null;
  }

  return (
    <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-6 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        <h3 className="text-green-500 font-semibold">Available for Work</h3>
      </div>

      <div className="flex flex-wrap gap-4">
        {availableContactMethods.map((method) => (
          <a
            key={method.key}
            href={method.href(method.value!)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            {method.icon}
            <span className="text-white/90">{method.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
