"use client"

import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

// TypeScript interfaces for the eye expansion system
export interface EyePosition {
  x: number
  y: number
  width: number
  height: number
}

export interface AnimationPhase {
  idle: 'idle'
  expanding: 'expanding'
  expanded: 'expanded'
  collapsing: 'collapsing'
}

export type AnimationState = keyof AnimationPhase

export interface EyeExpansionOverlayProps {
  isOpen: boolean
  eyePosition: EyePosition | null
  onClose: () => void
  animationState: AnimationState
  onAnimationStateChange: (state: AnimationState) => void
}

// Custom spring physics configurations for ultra-smooth animations
const SPRING_CONFIG = {
  expansion: {
    type: "spring" as const,
    damping: 22,
    stiffness: 150,
    mass: 0.9,
    restDelta: 0.001,
    restSpeed: 0.001
  },
  morphing: {
    type: "spring" as const,
    damping: 30,
    stiffness: 200,
    mass: 0.5
  },
  backdrop: {
    type: "tween" as const,
    duration: 0.4,
    ease: [0.16, 1, 0.3, 1]
  }
}

const EyeExpansionOverlay: React.FC<EyeExpansionOverlayProps> = ({
  isOpen,
  eyePosition,
  onClose,
  animationState,
  onAnimationStateChange
}) => {
  const [mounted, setMounted] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Mount check for SSR compatibility
  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate transform origin from eye position
  const getTransformOrigin = () => {
    if (!eyePosition) return 'center center'
    
    // Convert eye position to viewport coordinates
    const originX = eyePosition.x + (eyePosition.width / 2)
    const originY = eyePosition.y + (eyePosition.height / 2)
    
    return `${originX}px ${originY}px`
  }

  // Calculate initial position and size for seamless transition
  const getInitialTransform = () => {
    if (!eyePosition) return { x: 0, y: 0, scale: 0 }
    
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    
    const eyeCenterX = eyePosition.x + (eyePosition.width / 2)
    const eyeCenterY = eyePosition.y + (eyePosition.height / 2)
    
    return {
      x: eyeCenterX - centerX,
      y: eyeCenterY - centerY,
      scale: eyePosition.width / (window.innerWidth * 0.8) // Scale from eye size to 80vw
    }
  }

  // Handle ESC key press for accessibility
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey)
      // Prevent body scroll when overlay is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Animation state management
  const handleAnimationComplete = () => {
    if (animationState === 'expanding') {
      onAnimationStateChange('expanded')
    } else if (animationState === 'collapsing') {
      onAnimationStateChange('idle')
    }
  }

  if (!mounted) return null

  const initialTransform = getInitialTransform()

  return createPortal(
    <AnimatePresence mode="wait" onExitComplete={handleAnimationComplete}>
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999]"
          style={{ 
            transformOrigin: getTransformOrigin(),
            willChange: 'transform, opacity',
            cursor: 'auto' // Ensure cursor is visible
          }}
        >
          {/* Backdrop with fade animation */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            style={{ zIndex: 9998 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={SPRING_CONFIG.backdrop}
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
          />

          {/* Main expanding overlay */}
          <motion.div
            ref={overlayRef}
            className="absolute bg-white shadow-2xl overflow-hidden"
            style={{
              left: '50%',
              top: '50%',
              zIndex: 9999,
              willChange: 'transform, border-radius',
              backfaceVisibility: 'hidden'
            }}
            initial={{
              width: `${eyePosition?.width || 0}px`,
              height: `${eyePosition?.height || 0}px`,
              x: initialTransform.x,
              y: initialTransform.y,
              scale: initialTransform.scale,
              borderRadius: '50%',
              translateX: '-50%',
              translateY: '-50%',
              rotate: -15
            }}
            animate={{
              width: '80vw',
              height: '80vh',
              x: 0,
              y: 0,
              scale: 1,
              borderRadius: '12px',
              translateX: '-50%',
              translateY: '-50%',
              rotate: 0
            }}
            exit={{
              width: `${eyePosition?.width || 0}px`,
              height: `${eyePosition?.height || 0}px`,
              x: initialTransform.x,
              y: initialTransform.y,
              scale: initialTransform.scale,
              borderRadius: '50%',
              translateX: '-50%',
              translateY: '-50%',
              rotate: -15
            }}
            transition={SPRING_CONFIG.expansion}
            onAnimationStart={() => {
              if (animationState === 'idle') {
                onAnimationStateChange('expanding')
              } else if (animationState === 'expanded') {
                onAnimationStateChange('collapsing')
              }
            }}
            onAnimationComplete={handleAnimationComplete}
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="absolute inset-0 w-full h-full"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e5e7eb' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat',
                opacity: 0.5,
              }}
            />
            <div className="relative w-full h-full flex flex-col items-center justify-center p-8">
              <motion.button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
              <h2 className="text-4xl font-bold text-gray-800 mb-4">The Eye Has Opened</h2>
              <p className="text-gray-600 text-center max-w-md">
                This is the space that reveals itself when you click the eye. 
                It can be filled with anything you can imagine.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default EyeExpansionOverlay
