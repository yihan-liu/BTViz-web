import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SpeedInsights } from "@vercel/speed-insights/next"


export const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-sans",
});

// const openSans = Open_Sans({
//   variable: "--font-open-sans",
//   subsets: ["latin"],
//   weight: ["400", "500", "700"], // Common weights for flexibility
// });


// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "BTVIZ - SpectraDerma",
  description: "The SpectraDerma Bluetooth Visualizer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} antialiased`}
      >
        <Toaster position="bottom-right" richColors/>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
