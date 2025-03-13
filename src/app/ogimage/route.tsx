import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

// export const runtime = 'edge'; // Add this line to use the Edge runtime
const size = {
  width: 600,
  height: 400,
};


export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'CoCreator Frames';

  
  
  return new ImageResponse(
    (
      <div tw="h-full w-full flex flex-col justify-center items-center relative bg-white">
        <h1 tw="text-6xl">{title}</h1>
      </div>
    ),
    {
      ...size,
      headers: {
        'Content-Type': 'image/png',
      },
    }
  );
}
