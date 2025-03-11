import React from "react";

interface HeaderProps {
  logoSrc?: string;
  altText?: string;
  className?: string;
}

export default function Header({ logoSrc = "/Base_Symbol_White.png", altText = "Base Logo", className = "text-center mb-2" }: HeaderProps) {
  return (
    <div className={className}>
      <img src={logoSrc} alt={altText} className="w-6 h-6 mx-auto mb-4" />
    </div>
  );
}
