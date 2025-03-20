const baseUrl = process.env.NEXT_PUBLIC_URL ?? process.env.VERCEL_URL;
const isLocalhost = baseUrl?.includes("localhost");
export const APP_BASE_URL = baseUrl
  ? `${isLocalhost ? "http" : "https"}://${baseUrl}`
  : "";
