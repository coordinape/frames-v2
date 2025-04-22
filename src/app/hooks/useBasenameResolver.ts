import { getAddress, isAddress, type Address } from "viem";
import {
  getBasename,
  getBasenameTextRecords,
  type Basename,
  getAddressFromBasename,
  BasenameTextRecordKeys,
  textRecordsKeysEnabled,
} from "~/app/creators/[username]/basenames";
import {
  getCachedBasenameResolution,
  cacheBasenameResolution,
} from "./basename-cache";

const emptyTextRecords: Record<BasenameTextRecordKeys, string | undefined> = {
  [BasenameTextRecordKeys.Url]: undefined,
  [BasenameTextRecordKeys.Github]: undefined,
  [BasenameTextRecordKeys.Farcaster]: undefined,
  [BasenameTextRecordKeys.CreativeMedium]: undefined,
  [BasenameTextRecordKeys.AvailableForHire]: "false",
};

export async function resolveBasenameOrAddress(input: string) {
  if (!input) return null;

  try {
    // Check cache first
    const cached = await getCachedBasenameResolution(input);
    if (cached) {
      return {
        basename: cached.basename,
        address: cached.address,
        textRecords: cached.textRecords,
        isLoading: false,
        error: null,
      };
    }

    // If not in cache, resolve and cache the result
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

    const resolution = {
      basename: name,
      address: resolvedAddress,
      textRecords: formattedRecords,
      isLoading: false,
      error: null,
    };

    // Cache the resolution
    await cacheBasenameResolution({
      basename: name,
      address: resolvedAddress,
      textRecords: formattedRecords,
    });

    return resolution;
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
      const resolution = {
        basename: "",
        address: formattedAddress,
        textRecords: emptyTextRecords,
        isLoading: false,
        error: null,
      };

      // Cache even empty resolutions
      await cacheBasenameResolution({
        basename: "",
        address: formattedAddress,
        textRecords: emptyTextRecords,
      });

      return resolution;
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

    const resolution = {
      basename: name,
      address: formattedAddress,
      textRecords: formattedRecords,
      isLoading: false,
      error: null,
    };

    // Cache the resolution
    await cacheBasenameResolution({
      basename: name,
      address: formattedAddress,
      textRecords: formattedRecords,
    });

    return resolution;
  } catch (err) {
    if (err instanceof Error && err.message.includes("invalid address")) {
      throw new Error("Invalid Ethereum address");
    }
    throw new Error("Error resolving address");
  }
}
