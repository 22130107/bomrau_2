import type { Metadata, Viewport } from "next";
import { Open_Sans, Nunito } from "next/font/google";
import "./globals.css";
import { ContactButton } from "@/components/ContactButton";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin", "vietnamese"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "vietnamese"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "shoptft",
  description: "Shop TFT uy tín, chất lượng",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${openSans.variable} ${nunito.variable}`}>
      <body className="min-h-screen bg-[rgb(15,23,42)] text-[rgb(238,238,238)] font-[family-name:var(--font-open-sans)]">
        {children}
      </body>
    </html>
  );
}
