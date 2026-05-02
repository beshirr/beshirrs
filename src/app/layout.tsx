import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "beshirr.dev",
  description: "Software Engineer focused on systems / backend."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jetbrainsMono.className} bg-black text-zinc-100 antialiased`}>
        <div className="min-h-screen">
          <Navbar />
          <main className="mx-auto w-full max-w-5xl px-6 py-16">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
