"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { useButtonHover } from "@/context/HoverContext"

// Simple throttle function (can be moved to a utils file if used elsewhere)
function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  let lastFunc: ReturnType<typeof setTimeout>;
  let lastRan: number;
  return function(this: ThisParameterType<T>, ...args: Parameters<T>) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      lastRan = Date.now();
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const [isBlinking, setIsBlinking] = useState(false)
  const [mounted, setMounted] = useState(false)

  const buttonRef = useRef<HTMLButtonElement>(null)
  const pupilRef = useRef<SVGCircleElement>(null)
  const ellipseRef = useRef<SVGEllipseElement>(null)
  const [pupilTransform, setPupilTransform] = useState('')

  const { isButtonHovered } = useButtonHover()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!buttonRef.current || !pupilRef.current || !isVisible) return

      const buttonRect = buttonRef.current.getBoundingClientRect()
      const eyeCenterX = buttonRect.left + buttonRect.width / 2
      const eyeCenterY = buttonRect.top + buttonRect.height / 2
      
      const cursorX = event.clientX
      const cursorY = event.clientY

      const deltaX = cursorX - eyeCenterX
      const deltaY = cursorY - eyeCenterY
      const angle = Math.atan2(deltaY, deltaX)

      const maxPupilDist = buttonRect.width * 0.15 

      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const sensitivity = 0.1
      let pupilDist = distance * sensitivity

      pupilDist = Math.min(pupilDist, maxPupilDist)

      const pupilX = Math.cos(angle) * pupilDist
      const pupilY = Math.sin(angle) * pupilDist

      setPupilTransform(`translate(${pupilX}px, ${pupilY}px)`)
    }

    if (isVisible) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true })
    } else {
      setPupilTransform('') 
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [isVisible])

  const toggleVisibility = useCallback(throttle(() => {
    const sections = document.querySelectorAll("section[id]") as NodeListOf<HTMLElement>;
    let currentSectionId = "home"; // Default to home
    const currentScrollY = window.scrollY;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 150; // Adjusted offset for earlier trigger
      const sectionHeight = section.offsetHeight;
      if (
        currentScrollY >= sectionTop &&
        currentScrollY < sectionTop + sectionHeight
      ) {
        currentSectionId = section.getAttribute("id") || "home";
      }
    });
    
    // Show button if not in "home" section and scrolled a bit
    // OR if scrolled very far down regardless of section (e.g., past 1.5x viewport height)
    const showButton = (currentSectionId !== "home" && currentScrollY > 50) || currentScrollY > window.innerHeight * 1.5;
    setIsVisible(showButton);

  }, 100), []);

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility, { passive: true })
    toggleVisibility() // Initial check
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [toggleVisibility])

  const scrollToTop = () => {
    if (isBlinking) return
    setIsBlinking(true)
    setTimeout(() => {
      setIsBlinking(false)
    }, 150)

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const buttonVariants = {
    hidden: {
      opacity: 0,
      scale: 0.5, // Start smaller for a better pop
      y: 50,      // Start a bit lower
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        duration: 0.3
      }
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 20,
        duration: 0.3
      }
    }
  }

  const normalRy = 15
  const squintRy = 5
  const blinkRy = 2

  // Dark mode only styling (simplified)
  const strokeWidth = 6;
  const eyeColor = 'hsl(var(--foreground))';
  const pupilColor = 'hsl(var(--primary-foreground))';
  const buttonContainerClass = "fixed bottom-8 right-8 w-12 h-12 z-[999] rounded-full"; // z-index slightly lower than navbar

  if (!mounted) {
    return null; // Or a placeholder if layout shift is an issue, but null is fine for a fixed button
  }

  return (
    <motion.div
      className={buttonContainerClass}
      variants={buttonVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
    >
      <button
        ref={buttonRef}
        onClick={scrollToTop}
        className="w-full h-full cursor-pointer transition-all duration-300 flex items-center justify-center bg-background/50 backdrop-blur-sm border border-border/50 rounded-full shadow-xl hover:bg-secondary/70 active:bg-secondary/80 active:scale-95"
        aria-label="Scroll to top"
        style={{
          padding: 0,
          overflow: 'visible',
        }}
      >
        <svg 
          viewBox="0 0 100 100"
          className="w-10 h-10 text-[hsl(var(--foreground))] transition-colors duration-300"
          aria-hidden="true"
        >
          <polygon 
            points="50,10 95,90 5,90"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
          <ellipse 
            ref={ellipseRef}
            cx="50" 
            cy="60"
            rx="25"
            ry={isBlinking ? blinkRy : isButtonHovered ? squintRy : normalRy}
            fill={eyeColor}
            style={{
              transition: 'ry 0.15s cubic-bezier(0.16, 1, 0.3, 1)' // Faster blink
            }}
          />
          <circle 
            ref={pupilRef}
            cx="50"
            cy="60"
            r="8"
            fill={pupilColor}
            style={{
              transform: pupilTransform,
              transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />
        </svg>
      </button>
    </motion.div>
  )
}
