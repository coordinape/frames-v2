import { ImageResponse } from "next/og";
import { baseBlue, basePixelLow, IMAGE_URL_BASE } from "./helpers";
import { NextRequest } from "next/server";

// export const runtime = 'edge'; // Add this line to use the Edge runtime
const size = {
  width: 600,
  height: 400,
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "CoCreator Frames";

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
        <h1 tw="text-2xl">{title}</h1>
        <h1 tw="text-xl">{IMAGE_URL_BASE + "Base_Symbol_White.png"}</h1>
        <div tw="flex items-center justify-center flex-1">
          <img
            src={IMAGE_URL_BASE + "Base_Symbol_White.png"}
            tw="h-38 mr-5"
            width={100}
            height={100}
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
