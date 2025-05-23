import {
  Address,
  ContractFunctionParameters,
  createPublicClient,
  encodePacked,
  http,
  keccak256,
  Abi,
  Hash,
  encodeFunctionData,
} from "viem";

import { normalize, namehash } from "viem/ens";

import { base, mainnet } from "viem/chains";
import L2ResolverAbi from "./L2ResolverAbi";

export type Basename = `${string}.base.eth`;

export const BASENAME_L2_RESOLVER_ADDRESS =
  "0xC6d566A56A1aFf6508b41f6c90ff131615583BCD";

export enum BasenameTextRecordKeys {
  Url = "url",
  Github = "com.github",
  Farcaster = "xyz.farcaster",
  CreativeMedium = "com.coordinape.creator.medium",
  AvailableForHire = "com.coordinape.creator.availableForHire",
}

export const textRecordsKeysEnabled = [
  BasenameTextRecordKeys.CreativeMedium,
  BasenameTextRecordKeys.Url,
  BasenameTextRecordKeys.Github,
  BasenameTextRecordKeys.Farcaster,
  BasenameTextRecordKeys.AvailableForHire,
];

const baseClient = createPublicClient({
  chain: base,
  transport: http(
    process.env.NEXT_PUBLIC_ALCHEMY_BASE_URL || "https://mainnet.base.org",
  ),
});

export function buildBasenameTextRecordContract(
  basename: Basename,
  key: BasenameTextRecordKeys,
): ContractFunctionParameters {
  return {
    abi: L2ResolverAbi,
    address: BASENAME_L2_RESOLVER_ADDRESS,
    args: [namehash(basename), key],
    functionName: "text",
  };
}

/**
 * Sets a text record for a basename on the Base chain ENS resolver
 * @param basename The basename to set the text record for
 * @param key The text record key
 * @param value The value to set for the text record
 * @returns The transaction hash if successful
 */
export async function setText(
  basename: Basename,
  key: BasenameTextRecordKeys,
  value: string,
  walletClient: {
    writeContract: (params: {
      abi: Abi;
      address: Address;
      functionName: string;
      args: readonly unknown[];
    }) => Promise<Hash>;
  },
) {
  try {
    // First normalize the basename to ensure consistent processing
    const normalizedBasename = normalize(basename);

    // Apply the namehash algorithm to get the node
    const node = namehash(normalizedBasename);

    // Create the transaction to set the text record
    const hash = await walletClient.writeContract({
      abi: L2ResolverAbi,
      address: BASENAME_L2_RESOLVER_ADDRESS,
      functionName: "setText",
      args: [node, key, value],
    });

    return hash;
  } catch (error) {
    console.error(`Error setting text record for ${basename}:`, error);
    throw error;
  }
}

/**
 * Sets multiple text records for a basename on the Base chain ENS resolver in a single transaction
 * @param basename The basename to set the text records for
 * @param records An array of objects containing the key and value for each text record
 * @param walletClient The wallet client to use for the transaction
 * @returns The transaction hash if successful
 */
export async function setMultipleTextRecords(
  basename: Basename,
  records: Array<{ key: BasenameTextRecordKeys; value: string }>,
  walletClient: {
    writeContract: (params: {
      abi: Abi;
      address: Address;
      functionName: string;
      args: readonly unknown[];
    }) => Promise<Hash>;
  },
) {
  try {
    // First normalize the basename to ensure consistent processing
    const normalizedBasename = normalize(basename);

    // Apply the namehash algorithm to get the node
    const node = namehash(normalizedBasename);

    // Create an array of encoded function calls for each text record
    const encodedCalls = records.map(({ key, value }) =>
      encodeFunctionData({
        abi: L2ResolverAbi,
        functionName: "setText",
        args: [node, key, value],
      }),
    );

    // Call multicallWithNodeCheck with the node and encoded function calls
    const hash = await walletClient.writeContract({
      abi: L2ResolverAbi,
      address: BASENAME_L2_RESOLVER_ADDRESS,
      functionName: "multicallWithNodeCheck",
      args: [node, encodedCalls],
    });

    return hash;
  } catch (error) {
    console.error(
      `Error setting multiple text records for ${basename}:`,
      error,
    );
    throw error;
  }
}

// Get a single TextRecord
export async function getBasenameTextRecord(
  basename: Basename,
  key: BasenameTextRecordKeys,
) {
  try {
    const contractParameters = buildBasenameTextRecordContract(basename, key);
    const textRecord = await baseClient.readContract(contractParameters);
    return textRecord as string;
  } catch {
    // Handle error silently
  }
}

// Get a all TextRecords
export async function getBasenameTextRecords(basename: Basename) {
  try {
    const readContracts: ContractFunctionParameters[] =
      textRecordsKeysEnabled.map((key) =>
        buildBasenameTextRecordContract(basename, key),
      );
    const textRecords = await baseClient.multicall({
      contracts: readContracts,
    });

    return textRecords;
  } catch {
    // Handle error silently
  }
}

/**
 * Convert an chainId to a coinType hex for reverse chain resolution
 */
export const convertChainIdToCoinType = (chainId: number): string => {
  // L1 resolvers to addr
  if (chainId === mainnet.id) {
    return "addr";
  }

  const cointype = (0x80000000 | chainId) >>> 0;
  return cointype.toString(16).toLocaleUpperCase();
};

/**
 * Convert an address to a reverse node for ENS resolution
 */
export const convertReverseNodeToBytes = (
  address: Address,
  chainId: number,
) => {
  const addressFormatted = address.toLocaleLowerCase() as Address;
  const addressNode = keccak256(addressFormatted.substring(2) as Address);
  const chainCoinType = convertChainIdToCoinType(chainId);
  const baseReverseNode = namehash(
    `${chainCoinType.toLocaleUpperCase()}.reverse`,
  );
  const addressReverseNode = keccak256(
    encodePacked(["bytes32", "bytes32"], [baseReverseNode, addressNode]),
  );
  return addressReverseNode;
};

export async function getBasename(address: Address) {
  try {
    const addressReverseNode = convertReverseNodeToBytes(address, base.id);
    const basename = await baseClient.readContract({
      abi: L2ResolverAbi,
      address: BASENAME_L2_RESOLVER_ADDRESS,
      functionName: "name",
      args: [addressReverseNode],
    });
    if (basename) {
      return basename as Basename;
    }
  } catch {
    // Handle error silently
  }
}

export async function getAddressFromBasename(basename: Basename) {
  try {
    // First normalize the basename to ensure consistent processing
    const normalizedBasename = normalize(basename);

    // Apply the namehash algorithm to get the node
    const node = namehash(normalizedBasename);

    // Call addr function directly instead of using getEnsAddress
    const address = (await baseClient.readContract({
      abi: L2ResolverAbi,
      address: BASENAME_L2_RESOLVER_ADDRESS,
      functionName: "addr",
      args: [node],
    })) as Address;

    if (!address) {
      throw new Error(`No address found for basename: ${basename}`);
    }

    return address;
  } catch (error) {
    console.error("Error resolving basename to address:", error);
    throw error;
  }
}
