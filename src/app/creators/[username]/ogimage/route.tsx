import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getCreator } from "~/app/features/directory/actions";
import { resolveBasenameOrAddress } from "~/app/hooks/useBasenameResolver";
import {
  baseBlue,
  basePixelLow,
  DEFAULT_OG_SIZE,
  Denim,
  IMAGE_URL_BASE,
} from "~/app/ogimage/helpers";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ username: string }> },
) {
  const { username } = await context.params;

  // Resolve the username and get creator data
  const resolution = await resolveBasenameOrAddress(username);
  const creator = resolution?.address
    ? await getCreator(resolution.address)
    : null;

  if (!creator) {
    return new ImageResponse(
      (
        <div
          tw="h-full w-full flex flex-col justify-center items-center relative"
          style={{
            backgroundColor: baseBlue, // This is the bg-base-blue color
          }}
        >
          <h1 tw="text-6xl text-white">Creator Not Found</h1>
        </div>
      ),
      {
        ...DEFAULT_OG_SIZE,
        headers: {
          "Content-Type": "image/png",
        },
      },
    );
  }

  const displayName = creator.resolution?.basename || creator.name;
  const collections = creator.openSeaData?.collections || [];

  // Take up to 4 collections to display
  const displayCollections = collections.slice(0, 5);

  return new ImageResponse(
    (
      <div
        tw="h-full w-full flex flex-col justify-between items-start p-5 text-white"
        style={{
          backgroundColor: baseBlue,
          fontFamily: "Sans, Helvetica, Arial, sans-serif !important",
        }}
      >
        <div tw="flex items-center justify-center flex-1">
          <img
            src={IMAGE_URL_BASE + "Base_Symbol_White.png"}
            tw="h-20 mr-5"
            alt="BASE Logo"
          />
          <div
            tw="flex flex-col justify-start"
            style={{ fontFamily: "Inter, Helvetica" }}
          >
            <p tw="text-4xl mt-0 mb-1">Based Creator</p>
            <p tw="text-4xl mt-0 mb-1">Showcase</p>
          </div>
        </div>
        <div tw="flex items-center justify-center flex-1">
          {creator.avatar ? (
            <img
              src={creator.avatar}
              alt={creator.name}
              width="60"
              height="60"
              tw="rounded-full mr-4"
            />
          ) : (
            <div tw="w-[60px] h-[60px] rounded-full bg-white/20 flex items-center justify-center mr-4">
              <span tw="text-2xl text-white font-bold">
                {creator.name.charAt(0)}
              </span>
            </div>
          )}
          <h1
            tw="text-4xl text-white"
            style={{
              fontFamily: "BasePixel-Low",
              letterSpacing: "0.02em",
            }}
          >
            {displayName}
          </h1>
          <svg
            className="h-30 w-30 mr-1.5"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.5212 2.62368C11.3146 1.75255 12.6852 1.75255 13.4786 2.62368L14.4988 3.74391C14.8997 4.18418 15.476 4.42288 16.0709 4.39508L17.5844 4.32435C18.7613 4.26934 19.7306 5.23857 19.6756 6.41554L19.6048 7.92905C19.577 8.52388 19.8157 9.10016 20.256 9.50111L21.3762 10.5213C22.2474 11.3147 22.2474 12.6853 21.3762 13.4787L20.256 14.4989C19.8157 14.8998 19.577 15.4761 19.6048 16.071L19.6756 17.5845C19.7306 18.7614 18.7613 19.7307 17.5844 19.6757L16.0709 19.6049C15.476 19.5771 14.8997 19.8158 14.4988 20.2561L13.4786 21.3763C12.6852 22.2475 11.3146 22.2475 10.5212 21.3763L9.50099 20.2561C9.10004 19.8158 8.52376 19.5771 7.92893 19.6049L6.41541 19.6757C5.23845 19.7307 4.26922 18.7614 4.32423 17.5845L4.39496 16.071C4.42276 15.4761 4.18406 14.8998 3.74379 14.4989L2.62356 13.4787C1.75243 12.6853 1.75243 11.3147 2.62356 10.5213L3.74379 9.50111C4.18406 9.10016 4.42276 8.52388 4.39496 7.92905L4.32423 6.41553C4.26922 5.23857 5.23845 4.26934 6.41542 4.32435L7.92893 4.39508C8.52376 4.42288 9.10004 4.18418 9.50099 3.74391L10.5212 2.62368Z"
              stroke="white"
              strokeWidth="1.5"
            />
            <path
              d="M9 12L11 14L15 10"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Collections Grid */}
        {displayCollections.length > 0 && (
          <div tw="flex flex-col" style={{ fontFamily: "Sans" }}>
            <h2 tw="text-xl text-white mb-4 uppercase">Latest Onchain Work</h2>
            <div tw="flex flex-row">
              {displayCollections.map((collection, index) => (
                <div
                  key={index}
                  tw="bg-white/10 rounded-lg flex items-center mr-4"
                >
                  {collection.imageUrl ? (
                    <img
                      src={collection.imageUrl}
                      alt={collection.name}
                      width="100"
                      height="100"
                      tw="rounded-lg"
                    />
                  ) : (
                    <div tw="flex w-[100px] h-[100px] bg-white/20 rounded-lg" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    ),
    {
      ...DEFAULT_OG_SIZE,
      headers: {
        "Content-Type": "image/png",
      },
      fonts: [
        {
          name: "Denim",
          data: Denim,
          style: "normal",
          weight: 400,
        },
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
