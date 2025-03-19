import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

// export const runtime = 'edge'; // Add this line to use the Edge runtime
export const baseBlue = "#0053ff";
// Load the font file
export const basePixelLow = fs.readFileSync(
  path.join(process.cwd(), "public/fonts/BasePixel-LowResolution.ttf"),
);
export const basePixelMedium = fs.readFileSync(
  path.join(process.cwd(), "public/fonts/BasePixel-MediumResolution.ttf"),
);
export const IMAGE_URL_BASE =
  process.env.VERCEL_ENV === "production"
    ? "https://dir-stg.coordinape.com/images/"
    : "http://localhost:3012/images/";
const size = {
  width: 600,
  height: 400,
};

export async function GET() {
  return new ImageResponse(
    (
      <div
        tw="h-full w-full flex flex-col justify-between items-center relative text-white"
        style={{
          backgroundColor: baseBlue, // This is the bg-base-blue color
          fontFamily: "BasePixel-Low",
          letterSpacing: "0.02em",
        }}
      >
        <div tw="flex items-center justify-center flex-1">
          <img
            src={IMAGE_URL_BASE + "Base_Symbol_White.png"}
            tw="h-38 mr-5"
            alt="BASE Logo"
          />
          <div tw="flex flex-col justify-start">
            <p tw="text-5xl mt-0 mb-1">Join</p>
            <p tw="text-5xl mt-0 mb-1">The Creators</p>
            <p tw="text-5xl mt-0 mb-1">Directory</p>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      headers: {
        "Content-Type": "image/png",
      },
      // Include the font in the response
      fonts: [
        {
          name: "BasePixel-Low",
          data: basePixelLow,
          style: "normal",
          weight: 400,
        },
      ],
    },
  );
}
