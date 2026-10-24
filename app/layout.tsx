import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Petal | Anonymous Menstrual Health Peer Support",
  description: "A warm, safe, anonymous peer support sanctuary for menstrual health. Share your journey, find people who understand, and chat safely.",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FAF6F0",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#FAF6F0] text-[#2C2220]">
        {children}
      </body>
    </html>
  );
}
