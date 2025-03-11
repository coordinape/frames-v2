"use client";

import { useEffect, useState } from "react";
import sdk, { type Context } from "@farcaster/frame-sdk";
import Header from "~/app/components/Header";

interface ProfileFormData {
  profilePicture: File | null;
  baseName: string;
  farcasterUsername: string;
  location: string;
  bio: string;
}

export default function CreateProfilePage() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();
  const [formData, setFormData] = useState<ProfileFormData>({
    profilePicture: null,
    baseName: "yonfrula.base.eth",
    farcasterUsername: "@yonfrula",
    location: "Los Angeles, CA",
    bio: "degenerative artist - /yon-experience :/",
  });

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      setContext(context);
      console.log("Create Profile Frame: Calling ready");
      sdk.actions.ready({});
    };

    if (sdk && !isSDKLoaded) {
      console.log("Create Profile Frame: Calling load");
      setIsSDKLoaded(true);
      load();
      return () => {
        sdk.removeAllListeners();
      };
    }
  }, [isSDKLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Add form submission logic here
    window.location.href = "/join/welcome";
  };

  return (
    <div className="min-h-screen bg-base-blue text-white">
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 px-6 pt-8">
          <Header />

          {/* Title */}

          <h1 className="text-center font-mono text-4xl font-bold mb-4 base-pixel derp">
            Create
            <br />
            Your Profile
          </h1>

          {/* Description */}
          <p className="text-center mb-12 text-white/90">Verify the details to be added to your profile.</p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Picture */}
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">PROFILE PICTURE</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  <img src="https://api.samplefaces.com/face?width=200" alt="Profile" className="w-full h-full object-cover" />
                </div>
                <button type="button" className="px-4 py-2 border border-white/20 rounded-full text-sm hover:bg-white/10 transition-colors">
                  Upload new
                </button>
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData({ ...formData, profilePicture: file });
                    }
                  }}
                />
              </div>
            </div>

            {/* Primary Base Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">PRIMARY BASE NAME</label>
              <div className="relative">
                <input type="text" value={formData.baseName} readOnly className="w-full bg-white/10 rounded-xl px-4 py-3 pr-10" />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Farcaster Profile */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">FARCASTER PROFILE</label>
              <input
                type="text"
                value={formData.farcasterUsername}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    farcasterUsername: e.target.value,
                  })
                }
                className="w-full bg-white/10 rounded-xl px-4 py-3"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">LOCATION</label>
              <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full bg-white/10 rounded-xl px-4 py-3" />
            </div>

            {/* Submit Button */}
            <button type="submit" className="w-full bg-white text-[#0066FF] py-3 rounded-full font-medium hover:bg-opacity-90 transition-colors mt-12">
              Submit
            </button>
          </form>

          {/* Bio Text */}
          <p className="text-white/60 text-sm mt-6 text-center">degenerative artist - /yon-experience :/</p>
        </div>
      </div>
    </div>
  );
}
