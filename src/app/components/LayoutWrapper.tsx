import React from "react";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <div className="min-h-screen bg-base-blue text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">{children}</div>
      </div>
    </div>
  );
}
