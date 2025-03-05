"use client";

import { useEffect, useState } from "react";
import sdk, { type Context } from "@farcaster/frame-sdk";

export default function JoinClient() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      setContext(context);
      console.log("Join Frame: Calling ready");
      sdk.actions.ready({});
    };

    if (sdk && !isSDKLoaded) {
      console.log("Join Frame: Calling load");
      setIsSDKLoaded(true);
      load();
      return () => {
        sdk.removeAllListeners();
      };
    }
  }, [isSDKLoaded]);

  return (
    <div className="min-h-screen bg-[#0066FF] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-4 h-4 bg-[#0066FF] rounded-full" />
            </div>
          </div>

          {/* Title */}
          <h1
            className="text-center font-mono text-4xl font-bold mb-4"
            style={{
              textShadow: "2px 2px 0 rgba(0,0,0,0.1)",
              letterSpacing: "-0.05em",
            }}
          >
            Create
            <br />
            on Base
          </h1>

          {/* Description */}
          <p className="text-center mb-12 opacity-90 px-8">
            Get listed on thecreators directory for better discovery and
            collaboration opportunities.
          </p>

          {/* Requirements */}
          <div className="bg-[#0052CC] bg-opacity-30 rounded-xl p-6 mb-8">
            <h2 className="text-sm uppercase tracking-wider mb-4 opacity-80">
              Requirements
            </h2>
            <ul className="space-y-4">
              <li className="flex items-center">
                <span className="mr-3">1.</span>
                Own a basename
              </li>
              <li className="flex items-center">
                <span className="mr-3">2.</span>
                Release NFTs on Base
              </li>
            </ul>
          </div>

          {/* User Info */}
          <div className="flex items-center justify-center gap-2 mb-4 text-sm">
            <span className="opacity-80">Signed in as</span>
            <div className="flex items-center">
              <img
                src="https://api.samplefaces.com/face?width=32"
                alt="Profile"
                className="w-5 h-5 rounded-full mr-2"
              />
              <span>maksim.base.eth</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              className="w-full bg-[#0052CC] text-white py-3 rounded-xl font-medium hover:bg-[#0047B3] transition-colors"
              onClick={() => (window.location.href = "/join/requirements")}
            >
              Check requirements
            </button>

            <button
              className="w-full text-center py-3 text-sm opacity-80 hover:opacity-100"
              onClick={() => {
                /* Add logout logic */
              }}
            >
              Log out
            </button>
          </div>

          {/* Bottom Bar */}
          <div className="fixed bottom-0 left-0 right-0 h-1 bg-white/20" />
        </div>
      </div>
    </div>
  );
}
