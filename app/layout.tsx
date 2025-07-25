import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from '@vercel/analytics/next';
// import { PerformanceMonitor } from "@/components/PerformanceMonitor";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Fintrix",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        {/* {process.env.NODE_ENV === 'development' && <PerformanceMonitor />} */}
        <Header />
        <main className="min-h-screen ">{children}</main>
        <Analytics />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
