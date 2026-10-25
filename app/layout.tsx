import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

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
    <html lang="en" className={`h-full antialiased ${poppins.variable}`}>
      <body className={`${poppins.className} min-h-full flex flex-col bg-[#e6abb2] text-[#2C2220]`}>
        {children}
      </body>
    </html>
  );
}
