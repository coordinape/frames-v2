/**
 * Type definitions for the directory feature
 */

export interface Creator {
  id: string;
  address: string;
  name: string;
  avatar?: string;
  bio?: string;
}

export interface BasenameResolution {
  basename?: string;
  address: string;
  resolved: boolean;
}

export interface OpenSeaCollection {
  id: string;
  name?: string;
  description?: string;
  imageUrl?: string;
  bannerImageUrl?: string;
}

export interface OpenSeaData {
  collections: OpenSeaCollection[];
}

export interface CreatorWithOpenSeaData extends Creator {
  openSeaData?: OpenSeaData;
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
