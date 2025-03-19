import { ImageResponse } from "next/og";

export const alt = "CoCreator Frames";
export const size = {
  width: 600,
  height: 400,
};

export const contentType = "image/png";

export default async function Image({
  searchParams = {},
}: { searchParams?: { [key: string]: string | string[] | undefined } } = {}) {
  const title =
    typeof searchParams.title === "string"
      ? searchParams.title
      : "CoCreator Frames";

  return new ImageResponse(
    (
      <div tw="h-full w-full flex flex-col justify-center items-center relative bg-white">
        <h1 tw="text-6xl">{title}</h1>
      </div>
    ),
    {
      ...size,
    },
  );
}
