"use client"

import { createContext, useContext, useEffect, useRef, ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface SmoothScrollContextType {
  scrollTo: (target: string | number | HTMLElement, options?: {
    offset?: number
    duration?: number
    ease?: string
  }) => void
  refresh: () => void
  isScrolling: boolean
}

const SmoothScrollContext = createContext<SmoothScrollContextType | null>(null)

export function useSmoothScroll() {
  const context = useContext(SmoothScrollContext)
  if (!context) {
    throw new Error('useSmoothScroll must be used within SmoothScrollProvider')
  }
  return context
}

interface SmoothScrollProviderProps {
  children: ReactNode
}

export default function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const isScrollingRef = useRef(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Enhanced scroll-to function with momentum
  const scrollTo = (target: string | number | HTMLElement, options: {
    offset?: number
    duration?: number
    ease?: string
  } = {}) => {
    let targetPosition: number

    if (typeof target === 'number') {
      targetPosition = target
    } else if (typeof target === 'string') {
      const element = document.querySelector(target) as HTMLElement
      if (!element) return
      targetPosition = element.offsetTop
    } else {
      targetPosition = target.offsetTop
    }

    // Add offset and account for navbar height
    targetPosition += (options.offset || 0) - 80

    // Clear existing scroll timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    isScrollingRef.current = true

    // Use GSAP for buttery smooth scrolling
    gsap.to(window, {
      scrollTo: {
        y: targetPosition,
        autoKill: false,
      },
      duration: options.duration || 1.2,
      ease: options.ease || "power2.out",
      onComplete: () => {
        isScrollingRef.current = false
      }
    })

    // Fallback timeout
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false
    }, (options.duration || 1.2) * 1000 + 100)
  }

  const refresh = () => {
    if (typeof window !== 'undefined' && ScrollTrigger) {
      ScrollTrigger.refresh()
    }
  }

  useEffect(() => {
    // Optimize scroll performance
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Update scroll-triggered animations
          if (ScrollTrigger) {
            ScrollTrigger.update()
          }
          ticking = false
        })
        ticking = true
      }
    }

    // Passive scroll listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Initialize ScrollTrigger settings for premium scroll feel
    if (ScrollTrigger) {
      ScrollTrigger.config({
        autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
        ignoreMobileResize: true
      })

      // Smooth scroll for anchor links
      ScrollTrigger.addEventListener("scrollEnd", () => {
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current)
        }
        isScrollingRef.current = false
      })
    }

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  // Handle anchor link clicks for smooth scrolling
  useEffect(() => {
    const handleAnchorClick = (e: Event) => {
      const target = e.target as HTMLAnchorElement
      const href = target.getAttribute('href')
      
      if (href && href.startsWith('#')) {
        e.preventDefault()
        scrollTo(href)
      }
    }

    document.addEventListener('click', handleAnchorClick)
    return () => document.removeEventListener('click', handleAnchorClick)
  }, [])

  const contextValue: SmoothScrollContextType = {
    scrollTo,
    refresh,
    isScrolling: isScrollingRef.current
  }

  return (
    <SmoothScrollContext.Provider value={contextValue}>
      {children}
    </SmoothScrollContext.Provider>
  )
}