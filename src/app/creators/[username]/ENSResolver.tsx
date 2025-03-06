"use client";

import { useState } from "react";
import { getAddress } from "viem";
import {
  getBasename,
  getBasenameTextRecords,
  textRecordsKeysEnabled,
  type Basename,
} from "./basenames";

export default function ENSResolver({ address }: { address: string }) {
  const [basename, setBasename] = useState("");
  const [textRecords, setTextRecords] = useState<(string | undefined)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resolveAddress = async () => {
    if (!address) return;

    try {
      setLoading(true);
      setError("");
      setTextRecords([]);

      // Validate and format the address
      const formattedAddress = getAddress(address);

      const name = await getBasename(formattedAddress);
      setBasename(name || "No Base name found");

      // If we found a basename, fetch its text records
      if (name) {
        const records = await getBasenameTextRecords(name as Basename);
        console.log("records", records);
        if (records) {
          setTextRecords(
            records.map((record) => record.result as string | undefined)
          );
        }
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes("invalid address")) {
        setError("Please enter a valid Ethereum address");
      } else {
        setError("Error resolving Base name. Please try again.");
      }
      console.error(err);
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
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter Ethereum address"
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          onClick={resolveAddress}
          disabled={loading || !address}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Resolving..." : "Resolve Base Name"}
        </button>
        {error && <p className="text-red-500">{error}</p>}
        {basename && !error && (
          <div className="mt-4 space-y-4">
            <div>
              <p className="font-semibold">Base Name:</p>
              <p>{basename}</p>
            </div>
            {textRecords.length > 0 && (
              <div>
                <p className="font-semibold mb-2">Profile Information:</p>
                <div className="grid gap-2">
                  {textRecords.map(
                    (record, index) =>
                      record && (
                        <div
                          key={textRecordsKeysEnabled[index]}
                          className="flex"
                        >
                          <span className="font-medium w-24">
                            {formatKey(textRecordsKeysEnabled[index])}:
                          </span>
                          <span className="flex-1">{record}</span>
                        </div>
                      )
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
