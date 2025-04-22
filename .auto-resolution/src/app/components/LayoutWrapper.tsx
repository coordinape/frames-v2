import React from "react";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <div className="min-h-screen bg-base-blue text-white">
      <div className="max-w-md mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
