import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";

import "./globals.css";
import { ConvexClientProvider } from "./provider/ConvexClientProvider";

export const metadata: Metadata = {
  title: "yBudget",
  description: "Budget management for organizations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en">
        <body
          className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
          suppressHydrationWarning
        >
          <ConvexClientProvider>
            {children}
            <Toaster position="bottom-center" />
          </ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
