import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { InlineScript } from "@/components/InlineScript";
import { OG_IMAGE_ALT, OG_IMAGE_SIZE } from "@/lib/og";
import { THEME_SCRIPT } from "@/lib/theme-script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DESCRIPTION = "A to-do list with priorities, deadlines and task types.";

// Open Graph tags so shared links show a title, description and image
// (SEO basics in the root CLAUDE.md; TD86). No `twitter` field: Next.js copies
// these into twitter:* tags on its own.
export const metadata: Metadata = {
  metadataBase: new URL("https://todo-plus.adrianc.dev"),
  title: "To Do +",
  description: DESCRIPTION,
  openGraph: {
    title: "To Do +",
    description: DESCRIPTION,
    url: "/",
    siteName: "To Do +",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og.png",
        ...OG_IMAGE_SIZE,
        alt: OG_IMAGE_ALT,
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      // The theme script may set data-theme before React loads (TD12).
      suppressHydrationWarning
    >
      <head>
        <InlineScript html={THEME_SCRIPT} />
      </head>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
