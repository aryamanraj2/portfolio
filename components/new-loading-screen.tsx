"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import { useIsMobile } from "@/hooks/use-mobile"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

// Enhanced Eye component with smooth triangle tracing
const Eye = ({ progress, shouldFadeOut }: { progress: number; shouldFadeOut: boolean }) => {
  const triangleProgress = Math.min(progress / 100, 1);
  const pupilOpacity = Math.max(0, Math.min((progress - 20) / 80, 1)); // Pupil appears after 20% progress

  return (
    <motion.div
      className="relative flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: shouldFadeOut ? 0 : 1,
        scale: shouldFadeOut ? 0.8 : 1
      }}
      transition={{
        duration: shouldFadeOut ? 0.4 : 0.6,
        ease: shouldFadeOut ? "easeOut" : "easeInOut"
      }}
    >
      <svg
        width="100"
        height="100"
        viewBox="0 0 120 120"
        className="overflow-visible"
      >
        {/* Background triangle (subtle) */}
        <polygon
          points="60,30 95,85 25,85"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.2"
          strokeDasharray="none"
        />
        
        {/* Animated triangle trace */}
        <motion.polygon
          points="60,30 95,85 25,85"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: triangleProgress }}
          transition={{
            duration: 0.1,
            ease: "easeOut"
          }}
          style={{
            filter: "drop-shadow(0 0 4px currentColor)"
          }}
        />
        
        {/* Animated pupil/dot */}
        <motion.circle
          cx="60"
          cy="65"
          r="4"
          fill="currentColor"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: pupilOpacity > 0 ? 1 : 0,
            opacity: pupilOpacity
          }}
          transition={{
            scale: { duration: 0.3, ease: "backOut" },
            opacity: { duration: 0.3, ease: "easeOut" }
          }}
        />
        
        {/* Subtle glow effect */}
        <motion.polygon
          points="60,30 95,85 25,85"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: triangleProgress }}
          transition={{
            duration: 0.1,
            ease: "easeOut"
          }}
          style={{
            filter: "blur(2px)"
          }}
        />
      </svg>
    </motion.div>
  );
};

// Simple thin loading bar component
const ThinLoadingBar = ({
  progress,
  isExpanding,
  shouldFadeOut
}: {
  progress: number;
  isExpanding: boolean;
  shouldFadeOut: boolean;
}) => {
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-10 h-0.5 bg-transparent overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: shouldFadeOut ? 0 : 1 }}
      transition={{
        opacity: shouldFadeOut ? { duration: 0.4, ease: "easeOut" } : { duration: 0.5, delay: 0.2 }
      }}
    >
      <motion.div
        className="h-full bg-primary"
        initial={{ width: "0%" }}
        animate={{
          width: `${progress}%`,
          scaleX: isExpanding ? 10 : 1
        }}
        transition={{
          width: { duration: 0.3, ease: "easeOut" },
          scaleX: isExpanding ?
            { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 } :
            { duration: 0.1 }
        }}
        style={{ transformOrigin: "left center" }}
      />
    </motion.div>
  );
};

// Enhanced Progress bar segment with expansion capability
const ProgressBarSegment = ({
  isActive,
  isPast,
  delay,
  reducedMotion,
  isExpanding,
  expansionDelay
}: {
  isActive: boolean;
  isPast: boolean;
  delay: number;
  reducedMotion: boolean;
  isExpanding: boolean;
  expansionDelay: number;
}) => {
  const variants = {
    initial: { backgroundColor: "var(--segment-inactive)", opacity: 0.2, scaleX: 1 },
    past: { backgroundColor: "var(--segment-past)", opacity: 0.7, scaleX: 1 },
    active: {
      backgroundColor: "var(--segment-active)",
      opacity: 1,
      scale: reducedMotion ? 1 : 1.05,
      scaleX: 1,
      transition: {
        scale: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as any },
        backgroundColor: { duration: 0.2, ease: "easeOut" as any }
      }
    },
    expanding: {
      backgroundColor: "var(--segment-active)",
      opacity: 1,
      scale: 1,
      scaleX: 8, // Dramatic horizontal stretch
      transition: {
        scaleX: { 
          duration: 0.6, 
          ease: [0.25, 0.46, 0.45, 0.94] as any,
          delay: expansionDelay * 0.02 // Staggered expansion
        },
        scale: { duration: 0.1, ease: "easeOut" as any }
      }
    }
  }
  
  const segmentState = isExpanding ? "expanding" : isActive ? "active" : isPast ? "past" : "initial"
  
  return (
    <motion.div
      className="h-full w-full rounded-sm will-change-transform"
      variants={variants}
      initial="initial"
      animate={segmentState}
      transition={{
        backgroundColor: { duration: 0.3, ease: [0.23, 1, 0.32, 1], delay: delay * 0.01 },
        opacity: { duration: 0.4, ease: "easeOut", delay: delay * 0.01 },
      }}
    />
  )
}

