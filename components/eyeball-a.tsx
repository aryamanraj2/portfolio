"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useButtonHover } from "@/context/HoverContext"; // Import the hook
import EyeExpansionOverlay, { type EyePosition, type AnimationState } from "./eye-expansion-overlay";

// Renamed component
const EyeballA: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const pupilRef = useRef<SVGCircleElement>(null);
  const ellipseRef = useRef<SVGEllipseElement>(null);
  const [pupilTransform, setPupilTransform] = useState('');
  const [isBlinking, setIsBlinking] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Performance optimizations - cache eye position
  const eyePositionCache = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const animationFrameRef = useRef<number | null>(null);
  const targetPosition = useRef({ x: 0, y: 0 });
  const currentPosition = useRef({ x: 0, y: 0 });
  
  // Eye expansion state management
  const [isExpansionOpen, setIsExpansionOpen] = useState(false);
  const [eyePosition, setEyePosition] = useState<EyePosition | null>(null);
  const [animationState, setAnimationState] = useState<AnimationState>('idle');
  const [isAnimating, setIsAnimating] = useState(false);

  // Mount check to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    
    // Initialize eye position immediately after mount
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      eyePositionCache.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        width: rect.width,
        height: rect.height
      };
    }
  }, []);

  // Consume the hover state from context
  const { isButtonHovered } = useButtonHover();

  // Log the received state
  console.log('EyeballA - isButtonHovered:', isButtonHovered);

  const handleBlink = useCallback(() => {
    if (isBlinking) return;
    setIsBlinking(true);
    setTimeout(() => {
      setIsBlinking(false);
    }, 150);
  }, [isBlinking]);

  useEffect(() => {
    const handleGlobalClick = () => {
      if (isAnimating || isExpansionOpen) {
        return;
      }
      handleBlink();
    };

    document.addEventListener('click', handleGlobalClick);

    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [isAnimating, isExpansionOpen, handleBlink]);

  // Cache eye position on mount and resize
  useEffect(() => {
    if (!mounted) return;

    const updateEyePosition = () => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      
      // Only update if we have valid dimensions
      if (rect.width > 0 && rect.height > 0) {
        eyePositionCache.current = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          width: rect.width,
          height: rect.height
        };
      }
    };

    // Multiple update attempts to handle animations
    const timeoutId1 = setTimeout(updateEyePosition, 100);
    const timeoutId2 = setTimeout(updateEyePosition, 300);
    const timeoutId3 = setTimeout(updateEyePosition, 600);
    
    // Use IntersectionObserver to update when element becomes visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            updateEyePosition();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (svgRef.current) {
      observer.observe(svgRef.current);
    }
    
    window.addEventListener('resize', updateEyePosition);
    window.addEventListener('scroll', updateEyePosition, { passive: true });

    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);
      observer.disconnect();
      window.removeEventListener('resize', updateEyePosition);
      window.removeEventListener('scroll', updateEyePosition);
    };
  }, [mounted]);

  // Smooth animation loop using RAF
  useEffect(() => {
    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const animate = () => {
      if (isAnimating) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      // Smooth interpolation for natural movement
      const smoothingFactor = 0.15;
      currentPosition.current.x = lerp(
        currentPosition.current.x,
        targetPosition.current.x,
        smoothingFactor
      );
      currentPosition.current.y = lerp(
        currentPosition.current.y,
        targetPosition.current.y,
        smoothingFactor
      );

      // Only update if there's meaningful movement
      const distance = Math.sqrt(
        Math.pow(currentPosition.current.x - targetPosition.current.x, 2) +
        Math.pow(currentPosition.current.y - targetPosition.current.y, 2)
      );

      if (distance > 0.01) {
        setPupilTransform(
          `translate3d(${currentPosition.current.x}px, ${currentPosition.current.y}px, 0)`
        );
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isAnimating]);

  // Mouse move handler - just updates target position
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (isAnimating) return;

      const { x: eyeCenterX, y: eyeCenterY, width, height } = eyePositionCache.current;
      
      const deltaX = event.clientX - eyeCenterX;
      const deltaY = event.clientY - eyeCenterY;
      const angle = Math.atan2(deltaY, deltaX);

      // Define boundaries for pupil movement
      const eyeRadiusX = width * 0.15;
      const eyeRadiusY = height * 0.1;
      const maxPupilDistX = eyeRadiusX;
      const maxPupilDistY = eyeRadiusY;

      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const sensitivity = 0.1;
      let pupilDistX = Math.cos(angle) * distance * sensitivity;
      let pupilDistY = Math.sin(angle) * distance * sensitivity;

      // Clamp movement within the elliptical boundary
      pupilDistX = Math.max(-maxPupilDistX, Math.min(maxPupilDistX, pupilDistX));
      pupilDistY = Math.max(-maxPupilDistY, Math.min(maxPupilDistY, pupilDistY));

      // Update target position for smooth animation
      targetPosition.current = { x: pupilDistX, y: pupilDistY };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isAnimating]);

  // Precise position tracking system
  const captureEyePosition = (): EyePosition => {
    if (!svgRef.current) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    const rect = svgRef.current.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    return {
      x: rect.left + scrollX,
      y: rect.top + scrollY,
      width: rect.width,
      height: rect.height
    };
  };

  // Enhanced click handler for eye expansion
  const handleEyeClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Prevent rapid clicking during animation
    if (isAnimating || animationState !== 'idle') return;

    // Capture exact eye position
    const position = captureEyePosition();
    setEyePosition(position);

    // Trigger immediate visual feedback
    setIsAnimating(true);
    
    // Quick blink animation as feedback
    handleBlink();

    // Start expansion after brief feedback delay
    setTimeout(() => {
      setIsExpansionOpen(true);
      setAnimationState('expanding');
    }, 150);
  };

  // Handle expansion overlay close
  const handleExpansionClose = () => {
    setAnimationState('collapsing');
    setIsExpansionOpen(false);
  };

  // Handle animation state changes
  const handleAnimationStateChange = (newState: AnimationState) => {
    setAnimationState(newState);
    
    if (newState === 'idle') {
      setIsAnimating(false);
      setEyePosition(null);
    }
  };

  // Define SVG size and alignment to match text
  const svgStyle: React.CSSProperties = {
    display: 'inline-block',
    width: '1.1em', // Adjust width to roughly match 'a'
    height: '1em', // Match line height
    verticalAlign: '-0.15em', // Adjust vertical alignment
    overflow: 'visible', // Allow pupil slight movement outside strict triangle
    cursor: 'pointer', // Show pointer cursor
  };

  // Define ry values for normal and squinted states
  const normalRy = 15;
  const squintRy = 5; // Adjust squint level as needed
  const blinkRy = 2; // Even more squinted for blinking
  
  // Set dark theme colors
  const strokeColor = 'currentColor'; // Use text color from parent
  const whiteColor = 'white';
  const blackColor = 'black';
  const strokeWidth = 8; // Use dark mode stroke width

  if (!mounted) {
    // Return a placeholder with same dimensions to avoid layout shift
    return <svg style={svgStyle} aria-hidden="true"></svg>;
  }

  return (
    <>
      <motion.svg
        ref={svgRef}
        viewBox="0 0 100 100" // ViewBox defines internal coordinate system
        style={svgStyle}
        aria-hidden="true"
        onClick={handleEyeClick}
        transition={{
          duration: 0.15,
          ease: [0.16, 1, 0.3, 1]
        }}
        whileHover={{
          scale: animationState === 'idle' ? 1.02 : 1
        }}
      >
      {/* Outer Triangle (stroke only) - bottom layer */}
      <polygon 
        points="50,10 95,90 5,90"
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        style={{
          pointerEvents: 'none'
        }}
      />
      {/* Inner Eye Shape (white fill) - middle layer */}
      <ellipse 
        ref={ellipseRef}
        cx="50" 
        cy="60"
        rx="30"
        ry={isBlinking ? blinkRy : isButtonHovered ? squintRy : normalRy}
        fill={whiteColor}
        style={{
          transition: 'ry 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
          cursor: 'pointer'
        }}
      />
      {/* Pupil (black circle) - top layer, visible and interactive */}
      <circle 
        ref={pupilRef}
        cx="50" 
        cy="60"
        r="8"
        fill={blackColor}
        style={{
          transform: pupilTransform,
          willChange: 'transform',
          cursor: 'pointer'
        }}
      />
      </motion.svg>
      
      {/* Eye Expansion Overlay */}
      <EyeExpansionOverlay
        isOpen={isExpansionOpen}
        eyePosition={eyePosition}
        onClose={handleExpansionClose}
        animationState={animationState}
        onAnimationStateChange={handleAnimationStateChange}
      />
    </>
  );
};

export default EyeballA; // Export the renamed component
