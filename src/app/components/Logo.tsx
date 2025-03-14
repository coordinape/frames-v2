import React from "react";

interface LogoProps {
  logoSrc?: string;
  altText?: string;
  className?: string;
}

export default function Logo({ logoSrc = "/Base_Symbol_White.png", altText = "Base Logo", className = "text-center mb-2" }: LogoProps) {
  return (
    <div className={className}>
      <img src={logoSrc} alt={altText} className="w-6 mx-auto" />
    </div>
  );
}
