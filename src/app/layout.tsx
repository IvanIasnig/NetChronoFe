import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./global.scss";
import Navbar from "@/components/Navbar/Navbar";
import { navLinks } from "@/constants/navLinks";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Speed Test Professionale",
  description:
    "Misura la tua velocità di download, upload, ping, jitter e packet loss con precisione.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Navbar navLinks={navLinks} />
        <main className="layout__main">{children}</main>
      </body>
    </html>
  );
}
