import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "dfiver-worker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#010101] text-white">{children}</body>
    </html>
  );
}
