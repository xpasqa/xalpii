import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CurrencyProvider } from "../components/providers/CurrencyProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alpii Travel",
  description: "Travel website foundation for Alpii"
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CurrencyProvider>{children}</CurrencyProvider>
      </body>
    </html>
  );
}
