import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Query from "@/components/reactQuery/Query";
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Demo",
  description: "Be happy with your demo",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Query>
          <main>{children}</main>
        </Query>
        <Toaster />
      </body>
    </html>
  );
}
