"use client";

import { useEffect, useState } from "react";
import sdk, { type Context } from "@farcaster/frame-sdk";

interface Requirement {
  id: string;
  label: string;
  verified: boolean;
}

export default function RequirementsPage() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();
  const [requirements, setRequirements] = useState<Requirement[]>([
    { id: "basename", label: "Farcaster basename ownership", verified: false },
    { id: "nfts", label: "NFT releases on Base", verified: false },
  ]);

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      setContext(context);
      console.log("Requirements Frame: Calling ready");
      sdk.actions.ready({});
    };

    if (sdk && !isSDKLoaded) {
      console.log("Requirements Frame: Calling load");
      setIsSDKLoaded(true);
      load();
      return () => {
        sdk.removeAllListeners();
      };
    }
  }, [isSDKLoaded]);

  const allRequirementsMet = requirements.every((req) => req.verified);

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-blue-700 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">
            Verify Requirements
          </h1>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
            {requirements.map((req) => (
              <div key={req.id} className="flex items-center mb-4 last:mb-0">
                <div
                  className={`w-6 h-6 rounded-full mr-4 flex items-center justify-center
                  ${req.verified ? "bg-green-500" : "bg-white/20"}`}
                >
                  {req.verified && (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <span className="flex-1">{req.label}</span>
                <button
                  className="ml-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    // Add verification logic here
                    setRequirements((reqs) =>
                      reqs.map((r) =>
                        r.id === req.id ? { ...r, verified: true } : r
                      )
                    );
                  }}
                >
                  Verify
                </button>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              className={`px-8 py-3 rounded-full font-semibold transition-colors
                ${
                  allRequirementsMet
                    ? "bg-white text-blue-700 hover:bg-blue-50"
                    : "bg-white/20 cursor-not-allowed"
                }`}
              disabled={!allRequirementsMet}
              onClick={() =>
                allRequirementsMet && (window.location.href = "/join/create")
              }
            >
              Create your profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
