import { getAddress, isAddress, type Address } from "viem";
import {
  getBasename,
  getBasenameTextRecords,
  type Basename,
  getAddressFromBasename,
  BasenameTextRecordKeys,
  textRecordsKeysEnabled,
} from "~/app/creators/[username]/basenames";

const emptyTextRecords: Record<BasenameTextRecordKeys, string | undefined> = {
  [BasenameTextRecordKeys.Description]: undefined,
  [BasenameTextRecordKeys.Keywords]: undefined,
  [BasenameTextRecordKeys.Url]: undefined,
  [BasenameTextRecordKeys.Email]: undefined,
  [BasenameTextRecordKeys.Phone]: undefined,
  [BasenameTextRecordKeys.Github]: undefined,
  [BasenameTextRecordKeys.Twitter]: undefined,
  [BasenameTextRecordKeys.Farcaster]: undefined,
  [BasenameTextRecordKeys.Lens]: undefined,
  [BasenameTextRecordKeys.Telegram]: undefined,
  [BasenameTextRecordKeys.Discord]: undefined,
  [BasenameTextRecordKeys.Avatar]: undefined,
  [BasenameTextRecordKeys.Frames]: undefined,
  [BasenameTextRecordKeys.Medium]: undefined,
  [BasenameTextRecordKeys.AvailableForHire]: undefined,
};

export async function resolveBasenameOrAddress(input: string) {
  if (!input) return null;

  try {
    if (isAddress(input)) {
      return await resolveAddress(input as Address);
    } else if (input.endsWith(".base.eth")) {
      return await resolveBasename(input as Basename);
    } else {
      throw new Error(
        "Invalid input: must be an Ethereum address or .base.eth name",
      );
    }
  } catch (err) {
    throw new Error(
      err instanceof Error ? err.message : "An unknown error occurred",
    );
  }
}

// // This hook can now be used to handle the state management of the server response
// export function useBasenameResolver(initialData: Awaited<ReturnType<typeof resolveBasenameOrAddress>> | null = null) {
//   const [state, setState] = useState({
//     data: initialData,
//     isLoading: false,
//     error: null as string | null
//   });

//   return {
//     ...state,
//     setState
//   };
// }

async function resolveBasename(name: Basename) {
  try {
    const resolvedAddress = await getAddressFromBasename(name);
    const records = await getBasenameTextRecords(name);

    const formattedRecords =
      records?.reduce(
        (acc, record, index) => {
          const key = textRecordsKeysEnabled[index];
          acc[key] = record.result as string | undefined;
          return acc;
        },
        { ...emptyTextRecords },
      ) || emptyTextRecords;

    return {
      basename: name,
      address: resolvedAddress,
      textRecords: formattedRecords,
      isLoading: false,
      error: null,
    };
  } catch (err) {
    throw new Error(
      err instanceof Error ? err.message : "Error resolving Base name",
    );
  }
}

async function resolveAddress(addr: Address) {
  try {
    const formattedAddress = getAddress(addr);
    const name = await getBasename(formattedAddress);

    if (!name) {
      return {
        basename: "",
        address: formattedAddress,
        textRecords: emptyTextRecords,
        isLoading: false,
        error: null,
      };
    }

    const records = await getBasenameTextRecords(name);

    const formattedRecords =
      records?.reduce(
        (acc, record, index) => {
          const key = textRecordsKeysEnabled[index];
          acc[key] = record.result as string | undefined;
          return acc;
        },
        { ...emptyTextRecords },
      ) || emptyTextRecords;

    return {
      basename: name,
      address: formattedAddress,
      textRecords: formattedRecords,
      isLoading: false,
      error: null,
    };
  } catch (err) {
    if (err instanceof Error && err.message.includes("invalid address")) {
      throw new Error("Invalid Ethereum address");
    }
    throw new Error("Error resolving address");
  }
}
