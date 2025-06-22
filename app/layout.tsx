import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import MotherWrapper from "@/components/general/MotherWrapper";
import { Toaster } from "sonner";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tourney Master",
  description: "Your ultimate tournament management tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.className} antialiased`}>
        <MotherWrapper>
          {children}
          <Toaster richColors position="bottom-right" />
        </MotherWrapper>
      </body>
    </html>
  );
}
