import { ImageResponse } from "next/og";
import { baseBlue, basePixelLow, IMAGE_URL_BASE } from "~/app/ogimage/helpers";

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
        <div tw="flex flex-col items-center justify-center flex-1">
          <img
            src={IMAGE_URL_BASE + "Base_Wordmark_White.png"}
            tw="h-10 mb-2"
            alt="BASE Logo"
          />
          <p tw="text-7xl my-0">Creators</p>
          <p tw="text-7xl my-0">Directory</p>
        </div>
        <img
          src={IMAGE_URL_BASE + "buddies.png"}
          tw="h-38"
          alt="Base Buddies"
        />
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
