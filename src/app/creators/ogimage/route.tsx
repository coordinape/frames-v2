import { ImageResponse } from "next/og";
import {
  baseBlue,
  basePixelLow,
  DEFAULT_FRAME_SIZE,
  IMAGE_URL_BASE,
} from "~/app/ogimage/helpers";
import { getCreators } from "~/app/features/directory/creators-actions";

export async function GET() {
  // Get all creators
  const creators = await getCreators();

  // Filter creators with avatars
  const creatorsWithAvatars = creators.filter((creator) => creator.avatar);

  // Get 3 random creators
  const randomCreators = [];
  const usedIndexes = new Set();

  while (
    randomCreators.length < 3 &&
    usedIndexes.size < creatorsWithAvatars.length
  ) {
    const randomIndex = Math.floor(Math.random() * creatorsWithAvatars.length);
    if (!usedIndexes.has(randomIndex)) {
      usedIndexes.add(randomIndex);
      randomCreators.push(creatorsWithAvatars[randomIndex]);
    }
  }

  // If we don't have enough creators with avatars, pad with placeholders
  while (randomCreators.length < 3) {
    randomCreators.push({
      name: "?",
      avatar: undefined,
      id: `placeholder-${randomCreators.length}`,
      address: "",
    });
  }

  return new ImageResponse(
    (
      <div
        tw="h-full w-full flex flex-col justify-between items-center relative text-white"
        style={{
          backgroundColor: baseBlue,
          fontFamily: "BasePixel-Low",
          letterSpacing: "0.02em",
        }}
      >
        <div tw="flex flex-col items-center justify-end flex-1">
          <img
            src={IMAGE_URL_BASE + "Base_Wordmark_White.png"}
            tw="h-14 mb-4"
            alt="BASE Logo"
          />
          <p tw="text-9xl my-0">Creators</p>
          <p tw="text-9xl my-0">Directory</p>

          <div
            tw="flex flex-row items-center justify-center border-[6px] border-white/30 rounded-[32px] rounded-b-none p-8 bg-white/10 pb-0 mt-10"
            style={{ marginBottom: "-26px" }}
          >
            {randomCreators.map((creator) => (
              <div key={creator.id} tw="flex flex-col items-center mx-2">
                {creator.avatar ? (
                  <img
                    src={creator.avatar}
                    tw="w-56 h-56 rounded-[32px] border-[6px] border-white/30"
                    alt={creator.name}
                  />
                ) : (
                  <div tw="w-56 h-56 rounded-[32px] bg-white/20 flex items-center justify-center border-[6px] border-white/20">
                    <span tw="text-white text-4xl">
                      {creator.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...DEFAULT_FRAME_SIZE,
      headers: {
        "Content-Type": "image/png",
      },
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
