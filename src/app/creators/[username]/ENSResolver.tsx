"use client";

import { useState } from "react";
import { resolveBasenameOrAddress } from "~/app/hooks/useBasenameResolver";
import type { BasenameTextRecordKeys } from "./basenames";

interface ENSResolverProps {
  initialValue: string;
  initialData?: Awaited<ReturnType<typeof resolveBasenameOrAddress>>;
}

interface Resolution {
  basename: string;
  address: string;
  textRecords: Record<BasenameTextRecordKeys, string | undefined>;
  error: string | null;
}

export default function ENSResolver({
  initialValue,
  initialData,
}: ENSResolverProps) {
  const [inputValue, setInputValue] = useState(initialValue);
  const [resolution, setResolution] = useState<Resolution>(
    initialData || {
      basename: "",
      address: "",
      textRecords: {} as Record<BasenameTextRecordKeys, string | undefined>,
      error: null,
    },
  );
  const [loading, setLoading] = useState(false);

  const handleResolve = async () => {
    if (!inputValue) return;

    try {
      setLoading(true);
      const result = await resolveBasenameOrAddress(inputValue);
      if (!result) {
        setResolution({
          basename: "",
          address: "",
          textRecords: {} as Record<BasenameTextRecordKeys, string | undefined>,
          error: "No resolution found",
        });
        return;
      }
      setResolution({
        ...result,
        error: null,
      });
    } catch (err) {
      setResolution((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "An unknown error occurred",
      }));
    } finally {
      setLoading(false);
    }
  };

  const formatKey = (key: string) => {
    return key
      .replace(/^com\.|^xyz\.|^org\./, "")
      .split(".")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Base Name Resolver for Address</h2>
      <div className="space-y-4">
        <div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter Ethereum address or Base name"
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          onClick={handleResolve}
          disabled={loading || !inputValue}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Resolving..." : "Resolve"}
        </button>
        {resolution.error && <p className="text-red-500">{resolution.error}</p>}
        {resolution.basename && !resolution.error && (
          <div className="mt-4 space-y-4">
            <div>
              <p className="font-semibold">Base Name:</p>
              <p>{resolution.basename}</p>
            </div>
            {resolution.address && (
              <div>
                <p className="font-semibold">Ethereum Address:</p>
                <p className="font-mono">{resolution.address}</p>
              </div>
            )}
            {resolution.textRecords &&
              Object.keys(resolution.textRecords).length > 0 && (
                <div>
                  <p className="font-semibold mb-2">Profile Information:</p>
                  <div className="grid gap-2">
                    {Object.entries(resolution.textRecords).map(
                      ([key, value]) =>
                        value && (
                          <div key={key} className="flex">
                            <span className="font-medium w-24">
                              {formatKey(key)}:
                            </span>
                            <span className="flex-1">{value}</span>
                          </div>
                        ),
                    )}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
