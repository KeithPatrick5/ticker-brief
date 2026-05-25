import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Doug's Search",
  description: "Search any ticker or company for a fast AI infrastructure research brief."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
