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
  
  // Eye expansion state management
  const [isExpansionOpen, setIsExpansionOpen] = useState(false);
  const [eyePosition, setEyePosition] = useState<EyePosition | null>(null);
  const [animationState, setAnimationState] = useState<AnimationState>('idle');
  const [isAnimating, setIsAnimating] = useState(false);

  // Mount check to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
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

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!svgRef.current || !pupilRef.current || isAnimating) return; // Disable during animation

      const svgRect = svgRef.current.getBoundingClientRect();
      const eyeCenterX = svgRect.left + svgRect.width / 2;
      const eyeCenterY = svgRect.top + svgRect.height / 2;
      
      const cursorX = event.clientX;
      const cursorY = event.clientY;

      const deltaX = cursorX - eyeCenterX;
      const deltaY = cursorY - eyeCenterY;
      const angle = Math.atan2(deltaY, deltaX);

      // Define boundaries for pupil movement (relative to eye size)
      const eyeRadiusX = svgRect.width * 0.15; // Horizontal radius within triangle
      const eyeRadiusY = svgRect.height * 0.1; // Vertical radius within triangle
      const maxPupilDistX = eyeRadiusX;
      const maxPupilDistY = eyeRadiusY;

      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      // Adjust sensitivity - move less than cursor
      const sensitivity = 0.1;
      let pupilDistX = Math.cos(angle) * distance * sensitivity;
      let pupilDistY = Math.sin(angle) * distance * sensitivity;

      // Clamp movement within the elliptical boundary
      pupilDistX = Math.max(-maxPupilDistX, Math.min(maxPupilDistX, pupilDistX));
      pupilDistY = Math.max(-maxPupilDistY, Math.min(maxPupilDistY, pupilDistY));

      setPupilTransform(`translate(${pupilDistX}px, ${pupilDistY}px)`);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isAnimating]); // Disable mouse tracking during animation

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
      {/* Outer Triangle (stroke only) */}
      <polygon 
        points="50,10 95,90 5,90" // Adjust points for desired triangle shape
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      {/* Inner Eye Shape (white fill) - simplified ellipse */}
      <ellipse 
        ref={ellipseRef}
        cx="50" 
        cy="60" // Positioned lower in the triangle
        rx="30" // Horizontal radius
        ry={isBlinking ? blinkRy : isButtonHovered ? squintRy : normalRy}
        fill={whiteColor}
        style={{
          transition: 'ry 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      />
      {/* Pupil (black circle) */}
      <circle 
        ref={pupilRef}
        cx="50" 
        cy="60" // Initial center same as eye ellipse
        r="8" // Pupil radius
        fill={blackColor}
        style={{
          transform: pupilTransform,
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
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
