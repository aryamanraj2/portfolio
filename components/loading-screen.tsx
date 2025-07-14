"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import { useIsMobile } from "@/hooks/use-mobile"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

// Functional component for a single segment of the progress bar
const ProgressBarSegment = ({ isActive, isPast, delay, reducedMotion }: { isActive: boolean; isPast: boolean; delay: number; reducedMotion: boolean }) => {
  const variants = {
    initial: { 
      backgroundColor: "var(--segment-inactive)", 
      opacity: 0.2, 
      scale: 0.98,
      height: "100%"
    },
    past: { 
      backgroundColor: "var(--segment-past)", 
      opacity: 0.7, 
      scale: 1,
      height: "100%"
    },
    active: { 
      backgroundColor: "var(--segment-active)", 
      opacity: 1, 
      scale: reducedMotion ? 1 : 1.05,
      height: reducedMotion ? "100%" : "120%",
      transition: {
        scale: { duration: reducedMotion ? 0.1 : 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
        height: { duration: reducedMotion ? 0.1 : 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
        backgroundColor: { duration: reducedMotion ? 0.1 : 0.2, ease: "easeOut" }
      }
    },
  }

  const segmentState = isActive ? "active" : isPast ? "past" : "initial"

  return (
    <motion.div
      className="h-full w-full rounded-sm"
      variants={variants}
      initial="initial"
      animate={segmentState}
      transition={{ 
        backgroundColor: { duration: reducedMotion ? 0.1 : 0.3, ease: [0.23, 1, 0.32, 1], delay: reducedMotion ? 0 : delay * 0.01 },
        opacity: { duration: reducedMotion ? 0.1 : 0.4, ease: "easeOut", delay: reducedMotion ? 0 : delay * 0.01 },
        scale: { duration: reducedMotion ? 0.1 : 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
        height: { duration: reducedMotion ? 0.1 : 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
      }}
    />
  )
}

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const isMobile = useIsMobile()
  const prefersReducedMotion = useReducedMotion()
  const backgroundControls = useAnimation()
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle initial mounting
  useEffect(() => {
    setMounted(true)
    
    // Animate background pulse
    if (mounted) {
      backgroundControls.start({
        backgroundColor: ["rgba(0,0,0,0.98)", "rgba(0,0,0,0.95)", "rgba(0,0,0,0.98)"],
        transition: { 
          repeat: Infinity, 
          duration: 3,
          ease: "easeInOut" 
        }
      })
    }
  }, [mounted, backgroundControls])

  useEffect(() => {
    if (!mounted) return

    // Smooth, eased progress animation - faster on mobile/reduced motion
    const duration = (prefersReducedMotion || isMobile) ? 1200 : 2000 // Faster on mobile/reduced motion
    const startTime = Date.now()
    
    const animateProgress = () => {
      const elapsed = Date.now() - startTime
      const normalizedTime = Math.min(elapsed / duration, 1)
      
      // Use cubic-bezier easing for smooth acceleration and deceleration
      const easeInOutCubic = (t: number) => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      }
      
      const easedProgress = easeInOutCubic(normalizedTime) * 100
      setProgress(easedProgress)
      
      if (normalizedTime < 1) {
        requestAnimationFrame(animateProgress)
      } else {
        // Hold at 100% for a moment before exiting - shorter on mobile/reduced motion
        setTimeout(() => setLoading(false), (prefersReducedMotion || isMobile) ? 150 : 300)
      }
    }
    
    requestAnimationFrame(animateProgress)
  }, [mounted, prefersReducedMotion, isMobile])

  // Define colors for segments with enhanced contrast
  const segmentColors = `
    --segment-inactive: hsl(var(--muted) / 0.5);
    --segment-past: hsl(var(--primary) / 0.6);
    --segment-active: hsl(var(--primary) / 1);
  `

  if (!mounted) return null

  const totalSegments = 80 // Number of segments in the bar
  const activeSegment = Math.floor((progress / 100) * totalSegments)
  
  // Subtle scale effect that grows with progress
  const scaleAmount = 1 + (progress / 100) * 0.05

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 1 }}
          exit={{ 
            scale: 1.05, 
            opacity: 0,
            filter: "blur(3px)",
            y: -10
          }}
          transition={{ 
            duration: 0.6, 
            ease: [0.4, 0, 0.2, 1],
            opacity: { duration: 0.5, ease: [0.4, 0, 1, 1] },
            scale: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
            y: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
            filter: { duration: 0.5, ease: [0.4, 0, 1, 1] }
          }}
          animate={backgroundControls}
          className="fixed inset-0 z-60 flex flex-col items-center justify-center bg-background"
        >
          <style>{`:root { ${segmentColors} }`}</style>

          {/* Subtle background glow */}
          <motion.div 
            className="absolute inset-0 pointer-events-none"
            animate={{ 
              opacity: [0.1, 0.2, 0.1], 
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 6, 
              ease: "easeInOut" 
            }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-primary/10 blur-2xl" />
          </motion.div>

          {/* Progress Bar Container */}
          <motion.div 
            className="w-4/5 max-w-3xl relative mb-16 sm:mb-12"
            animate={{ 
              scale: scaleAmount
            }}
            transition={{ 
              scale: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
            }}
            style={{ transformOrigin: "center" }}
          >
            <div className="flex h-2 gap-1 mb-8 sm:mb-6 items-end">
              {Array.from({ length: totalSegments }).map((_, index) => (
                <div key={index} className="flex-1 flex items-end justify-center h-2">
                  <ProgressBarSegment
                    isActive={index === activeSegment}
                    isPast={index < activeSegment}
                    delay={index}
                    reducedMotion={prefersReducedMotion || isMobile}
                  />
                </div>
              ))}
            </div>
            
            {/* Percentage Text - centered on both mobile and desktop */}
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 text-xs font-mono font-medium text-primary/90"
              key={Math.round(progress)}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {Math.round(progress)}%
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
