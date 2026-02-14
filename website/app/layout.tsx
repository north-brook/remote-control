import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "./components/header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Remote Control — Check on Your Machines in Seconds",
  description:
    "SSH, screen share, or open Cursor on any Tailscale machine. One command, zero config. Built for monitoring servers running autonomous agents.",
  metadataBase: new URL("https://remotecontrol.sh"),
  keywords: [
    "remote control",
    "tailscale ssh",
    "screen sharing",
    "remote terminal",
    "server monitoring",
    "ai agent monitoring",
  ],
  openGraph: {
    title: "Remote Control — Check on Your Machines in Seconds",
    description:
      "SSH, screen share, or open Cursor on any Tailscale machine. One command, zero config.",
    url: "https://remotecontrol.sh",
    siteName: "Remote Control",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Remote Control — Check on Your Machines in Seconds",
    description:
      "SSH, screen share, or open Cursor on any Tailscale machine. One command, zero config.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
