import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { CountryProvider } from "@/context/CountryContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Basketly | Fresh groceries, delivered",
    template: "%s | Basketly",
  },
  description:
    "Shop groceries, household essentials, drinks, snacks, and everyday necessities with Basketly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <CountryProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </CountryProvider>
      </body>
    </html>
  );
}