import { ImageResponse } from "next/og";
import {
  baseBlue,
  basePixelLow,
  IMAGE_URL_BASE,
  DEFAULT_FRAME_SIZE,
} from "./helpers";

// export const runtime = 'edge'; // Add this line to use the Edge runtime
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
            tw="h-57 mr-7"
            alt="BASE Logo"
          />
          <div tw="flex flex-col justify-start">
            <p tw="text-7xl mt-0 mb-1">Join</p>
            <p tw="text-7xl mt-0 mb-1">The Creators</p>
            <p tw="text-7xl mt-0 mb-1">Directory</p>
          </div>
        </div>
      </div>
    ),
    {
      ...DEFAULT_FRAME_SIZE,
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
