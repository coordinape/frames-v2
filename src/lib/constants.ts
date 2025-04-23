const baseUrl = process.env.NEXT_PUBLIC_URL ?? process.env.VERCEL_URL;
const isLocalhost = baseUrl?.includes("localhost");
export const APP_BASE_URL = baseUrl?.startsWith("http")
  ? baseUrl
  : baseUrl
    ? `${isLocalhost ? "http" : "https"}://${baseUrl}`
    : "";
export const APP_PUBLIC_URL = "https://dir.coordinape.com";
export const DEBUG = process.env.DEBUG === "true";

export const debugLog = (...args: Parameters<typeof console.log>) => {
  if (DEBUG) console.log(...args);
};

export const debugError = (...args: Parameters<typeof console.error>) => {
  if (DEBUG) console.error(...args);
};
