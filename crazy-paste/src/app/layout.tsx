import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import ClientBody from "./ClientBody";

export const metadata: Metadata = {
  title: "CrazyPaste | Next-Gen Code & Text Sharing",
  description:
    "The most visually stunning pastebin site with powerful features for code and text sharing. Share, protect, and customize your pastes with our cyberpunk-inspired platform.",
  keywords: [
    "pastebin",
    "code sharing",
    "text sharing",
    "cyberpunk",
    "syntax highlighting",
    "password protection",
    "expiration",
    "burn after reading",
  ],
  authors: [{ name: "CrazyPaste Team" }],
  openGraph: {
    title: "CrazyPaste | Next-Gen Code & Text Sharing",
    description:
      "The most visually stunning pastebin site with powerful features for code and text sharing.",
    url: "https://crazypaste.vercel.app",
    siteName: "CrazyPaste",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CrazyPaste | Next-Gen Code & Text Sharing",
    description:
      "The most visually stunning pastebin site with powerful features for code and text sharing.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Audiowide&family=Rajdhani:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <ClientBody>{children}</ClientBody>
        <Toaster
          position="top-right"
          theme="dark"
          richColors
          toastOptions={{
            style: {
              background: 'hsl(240 10% 3.9%)',
              border: '1px solid hsl(275 80% 50% / 0.5)',
              color: 'hsl(0 0% 98%)',
            },
          }}
        />
      </body>
    </html>
  );
}
