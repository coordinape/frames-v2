import React from "react";
import Logo from "./Logo";
import WhoAmI from "~/components/WhoAmI";

interface HeaderProps {
  logoOnly?: boolean;
}

export default function Header({ logoOnly = false }: HeaderProps) {
  return (
    <div className={`flex ${logoOnly ? "justify-center" : "justify-between"} items-start mb-8`}>
      <Logo />
      {!logoOnly && <WhoAmI />}
    </div>
  );
}
