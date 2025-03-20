import { ImageResponse } from "next/og";
import {
  baseBlue,
  basePixelLow,
  DEFAULT_FRAME_SIZE,
  IMAGE_URL_BASE,
} from "~/app/ogimage/helpers";

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
        <div tw="flex flex-col items-center justify-center flex-1">
          <img
            src={IMAGE_URL_BASE + "Base_Wordmark_White.png"}
            tw="h-14 mb-4"
            alt="BASE Logo"
          />
          <p tw="text-9xl my-0">Creators</p>
          <p tw="text-9xl my-0">Directory</p>
        </div>
        <img
          src={IMAGE_URL_BASE + "buddies.png"}
          tw="h-62"
          alt="Base Buddies"
        />
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
