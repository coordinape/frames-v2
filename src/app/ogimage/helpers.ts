import fs from "fs";
import path from "path";

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

export const IMAGE_URL_BASE = `${process.env.NEXT_PUBLIC_URL ?? process.env.VERCEL_URL}/images/`;
