import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ticker Brief",
  description: "Fast AI infrastructure stock research dashboard."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
