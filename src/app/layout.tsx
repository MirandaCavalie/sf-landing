import type { Metadata, Viewport } from "next";
import { Anton, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Anton({ variable: "--font-display", weight: "400", subsets: ["latin"] });
const sans = Inter({ variable: "--font-sans", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"] });

const title = "SF Landing — land like a local";
const description = "A crew of AI agents that lands you in San Francisco with the insider tips nobody tells you.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: "website", images: [{ url: "/brand/og.svg", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title, description, images: ["/brand/og.svg"] },
};

export const viewport: Viewport = { themeColor: "#f04a23" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable} ${mono.variable} antialiased`}>{children}</body>
    </html>
  );
}
