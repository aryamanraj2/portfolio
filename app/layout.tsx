import type React from "react"
import type { Metadata, Viewport } from "next"
import { Outfit } from "next/font/google"
import { Syne } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import SvgFilters from "@/components/svg-filters"
import LoadingScreen from "@/components/loading-screen"
import { Toaster } from "@/components/ui/toaster"
import { HoverProvider } from "@/context/HoverContext"
import "@fontsource-variable/rethink-sans" // Import Rethink Sans font
import "../public/fonts/neue-metana/neue-metana.css"

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" })
const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["700", "800"],
})

export const metadata: Metadata = {
  title: "Aryaman Jaiswal | Developer Portfolio",
  description: "Professional developer portfolio showcasing skills and projects",
  generator: 'v0.dev'
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevent zoom on mobile forms
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="antialiased">
      <body className={cn("min-h-screen font-sans cursor-hidden dark", outfit.variable, syne.variable)} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false} disableTransitionOnChange>
          <HoverProvider>
            <SvgFilters />
            <LoadingScreen />
            {children}
            <Toaster />
          </HoverProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
