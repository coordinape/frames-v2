import { Address } from "viem";
import { resolveBasenameOrAddress } from "~/app/hooks/useBasenameResolver";
import { BasenameTextRecordKeys } from "./basenames";
import { getCreator } from "~/app/features/directory/actions";

interface InfoCardProps {
  address: Address;
}

export default async function InfoCard({ address }: InfoCardProps) {
  const resolution = await resolveBasenameOrAddress(address);
  const creator = resolution?.address
    ? await getCreator(resolution.address)
    : null;

  if (!resolution) {
    return null;
  }

  // Display raw CreativeMedium value
  const creativeMediumValue =
    resolution.textRecords[BasenameTextRecordKeys.CreativeMedium];

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
          width="20"
          height="20"
          viewBox="0 0 24 24"
          version="1.1"
          fillRule="evenodd"
          clipRule="evenodd"
          strokeLinejoin="round"
          strokeMiterlimit="2"
          stroke="currentColor"
        >
          <g transform="matrix(1,0,0,1,-277.427,-0.045357)">
            <g
              id="Want"
              transform="matrix(0.13395,0,0,0.149263,251.963,-24.9564)"
            >
              <rect
                x="190.107"
                y="167.501"
                width="179.172"
                height="160.79"
                fill="none"
                stroke="none"
              />
              <g transform="matrix(0.238543,0,0,0.214069,159.361,140.861)">
                <path
                  d="M257.778,155.556L742.222,155.556L742.222,844.445L671.111,844.445L671.111,528.889L670.414,528.889C662.554,441.677 589.258,373.333 500,373.333C410.742,373.333 337.446,441.677 329.586,528.889L328.889,528.889L328.889,844.445L257.778,844.445L257.778,155.556Z"
                  fillRule="nonzero"
                  fill="currentColor"
                />
              </g>
              <g transform="matrix(0.238543,0,0,0.214069,159.361,140.861)">
                <path
                  d="M128.889,253.333L157.778,351.111L182.222,351.111L182.222,746.667C169.949,746.667 160,756.616 160,768.889L160,795.556L155.556,795.556C143.283,795.556 133.333,805.505 133.333,817.778L133.333,844.445L382.222,844.445L382.222,817.778C382.222,805.505 372.273,795.556 360,795.556L355.556,795.556L355.556,768.889C355.556,756.616 345.606,746.667 333.333,746.667L306.667,746.667L306.667,253.333L128.889,253.333Z"
                  fillRule="nonzero"
                  fill="currentColor"
                />
              </g>
              <g transform="matrix(0.238543,0,0,0.214069,159.361,140.861)">
                <path
                  d="M675.556,746.667C663.283,746.667 653.333,756.616 653.333,768.889L653.333,795.556L648.889,795.556C636.616,795.556 626.667,805.505 626.667,817.778L626.667,844.445L875.556,844.445L875.556,817.778C875.556,805.505 865.606,795.556 853.333,795.556L848.889,795.556L848.889,768.889C848.889,756.616 838.94,746.667 826.667,746.667L826.667,351.111L851.111,351.111L880,253.333L702.222,253.333L702.222,746.667L675.556,746.667Z"
                  fillRule="nonzero"
                  fill="currentColor"
                />
              </g>
            </g>
          </g>
        </svg>
      ),
      label: "Farcaster",
      value:
        resolution.textRecords[BasenameTextRecordKeys.Farcaster] ||
        creator?.farcasterUsername,
      href: (value: string) => `https://warpcast.com/${value}`,
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
                  <div
                    key={index}
                    className="flex items-center px-2 py-1 bg-white/10 rounded-md"
                  >
                    <span className="text-white text-sm">{tag}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
