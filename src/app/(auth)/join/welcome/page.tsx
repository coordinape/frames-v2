"use client";

import { useEffect, useState } from "react";
import sdk, { type Context } from "@farcaster/frame-sdk";
import LayoutWrapper from "~/app/components/LayoutWrapper";
import Header from "~/app/components/Header";

export default function WelcomePage() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      setContext(context);
      console.log("Welcome Frame: Calling ready");
      sdk.actions.ready({});
    };

    if (sdk && !isSDKLoaded) {
      console.log("Welcome Frame: Calling load");
      setIsSDKLoaded(true);
      load();
      return () => {
        sdk.removeAllListeners();
      };
    }
  }, [isSDKLoaded]);

  // Mock profile data - this would come from your backend
  const profile = {
    username: "alice.base",
    profilePicture: "https://api.samplefaces.com/face?width=200", // Placeholder image
    location: "San Francisco, CA",
  };

  const shareProfile = () => {
    // Implement social sharing logic
    const shareText = `Just joined the Base Creator Directory as ${profile.username}! Check out my profile:`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`);
  };

  return (
    <LayoutWrapper>
      <Header logoOnly />
      <div className="mb-8">
        <h1 className="text-center font-mono text-4xl font-bold mb-4 base-pixel">You&apos;re In!</h1>
        <p className="text-center opacity-90">Welcome to the Base Creator Directory</p>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 mb-8">
        <div className="mb-6">
          <img src={profile.profilePicture} alt={profile.username} className="w-24 h-24 rounded-full mx-auto mb-4" />
          <h2 className="text-2xl font-bold">{profile.username}</h2>
          <p className="opacity-80">{profile.location}</p>
        </div>

        <div className="space-y-4">
          <button onClick={shareProfile} className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Share on Social Media
          </button>

          <button onClick={() => (window.location.href = "/creators")} className="w-full bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Enter Directory
          </button>
        </div>
      </div>

      <div className="animate-bounce">
        <span className="text-4xl">✨</span>
      </div>
    </LayoutWrapper>
  );
}
