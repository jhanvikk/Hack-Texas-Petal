import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Petal | A Safe Haven for Her Health",
  description: "A warm, safe, anonymous peer support network for women's health. Share your journey, find peers who understand, and chat safely.",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#e6abb2",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#e6abb2] text-[#2C2220]">
        {children}
      </body>
    </html>
  );
}
