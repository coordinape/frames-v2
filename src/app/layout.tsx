import type { Metadata } from "next";

import PlausibleProvider from "next-plausible";

import "~/app/globals.css";

export const metadata: Metadata = {
  title: "Based Creators Directory",
  description: "Based Creators Directory",
  icons: {
    icon: "/favicon.png", // This will be your new favicon
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <PlausibleProvider domain="dir.coordinape.com">
        <body>{children}</body>
      </PlausibleProvider>
    </html>
  );
}
