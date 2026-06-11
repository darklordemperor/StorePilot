import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppPreferencesProvider } from "@/components/app-preferences-provider";
import { AuthProvider } from "@/components/auth-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StorePilot",
  description: "Store operations dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppPreferencesProvider>
          <AuthProvider>{children}</AuthProvider>
        </AppPreferencesProvider>
      </body>
    </html>
  );
}
