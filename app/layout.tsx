import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Afriwork BPO CRM",
  description: "Internal CRM scaffold for Afriwork BPO."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
