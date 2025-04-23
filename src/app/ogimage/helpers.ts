import fs from "fs";
import path from "path";
import { APP_BASE_URL } from "~/lib/constants";

export const baseBlue = "#0053ff";

// Load the font files
export const basePixelLow = fs.readFileSync(
  path.join(process.cwd(), "public/fonts/BasePixel-LowResolution.ttf"),
);

export const basePixelMedium = fs.readFileSync(
  path.join(process.cwd(), "public/fonts/BasePixel-MediumResolution.ttf"),
);

export const Denim = fs.readFileSync(
  path.join(process.cwd(), "public/fonts/Denim-Regular.ttf"),
);

export const IMAGE_URL_BASE = APP_BASE_URL ? `${APP_BASE_URL}/images/` : "";

export const DEFAULT_FRAME_SIZE = {
  width: 960,
  height: 640,
} as const;

export const DEFAULT_FRAME_SIZE_2_1 = {
  width: 960,
  height: 480,
} as const;
