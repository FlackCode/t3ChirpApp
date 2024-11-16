import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Chirp",
  description: "Following Tutorial",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <ClerkProvider>
          <TRPCReactProvider><Toaster position="bottom-center"/>
            <main className="flex justify-center h-screen">
              <div className="w-full md:max-w-2xl border-x border-slate-400">
                {children}
              </div>
            </main>
          </TRPCReactProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
