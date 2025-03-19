import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

// export const runtime = 'edge'; // Add this line to use the Edge runtime
const size = {
  width: 600,
  height: 400,
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ username: string }> },
) {
  const { username } = await context.params;

  return new ImageResponse(
    (
      <div tw="h-full w-full flex flex-col justify-center items-center relative bg-white">
        <h1 tw="text-6xl">{username}</h1>
      </div>
    ),
    {
      ...size,
      headers: {
        "Content-Type": "image/png",
      },
    },
  );
}
