import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SpeedInsights } from "@vercel/speed-insights/next"
import React, { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-sans",
});



export const metadata: Metadata = {
  title: "BTviz",
  description: "The Bluetooth LE Visualizer for Wearables",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} antialiased`}>

          <div className="flex w-screen">
            <main className="flex-1 flex flex-col overflow-y-auto p-6 gap-6 bg-background">
              <Toaster position="bottom-right" richColors />
              {children}
              <SpeedInsights />
            </main>
          </div>

      </body>
    </html>
  );
}
