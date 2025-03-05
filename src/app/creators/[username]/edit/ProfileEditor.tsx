"use client";

import { useEffect, useState } from "react";
import sdk, { type Context } from "@farcaster/frame-sdk";

interface ProfileFormData {
  profilePicture: File | null;
  location: string;
  bio: string;
  socialLinks: {
    twitter: string;
    instagram: string;
    website: string;
  };
}

interface ProfileEditorProps {
  username: string;
}

export default function ProfileEditor({ username }: ProfileEditorProps) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();
  const [formData, setFormData] = useState<ProfileFormData>({
    profilePicture: null,
    location: "San Francisco, CA",
    bio: "Digital artist and creator on Base",
    socialLinks: {
      twitter: "twitter.com/example",
      instagram: "instagram.com/example",
      website: "example.com",
    },
  });

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      setContext(context);
      console.log("Edit Profile Frame: Calling ready");
      sdk.actions.ready({});
    };

    if (sdk && !isSDKLoaded) {
      console.log("Edit Profile Frame: Calling load");
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
    window.location.href = `/creators/${username}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 to-pink-500">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Edit Profile</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Profile Picture
              </h2>
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                  {formData.profilePicture ? (
                    <img
                      src={URL.createObjectURL(formData.profilePicture)}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">📷</span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData({ ...formData, profilePicture: file });
                    }
                  }}
                  className="flex-1 text-white"
                />
              </div>
            </div>

            {/* Basic Info */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Basic Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-white mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white h-24"
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Social Links
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-white mb-2">Twitter</label>
                  <input
                    type="text"
                    value={formData.socialLinks.twitter}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: {
                          ...formData.socialLinks,
                          twitter: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Instagram</label>
                  <input
                    type="text"
                    value={formData.socialLinks.instagram}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: {
                          ...formData.socialLinks,
                          instagram: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Website</label>
                  <input
                    type="text"
                    value={formData.socialLinks.website}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: {
                          ...formData.socialLinks,
                          website: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() =>
                  (window.location.href = `/creators/${username}`)
                }
                className="flex-1 bg-white/10 text-white px-6 py-3 rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-white text-purple-700 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}