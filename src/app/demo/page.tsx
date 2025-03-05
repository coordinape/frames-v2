"use client";

import dynamic from "next/dynamic";

const Demo = dynamic(() => import("~/components/Demo"), {
  ssr: false,
});

export default function DemoPage() {
  return <Demo title="Frames v2 Demo" />;
}
