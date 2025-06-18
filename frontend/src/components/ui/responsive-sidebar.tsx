// components/layout/ResponsiveSidebar.tsx
"use client"
import { useIsMobile } from "@/hooks/use-mobile"
import { AppSidebar, type AppSidebarProps } from "@/components/ui/app-sidebar"
import { Sheet, SheetContent, SheetTrigger, SheetHeader,SheetTitle} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu as MenuIcon } from "lucide-react"
import React from "react"

interface Props {
  sidebarProps: AppSidebarProps
  children: React.ReactNode
}

export default function ResponsiveSidebar({ sidebarProps, children }: Props) {
  const isMobile = useIsMobile()

  // ---------- Mobile (< 768 px) ----------
  if (isMobile) {
    return (
      <>
        {/* hamburger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="fixed top-3 left-3 z-50"
            >
              <MenuIcon className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          {/* sliding drawer */}
          <SheetContent side="left" className="p-0 min-h-screen max-w-[280px]">
            <SheetHeader>
            <SheetTitle className="sr-only">Navigation Sidebar</SheetTitle>
            </SheetHeader>

            <AppSidebar {...sidebarProps} forceOpen />
        </SheetContent>
        </Sheet>

        {/* main page content */}
        <main className="pt-12 px-4">{children}</main>
      </>
    )
  }

  // ---------- Desktop (≥ 768 px) ----------
  return (
    <div className="flex">
      <AppSidebar {...sidebarProps} />
      <main className="flex-1">{children}</main>
    </div>
  )
}
