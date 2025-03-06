"use client";

import { useState, useEffect } from "react";
import { getAddress, isAddress } from "viem";
import {
  getBasename,
  getBasenameTextRecords,
  textRecordsKeysEnabled,
  getAddressFromBasename,
  type Basename,
} from "./basenames";

export default function ENSResolver({
  initialValue,
}: {
  initialValue: string;
}) {
  const [inputValue, setInputValue] = useState(initialValue);
  const [address, setAddress] = useState("");
  const [basename, setBasename] = useState("");
  const [textRecords, setTextRecords] = useState<(string | undefined)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("inputValue", inputValue);
    if (inputValue) {
      if (isAddress(inputValue)) {
        setAddress(inputValue);
        resolveAddress(inputValue);
      } else if (inputValue.endsWith(".base.eth")) {
        setBasename(inputValue);
        resolveBasename(inputValue);
      }
    }
  }, [inputValue]);

  const resolveBasename = async (name: string) => {
    try {
      setLoading(true);
      setError("");
      setTextRecords([]);
      setBasename(name);

      const resolvedAddress = await getAddressFromBasename(name as Basename);
      setAddress(resolvedAddress);

      const records = await getBasenameTextRecords(name as Basename);
      if (records) {
        setTextRecords(
          records.map((record) => record.result as string | undefined)
        );
      }
    } catch (err) {
      setError("Error resolving Base name. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resolveAddress = async (addr: string) => {
    if (!addr) return;

    try {
      setLoading(true);
      setError("");
      setTextRecords([]);

      // Validate and format the address
      const formattedAddress = getAddress(addr);
      setAddress(formattedAddress);

      const name = await getBasename(formattedAddress);
      setBasename(name || "No Base name found");

      // If we found a basename, fetch its text records
      if (name) {
        const records = await getBasenameTextRecords(name as Basename);
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
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter Ethereum address or Base name"
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          onClick={() =>
            inputValue &&
            (isAddress(inputValue)
              ? resolveAddress(inputValue)
              : resolveBasename(inputValue))
          }
          disabled={loading || !inputValue}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Resolving..." : "Resolve"}
        </button>
        {error && <p className="text-red-500">{error}</p>}
        {basename && !error && (
          <div className="mt-4 space-y-4">
            <div>
              <p className="font-semibold">Base Name:</p>
              <p>{basename}</p>
            </div>
            {address && (
              <div>
                <p className="font-semibold">Ethereum Address:</p>
                <p className="font-mono">{address}</p>
              </div>
            )}
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
