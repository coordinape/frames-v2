export const CIRCLE_ID = 31712;
export const ENTRANCE = "frames-be";

export const CREATORS_CACHE_KEY = "creators-directory-all";
export const REVALIDATION_LOCK_KEY = "creators-directory-revalidation-lock";
export const CACHE_DURATION = 300; // 5 minutes in seconds
export const LOCK_DURATION = 30; // 30 second lock to prevent multiple processes
export const REVALIDATION_WINDOW = 60; // Start revalidating when less than 1 minute left

// Single creator cache constants
export const SINGLE_CREATOR_CACHE_PREFIX = "creator:";
export const SINGLE_CREATOR_LOCK_PREFIX = "creator_lock:";
export const SINGLE_CREATOR_CACHE_DURATION = 900; // 15 minutes in seconds
export const SINGLE_CREATOR_REVALIDATION_WINDOW = 60; // Start revalidating when less than 1 minute left
