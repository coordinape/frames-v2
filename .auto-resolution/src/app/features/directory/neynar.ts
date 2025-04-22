"use server";

import { resolveBasenameOrAddress } from "~/app/hooks/useBasenameResolver";

interface NeynarVerifiedAddress {
  address: string;
  verified: boolean;
}

interface NeynarVerifiedAccount {
  platform: string;
  username: string;
  verified: boolean;
}

interface NeynarUser {
  object: string;
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  custody_address: string;
  profile: {
    bio: {
      text: string;
    };
  };
  follower_count: number;
  following_count: number;
  verifications: string[];
  verified_addresses: {
    eth_addresses: string[];
    sol_addresses: string[];
    primary: {
      eth_address: string | null;
      sol_address: string | null;
    };
  };
  verified_accounts: NeynarVerifiedAccount[];
  power_badge: boolean;
}

interface NeynarUserResponse {
  users: NeynarUser[];
  next: {
    cursor: string | null;
  };
}

/**
 * Gets verified addresses for a Farcaster user from Neynar API
 */
async function getVerifiedAddressesFromNeynar(
  fid: string,
): Promise<NeynarVerifiedAddress[]> {
  const apiKey = process.env.NEYNAR_API_KEY;
  if (!apiKey) {
    throw new Error("NEYNAR_API_KEY is not configured");
  }

  const response = await fetch(
    `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
    {
      headers: {
        api_key: apiKey,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Neynar API error: ${response.status}`);
  }

  const data = (await response.json()) as NeynarUserResponse;

  if (!data.users || data.users.length === 0) {
    throw new Error(`No user found for FID: ${fid}`);
  }

  const user = data.users[0];

  // Convert eth_addresses to NeynarVerifiedAddress format
  const verifiedAddresses: NeynarVerifiedAddress[] =
    user.verified_addresses.eth_addresses.map((address) => ({
      address,
      verified: true,
    }));

  // Include custody address if it's not already in the list
  if (
    user.custody_address &&
    !verifiedAddresses.some(
      (v) => v.address.toLowerCase() === user.custody_address.toLowerCase(),
    )
  ) {
    verifiedAddresses.push({
      address: user.custody_address,
      verified: true,
    });
  }

  return verifiedAddresses;
}

/**
 * Gets the best address to use for a Farcaster user, preferring addresses with basenames
 */
export async function getBestAddressForFid(fid: string): Promise<string> {
  // Get all verified addresses from Neynar
  const verifiedAddresses = await getVerifiedAddressesFromNeynar(fid);

  // Check each address for a basename
  const addressesWithResolution = await Promise.all(
    verifiedAddresses.map(async ({ address }) => {
      const resolution = await resolveBasenameOrAddress(address);
      return {
        address,
        hasBasename: !!resolution?.basename,
        basename: resolution?.basename,
      };
    }),
  );

  // First try to find an address with a basename
  const addressWithBasename = addressesWithResolution.find(
    (addr) => addr.hasBasename,
  );
  if (addressWithBasename) {
    return addressWithBasename.address;
  }

  // If no address has a basename, return the first verified address
  if (verifiedAddresses.length > 0) {
    return verifiedAddresses[0].address;
  }

  throw new Error(`No verified addresses found for FID: ${fid}`);
}
