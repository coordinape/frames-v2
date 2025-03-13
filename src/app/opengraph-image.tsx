import { ImageResponse } from "next/og";
import { headers } from "next/headers";

export const alt = "CoCreator Frames";
export const size = {
  width: 600,
  height: 400,
};

export const contentType = "image/png";

export default async function Image() {
  const headersList = await headers();
  const url = new URL(headersList.get("x-url") || "");
  const title = url.searchParams.get("title") || "CoCreator Frames";
  
  return new ImageResponse(
    (
      <div tw="h-full w-full flex flex-col justify-center items-center relative bg-white">
        <h1 tw="text-6xl">{title}</h1>
      </div>
    ),
    {
      ...size,
    }
  );
}
