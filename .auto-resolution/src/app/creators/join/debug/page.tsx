import { Metadata } from "next";
import DebugClient from "./DebugClient";

export default function DebugPage() {
  return <DebugClient />;
}

export const metadata: Metadata = {
  title: "Debug Join Experience",
  description: "Debug tools for the creator directory join experience",
};
