"use client"

import { useEffect, useCallback, useRef } from 'react'
import { gsap } from 'gsap'

interface SmoothScrollOptions {
  lerp?: number
  duration?: number
  easing?: string
  onScroll?: (data: { scroll: number; velocity: number; direction: number }) => void
}

export function useSmoothScroll(options: SmoothScrollOptions = {}) {
  const {
    lerp = 0.1,
    duration = 1,
    easing = "power2.out",
    onScroll
  } = options

  const scrollDataRef = useRef({
    current: 0,
    target: 0,
    velocity: 0,
    direction: 0,
    lastScrollTop: 0
  })

  const rafRef = useRef<number | undefined>(undefined)
  const isScrollingRef = useRef(false)

  // Throttled scroll handler for better performance
  const handleScroll = useCallback(() => {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop
    const data = scrollDataRef.current

    // Calculate velocity and direction
    data.velocity = currentScroll - data.lastScrollTop
    data.direction = data.velocity > 0 ? 1 : data.velocity < 0 ? -1 : 0
    data.target = currentScroll
    data.lastScrollTop = currentScroll

    // Fire scroll callback
    if (onScroll) {
      onScroll({
        scroll: currentScroll,
        velocity: data.velocity,
        direction: data.direction
      })
    }

    isScrollingRef.current = true

    // Clear existing timeout and set new one
    clearTimeout(isScrollingRef.current as any)
    setTimeout(() => {
      isScrollingRef.current = false
    }, 150)
  }, [onScroll])

  // Smooth animation loop
  const animate = useCallback(() => {
    const data = scrollDataRef.current
    
    // Smooth interpolation
    data.current += (data.target - data.current) * lerp
    
    // Update scroll position smoothly for custom elements
    const progress = Math.abs(data.current - data.target) < 0.1

    if (!progress) {
      rafRef.current = requestAnimationFrame(animate)
    }
  }, [lerp])

  // Scroll to element with smooth animation
  const scrollTo = useCallback((target: string | number | HTMLElement, options: {
    offset?: number
    duration?: number
    easing?: string
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

    // Add offset
    targetPosition += options.offset || 0

    // Use GSAP for smooth scrolling to target
    gsap.to(window, {
      scrollTo: {
        y: targetPosition,
        autoKill: false
      },
      duration: options.duration || duration,
      ease: options.easing || easing,
      onUpdate: () => {
        handleScroll()
      }
    })
  }, [duration, easing, handleScroll])

  useEffect(() => {
    // Passive scroll listener for better performance
    const scrollOptions = { passive: true }
    
    window.addEventListener('scroll', handleScroll, scrollOptions)
    
    // Start animation loop
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [handleScroll, animate])

  return {
    scrollTo,
    scrollData: scrollDataRef.current,
    isScrolling: isScrollingRef.current
  }
}

// Enhanced intersection observer hook for better scroll animations
export function useScrollInView(
  threshold: number = 0.1,
  rootMargin: string = '0px 0px -10% 0px'
) {
  const elementRef = useRef<HTMLElement>(null)
  const isInViewRef = useRef(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isInViewRef.current = entry.isIntersecting
          
          // Add/remove optimization classes
          if (entry.isIntersecting) {
            element.classList.add('scroll-optimized')
          } else {
            element.classList.remove('scroll-optimized')
          }
        })
      },
      {
        threshold,
        rootMargin
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin])

  return {
    ref: elementRef,
    isInView: isInViewRef.current
  }
}

// Optimized scroll-triggered animation hook
export function useScrollAnimation(
  animationFn: (progress: number) => void,
  dependencies: any[] = []
) {
  const elementRef = useRef<HTMLElement>(null)
  const rafRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const handleScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }

      rafRef.current = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect()
        const windowHeight = window.innerHeight
        
        // Calculate progress (0 to 1)
        const progress = Math.max(0, Math.min(1, 
          (windowHeight - rect.top) / (windowHeight + rect.height)
        ))

        animationFn(progress)
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, dependencies)

  return elementRef
}