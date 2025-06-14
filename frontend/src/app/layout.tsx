import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Tennis Tournament",
  description: "Professional tennis tournament management platform",
  keywords: ["tennis", "tournament", "sports", "management"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
