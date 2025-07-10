"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence, useAnimation } from "framer-motion"

// Functional component for a single segment of the progress bar
const ProgressBarSegment = ({ isActive, isPast }: { isActive: boolean; isPast: boolean }) => {
  const variants = {
    initial: { backgroundColor: "var(--segment-inactive)", opacity: 0.3, scale: 0.95 },
    past: { backgroundColor: "var(--segment-past)", opacity: 0.5, scale: 1 },
    active: { 
      backgroundColor: "var(--segment-active)", 
      opacity: 1, 
      scale: 1.15,
      transition: {
        scale: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
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
        backgroundColor: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: 0.6, ease: "easeInOut" },
      }}
    />
  )
}

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
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

    // Simulate loading with more dynamic, variable progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        // Create a more dynamic loading effect with variable speeds
        const progressFactor = prev < 40 ? 2.5 : 
                               prev < 70 ? 1.8 : 
                               prev < 90 ? 1.0 : 0.5
                               
        const randomFactor = Math.random() * 2.5
        const newProgress = prev + (randomFactor * progressFactor)
        
        if (newProgress >= 100) {
          clearInterval(interval)
          // Add a slight delay before exit to appreciate the 100% state
          setTimeout(() => setLoading(false), 400)
          return 100
        }
        return newProgress
      })
    }, 80) // Slightly faster interval

    return () => clearInterval(interval)
  }, [mounted])

  // Define colors for segments with enhanced contrast
  const segmentColors = `
    --segment-inactive: hsl(var(--muted) / 0.5);
    --segment-past: hsl(var(--primary) / 0.6);
    --segment-active: hsl(var(--primary) / 1);
  `

  if (!mounted) return null

  const totalSegments = 80 // Number of segments in the bar
  const activeSegment = Math.floor((progress / 100) * totalSegments)
  
  // Enhanced scale effect that grows more dramatically as progress increases
  const scaleAmount = 1 + (progress / 100) * 0.4
  
  // Pulse effect intensity increases with progress
  const pulseIntensity = 1 + (progress / 100) * 0.15

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 1 }}
          exit={{ 
            scale: 1.8, 
            opacity: 0,
            filter: "blur(8px)",
            rotateZ: 2
          }}
          transition={{ 
            duration: 1.2, 
            ease: [0.76, 0, 0.24, 1],
            opacity: { duration: 0.8 },
            scale: { duration: 1.2 }
          }}
          animate={backgroundControls}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
        >
          <style>{`:root { ${segmentColors} }`}</style>

          {/* Container for floating elements that add visual interest */}
          <motion.div 
            className="absolute inset-0 pointer-events-none opacity-20"
            animate={{ 
              opacity: [0.15, 0.25, 0.15], 
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 4, 
              ease: "easeInOut" 
            }}
          >
            {/* Add some ambient elements */}
            {Array.from({ length: 6 }).map((_, idx) => (
              <motion.div 
                key={idx}
                className="absolute w-32 h-32 rounded-full bg-primary/10"
                initial={{ 
                  x: Math.random() * 100 - 50 + "%", 
                  y: Math.random() * 100 - 50 + "%",
                  scale: Math.random() * 0.4 + 0.8
                }}
                animate={{ 
                  x: Math.random() * 100 - 50 + "%",
                  y: Math.random() * 100 - 50 + "%",
                  scale: [
                    Math.random() * 0.4 + 0.8,
                    Math.random() * 0.6 + 1.2,
                    Math.random() * 0.4 + 0.8
                  ],
                  opacity: [0.3, 0.7, 0.3]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 8 + idx * 4, 
                  ease: "easeInOut",
                  delay: idx * 0.5
                }}
              />
            ))}
          </motion.div>

          {/* Progress Bar Container with enhanced dynamics */}
          <motion.div 
            className="w-4/5 max-w-3xl relative mb-16 sm:mb-12"
            animate={{ 
              scale: scaleAmount,
              filter: progress > 50 ? `contrast(${pulseIntensity})` : "none"
            }}
            transition={{ 
              scale: { type: "spring", stiffness: 100, damping: 20 },
              filter: { duration: 2, ease: "easeInOut" }
            }}
            style={{ transformOrigin: "center" }}
          >
            <div className="flex h-2 gap-1 mb-8 sm:mb-6">
              {Array.from({ length: totalSegments }).map((_, index) => (
                <div key={index} className="flex-1">
                  <ProgressBarSegment
                    isActive={index === activeSegment}
                    isPast={index < activeSegment}
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