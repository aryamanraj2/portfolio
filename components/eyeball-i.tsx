"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useButtonHover } from "@/context/HoverContext"; // Import the hook
import { useTheme } from "next-themes"; // Import theme hook

const EyeballI: React.FC = () => {
  const eyeContainerRef = useRef<HTMLSpanElement>(null);
  const [innerEyeTransform, setInnerEyeTransform] = useState('translate(-50%, -50%)'); // For iris/pupil movement
  const [isBlinking, setIsBlinking] = useState(false);
  const { resolvedTheme } = useTheme(); // Get current theme
  const [mounted, setMounted] = useState(false);
  
  // Performance optimizations - cache eye position
  const eyePositionCache = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const animationFrameRef = useRef<number | null>(null);
  const targetPosition = useRef({ x: 0, y: 0 });
  const currentPosition = useRef({ x: 0, y: 0 });
  
  // Mount check to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    
    // Initialize eye position immediately after mount
    if (eyeContainerRef.current) {
      const rect = eyeContainerRef.current.getBoundingClientRect();
      eyePositionCache.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        width: rect.width,
        height: rect.height
      };
    }
  }, []);
  
  // Use the button hover context
  const { isButtonHovered } = useButtonHover();

  // Cache eye position on mount and resize
  useEffect(() => {
    if (!mounted) return;

    const updateEyePosition = () => {
      if (!eyeContainerRef.current) return;
      const rect = eyeContainerRef.current.getBoundingClientRect();
      
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

    if (eyeContainerRef.current) {
      observer.observe(eyeContainerRef.current);
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
        setInnerEyeTransform(
          `translate3d(calc(-50% + ${currentPosition.current.x}px), calc(-50% + ${currentPosition.current.y}px), 0)`
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
  }, []);

  // Mouse move handler - just updates target position
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const { x: eyeCenterX, y: eyeCenterY, width } = eyePositionCache.current;
      
      const deltaX = event.clientX - eyeCenterX;
      const deltaY = event.clientY - eyeCenterY;
      const angle = Math.atan2(deltaY, deltaX);

      // Limit movement distance
      const maxInnerDist = width * 0.2;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const innerDist = Math.min(distance * 0.15, maxInnerDist);

      const innerX = Math.cos(angle) * innerDist;
      const innerY = Math.sin(angle) * innerDist;

      // Update target position for smooth animation
      targetPosition.current = { x: innerX, y: innerY };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleBlink = () => {
    if (isBlinking) return;
    setIsBlinking(true);
    setTimeout(() => {
      setIsBlinking(false);
    }, 150);
  };

  // Styles for the outer square container (the dot space)
  const eyeContainerStyle: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    bottom: '98%', // Lowered slightly to try and cover the original dot
    transform: 'translateX(-50%)',
    width: '0.35em', 
    height: '0.35em',
    backgroundColor: 'transparent',
    cursor: 'pointer',
  };

  // Define normal and squint heights
  const normalHeight = '70%';
  const squintHeight = '15%';
  const blinkHeight = '10%'; // Even more squinted for blink
  
  // Set theme-specific colors
  const isDark = mounted && resolvedTheme === 'dark';
  const whiteColor = isDark ? 'white' : '#f8f8f8'; // Slightly off-white in light mode
  const blackColor = isDark ? 'black' : '#222222'; // Slightly lighter black in light mode
  const boxShadow = isDark ? 'inset 0 0 1px rgba(0,0,0,0.4)' : 'inset 0 0 2px rgba(0,0,0,0.6)'; // Stronger shadow in light mode

  // Styles for the iris (now rectangular white part)
  const irisStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '100%', // Fill container width
    height: isBlinking ? blinkHeight : isButtonHovered ? squintHeight : normalHeight, // Priority: blink > hover > normal
    backgroundColor: whiteColor,
    // borderRadius: '50%', // Removed for rectangular shape
    transform: innerEyeTransform, 
    transition: 'height 0.1s ease-in-out',
    willChange: 'transform',
    boxShadow: boxShadow, // Adjusted shadow for better visibility
  };

  // Styles for the pupil (black center)
  const pupilStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '40%', // Size relative to iris
    height: '40%',
    backgroundColor: blackColor,
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)', // Center within the iris
    // No separate transition needed, moves with iris
  };

  if (!mounted) {
    // Return a placeholder with same dimensions to avoid layout shift
    return <span style={eyeContainerStyle} aria-hidden="true"></span>;
  }

  return (
    <span 
      ref={eyeContainerRef} 
      style={eyeContainerStyle}
      onClick={handleBlink}
      aria-hidden="true"
    >
      {/* Iris (White part) */}
      <span style={irisStyle}>
        {/* Pupil (Black part) */}
        <span style={pupilStyle} />
      </span>
    </span>
  );
};

export default EyeballI;
