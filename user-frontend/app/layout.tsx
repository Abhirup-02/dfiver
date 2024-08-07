import type { Metadata } from "next";
import "./globals.css";
import AppWalletProvider from "@/components/WalletProvider";
import dynamic from "next/dynamic";

const Appbar = dynamic(() => import('@/components/Appbar'), {
  ssr: false
})

export const metadata: Metadata = {
  title: "dfiver-user",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#131313] text-white">
        <AppWalletProvider>
          <Appbar />
          {children}
        </AppWalletProvider>
      </body>
    </html>
  );
}
