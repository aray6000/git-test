import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import ClientBody from "./ClientBody";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "CodePaste | Modern Code & Text Sharing Platform",
  description:
    "A powerful and intuitive platform for sharing code snippets and text. Share, collaborate, and manage your code with our modern and secure platform.",
  keywords: [
    "pastebin",
    "code sharing",
    "text sharing",
    "programming",
    "syntax highlighting",
    "password protection",
    "expiration",
    "collaboration",
  ],
  authors: [{ name: "CodePaste Team" }],
  openGraph: {
    title: "CodePaste | Modern Code & Text Sharing Platform",
    description:
      "A powerful and intuitive platform for sharing code snippets and text.",
    url: "https://codepaste.app",
    siteName: "CodePaste",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodePaste | Modern Code & Text Sharing Platform",
    description:
      "A powerful and intuitive platform for sharing code snippets and text.",
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
        <AuthProvider>
          <ClientBody>{children}</ClientBody>
        </AuthProvider>
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
