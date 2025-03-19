"use client";

import { useState } from "react";
import { joinDirectory } from "~/app/features/directory/actions";

interface JoinDirectoryButtonProps {
  address: string;
  name: string;
}

export default function JoinDirectoryButton({
  address,
  name,
}: JoinDirectoryButtonProps) {
  const [isJoining, setIsJoining] = useState(false);
  const [joinStatus, setJoinStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );

  const handleJoin = async () => {
    try {
      setIsJoining(true);
      setJoinStatus("idle");

      const success = await joinDirectory(address, name);

      if (success) {
        setJoinStatus("success");
        // Refresh the page after a short delay to show updated membership status
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setJoinStatus("error");
      }
    } catch (error) {
      console.error("Error joining directory:", error);
      setJoinStatus("error");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleJoin}
        disabled={isJoining || joinStatus === "success"}
        className={`px-4 py-2 rounded-md font-medium transition-colors ${
          joinStatus === "success"
            ? "bg-green-500 text-white"
            : joinStatus === "error"
              ? "bg-red-100 text-red-700 hover:bg-red-200"
              : "bg-blue-500 text-white hover:bg-blue-600"
        } ${isJoining ? "opacity-70 cursor-not-allowed" : ""}`}
      >
        {isJoining
          ? "Joining..."
          : joinStatus === "success"
            ? "Joined Successfully!"
            : joinStatus === "error"
              ? "Failed to Join - Try Again"
              : "Join Directory"}
      </button>

      {joinStatus === "success" && (
        <p className="mt-2 text-sm text-green-600">
          Successfully joined the directory! Refreshing page...
        </p>
      )}

      {joinStatus === "error" && (
        <p className="mt-2 text-sm text-red-600">
          There was an error joining the directory. Please try again.
        </p>
      )}
    </div>
  );
}
