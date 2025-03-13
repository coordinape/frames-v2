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