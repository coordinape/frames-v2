import { ImageResponse } from "next/og";
import { resolveBasenameOrAddress } from "~/app/hooks/useBasenameResolver";
import { getCreator } from "~/app/features/directory/creator-actions";

export const runtime = "edge";

export const alt = "Creator Profile";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: { username: string };
}) {
  const resolution = await resolveBasenameOrAddress(params.username);
  const creator = resolution?.address
    ? await getCreator(resolution.address)
    : null;
  const displayName =
    creator?.resolution?.basename || creator?.name || "Creator";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0053ff",
          padding: "40px 60px",
        }}
      >
        {creator?.avatar && (
          <img
            src={creator.avatar}
            alt={displayName}
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "60px",
              marginBottom: "20px",
            }}
          />
        )}
        <div
          style={{
            fontSize: "60px",
            fontWeight: "bold",
            color: "white",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          {displayName}
        </div>
        {creator?.description && (
          <div
            style={{
              fontSize: "32px",
              color: "rgba(255, 255, 255, 0.9)",
              textAlign: "center",
              maxWidth: "800px",
            }}
          >
            {creator.description}
          </div>
        )}
      </div>
    ),
    {
      ...size,
    },
  );
}
