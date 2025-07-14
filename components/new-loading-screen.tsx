"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import { useIsMobile } from "@/hooks/use-mobile"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

// Eye component
const Eye = ({ progress }: { progress: number }) => {
  const trianglePerimeter = 140; // Approximate perimeter for the new triangle
  const eyeProgress = Math.min(progress / 100, 1);
  const eyeDashOffset = trianglePerimeter * (1 - eyeProgress);
  const pupilOpacity = Math.min(progress / 100, 1);

  return (
    <motion.svg
      width="80"
      height="80"
      viewBox="0 0 100 100"
      className="overflow-visible"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.polygon
        points="50,25 85,75 15,75" // Triangle points
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={trianglePerimeter}
        strokeDashoffset={eyeDashOffset}
        transition={{
          strokeDashoffset: { duration: 0.2, ease: "easeOut" },
        }}
      />
      <motion.circle
        cx="50"
        cy="60" // Position pupil inside the triangle
        r="5"
        fill="currentColor"
        opacity={pupilOpacity}
        transition={{
          opacity: { duration: 0.3, ease: "easeOut" },
        }}
      />
    </motion.svg>
  );
};

// Progress bar segment
const ProgressBarSegment = ({ isActive, isPast, delay, reducedMotion }: { isActive: boolean; isPast: boolean; delay: number; reducedMotion: boolean }) => {
  const variants = {
    initial: { backgroundColor: "var(--segment-inactive)", opacity: 0.2 },
    past: { backgroundColor: "var(--segment-past)", opacity: 0.7 },
    active: {
      backgroundColor: "var(--segment-active)",
      opacity: 1,
      scale: reducedMotion ? 1 : 1.05,
      transition: {
        scale: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
        backgroundColor: { duration: 0.2, ease: "easeOut" }
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
        backgroundColor: { duration: 0.3, ease: [0.23, 1, 0.32, 1], delay: delay * 0.01 },
        opacity: { duration: 0.4, ease: "easeOut", delay: delay * 0.01 },
      }}
    />
  )
}

export default function NewLoadingScreen({ onLoadingComplete }: { onLoadingComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(true)
  const isMobile = useIsMobile()
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    const duration = (prefersReducedMotion || isMobile) ? 1200 : 2000
    const startTime = Date.now()

    const animateProgress = () => {
      const elapsed = Date.now() - startTime
      const normalizedTime = Math.min(elapsed / duration, 1)
      const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      const easedProgress = easeInOutCubic(normalizedTime) * 100
      setProgress(easedProgress)

      if (normalizedTime < 1) {
        requestAnimationFrame(animateProgress)
      } else {
        setTimeout(() => setLoading(false), 300)
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
            scale: 0.98,
            filter: "blur(0px)",
          }}
          transition={{
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="fixed inset-0 z-60 flex flex-col items-center justify-center bg-background"
        >
          <style>{`:root { ${segmentColors} }`}</style>
          <Eye progress={progress} />
          <div className="w-4/5 max-w-xs relative mt-4">
            <div className="flex h-2 gap-1 items-end">
              {Array.from({ length: totalSegments }).map((_, index) => (
                <ProgressBarSegment
                  key={index}
                  isActive={index === activeSegment}
                  isPast={index < activeSegment}
                  delay={index}
                  reducedMotion={prefersReducedMotion || isMobile}
                />
              ))}
            </div>
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 text-xs font-mono font-medium text-primary/90 mt-2"
              key={Math.round(progress)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {Math.round(progress)}%
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}