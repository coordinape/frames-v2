import { useEffect, useState } from "react";

interface FrameContext {
  address?: string;
  fid?: string;
  messageHash?: string;
  url?: string;
  isValid?: boolean;
  // Add other frame context properties as needed
}

export function useFrame() {
  const [isFrame, setIsFrame] = useState(false);
  const [frameContext, setFrameContext] = useState<FrameContext | null>(null);

  useEffect(() => {
    // Check if we're in a frame context
    // This is a simplified check - you may need to adjust based on actual frame detection logic
    const checkIfFrame = () => {
      // Check for Farcaster frame context in window object or URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const hasFrameParams =
        urlParams.has("fc") ||
        urlParams.has("fid") ||
        urlParams.has("messageHash");

      if (hasFrameParams) {
        setIsFrame(true);

        // Extract frame context from URL parameters
        const context: FrameContext = {
          fid: urlParams.get("fid") || undefined,
          address: urlParams.get("address") || undefined,
          messageHash: urlParams.get("messageHash") || undefined,
          url: urlParams.get("url") || undefined,
          isValid: true, // You might want to validate this
        };

        setFrameContext(context);
      } else {
        setIsFrame(false);
        setFrameContext(null);
      }
    };

    checkIfFrame();
  }, []);

  return { isFrame, frameContext };
}