export default function NewLoadingScreen({ onLoadingComplete }: { onLoadingComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isExpanding, setIsExpanding] = useState(false)
  const [shouldFadeOut, setShouldFadeOut] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [showBlackCurtain, setShowBlackCurtain] = useState(false)
  const isMobile = useIsMobile()
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    const duration = (prefersReducedMotion || isMobile) ? 2000 : 2500 // Snappier duration
    const startTime = Date.now()

    const animateProgress = () => {
      const elapsed = Date.now() - startTime
      const normalizedTime = Math.min(elapsed / duration, 1)
      
      // Snappier easing curve
      const easeInOutCubic = (t: number) => {
        if (t < 0.95) {
          // Faster progression to 95%
          const adjustedT = t / 0.95 * 0.9
          return adjustedT < 0.5 ? 4 * adjustedT * adjustedT * adjustedT : 1 - Math.pow(-2 * adjustedT + 2, 3) / 2
        } else {
          // Rapid progression from 95% to 100%
          return 0.9 + (t - 0.95) / 0.05 * 0.1
        }
      }
      
      const easedProgress = easeInOutCubic(normalizedTime) * 100
      setProgress(easedProgress)

      if (normalizedTime < 1) {
        requestAnimationFrame(animateProgress)
      } else {
        // Phase 2: Start expansion sequence after reaching 100%
        setTimeout(() => {
          setIsExpanding(true)
          
          // Phase 3: Fade out auxiliary elements during expansion
          setTimeout(() => {
            setShouldFadeOut(true)
            
            // Phase 4: Show black curtain slide up
            setTimeout(() => {
              setShowBlackCurtain(true)
              
              // Phase 5: Complete transition to main content
              setTimeout(() => {
                setIsComplete(true)
                setTimeout(() => setLoading(false), 100)
              }, 600) // Wait for black curtain to slide up
            }, 400)
          }, 200)
        }, 150) // Snappier pause at 100%
      }
    }
    requestAnimationFrame(animateProgress)
  }, [prefersReducedMotion, isMobile])

  useEffect(() => {
    if (!loading) {
      onLoadingComplete()
    }
  }, [loading, onLoadingComplete])

  const segmentColors = `
    --segment-inactive: hsl(var(--muted) / 0.5);
    --segment-past: hsl(var(--primary) / 0.6);
    --segment-active: hsl(var(--primary) / 1);
  `
  const totalSegments = 80
  const activeSegment = Math.floor((progress / 100) * totalSegments)

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
          }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="fixed inset-0 z-60 flex flex-col items-center justify-center overflow-hidden"
          style={{ backgroundColor: '#F5F5F0' }} // Off-white background
        >
          <style>{`:root { ${segmentColors} }`}</style>
          
          {/* Simple thin loading bar at top - black color */}
          <div className="fixed top-0 left-0 right-0 z-10 h-0.5 bg-transparent overflow-hidden">
            <motion.div
              className="h-full"
              style={{ backgroundColor: '#000000' }}
              initial={{ width: "0%" }}
              animate={{
                width: `${progress}%`,
                opacity: shouldFadeOut ? 0 : 1
              }}
              transition={{
                width: { duration: 0.3, ease: "easeOut" },
                opacity: shouldFadeOut ? { duration: 0.3, ease: "easeOut" } : { duration: 0.5, delay: 0.2 }
              }}
            />
          </div>
          
          {/* Eye with black triangle */}
          <div className="relative flex items-center justify-center" style={{ color: '#000000' }}>
            <Eye progress={progress} shouldFadeOut={shouldFadeOut} />
          </div>
          
          {/* Expandable progress bar container - black segments */}
          <motion.div 
            className="relative mt-4"
            initial={{ width: "80%", maxWidth: "20rem" }}
            animate={{ 
              width: isExpanding ? "100vw" : "80%",
              maxWidth: isExpanding ? "none" : "20rem",
              opacity: shouldFadeOut ? 0 : 1
            }}
            transition={{
              width: {
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94],
                delay: isExpanding ? 0.05 : 0
              },
              opacity: shouldFadeOut ? { duration: 0.3, ease: "easeOut" } : {}
            }}
          >
            <motion.div 
              className="flex h-2 gap-1 items-end justify-center"
              style={{ 
                transformOrigin: "center",
                overflowX: isExpanding ? "visible" : "hidden",
                '--segment-inactive': 'rgba(0, 0, 0, 0.15)',
                '--segment-past': 'rgba(0, 0, 0, 0.5)',
                '--segment-active': 'rgba(0, 0, 0, 1)',
              } as React.CSSProperties}
            >
              {Array.from({ length: totalSegments }).map((_, index) => (
                <ProgressBarSegment
                  key={index}
                  isActive={index === activeSegment}
                  isPast={index < activeSegment}
                  delay={index}
                  reducedMotion={prefersReducedMotion || isMobile}
                  isExpanding={isExpanding}
                  expansionDelay={Math.abs(index - totalSegments / 2)} // Expand from center outward
                />
              ))}
            </motion.div>
            
            {/* Percentage counter with fade-out - black text */}
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 text-xs font-mono font-medium mt-2"
              style={{ color: '#000000', opacity: 0.9 }}
              key={Math.round(progress)}
              initial={{ opacity: 0 }}
              animate={{ opacity: shouldFadeOut ? 0 : 1 }}
              transition={{ 
                opacity: shouldFadeOut ? { duration: 0.3, ease: "easeOut" } : { duration: 0.2 }
              }}
            >
              {Math.round(progress)}%
            </motion.div>
          </motion.div>
          
          {/* Black curtain that slides up */}
          <AnimatePresence>
            {showBlackCurtain && (
              <motion.div
                className="fixed inset-0 z-50"
                style={{ backgroundColor: '#000000' }}
                initial={{ y: '100%' }}
                animate={{ y: '0%' }}
                exit={{ y: '-100%' }}
                transition={{
                  duration: 0.6,
                  ease: [0.65, 0, 0.35, 1] // Smooth easing curve
                }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
