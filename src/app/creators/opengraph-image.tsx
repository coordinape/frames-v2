import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Creator Directory";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
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
        <div
          style={{
            fontSize: "72px",
            fontWeight: "bold",
            color: "white",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          Creator Directory
        </div>
        <div
          style={{
            fontSize: "36px",
            color: "rgba(255, 255, 255, 0.9)",
            textAlign: "center",
          }}
        >
          Discover and connect with creators
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
