"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Ensure component is mounted before rendering UI to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Render a placeholder or null during SSR and hydration
    return <Button variant="ghost" size="icon" disabled className="opacity-50 w-11 h-11"></Button>
  }

  return (
    <Button
      variant="ghost" // Use ghost variant for subtle look
      size="icon"      // Standard icon button size
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      className="relative overflow-hidden w-11 h-11 active:scale-95 active:bg-secondary/50" // Better touch target
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
} 