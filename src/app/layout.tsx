import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header/Header";
import { FloatingActionButton } from "@/components/support-dialogs/FloatingActionButton";
import { AppProviders } from "@/components/providers/AppProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LGTB Analytics",
  description: "Lets Get This Bread Analytics",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning

      >
        <AppProviders>
          <div className="min-h-screen flex flex-col container mx-auto relative">
            <Header />
            <main className="flex-1">
              <div className="w-full px-1 sm:px-4 lg:px-4 py-2">
                {children}
              </div>
            </main>
            <FloatingActionButton />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
