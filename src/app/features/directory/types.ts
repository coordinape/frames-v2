/**
 * Type definitions for the directory feature
 */

import { BasenameTextRecordKeys } from "~/app/creators/[username]/basenames";

export interface Creator {
  id: string;
  address: string;
  name: string;
  avatar?: string;
  description?: string;
}

export interface BasenameResolution {
  basename?: string;
  address: string;
  resolved: boolean;
  textRecords?: Record<BasenameTextRecordKeys, string | undefined>;
}

export interface OpenSeaCollection {
  id?: string;
  name?: string;
  imageUrl?: string;
  openseaUrl?: string;
  projectUrl?: string;
  contractAddress?: string;
}

export interface NFTData {
  collections: OpenSeaCollection[];
}

export interface CreatorWithNFTData extends Creator {
  nftData?: NFTData;
  resolution?: BasenameResolution | null;
}

export interface Give {
  skill: string;
  created_at: string;
  warpcast_url: string;
}

export type GroupedGives = Record<string, Give[]>;

export interface SortedGiveGroup {
  count: number;
  gives: Give[];
  skill: string;
}
