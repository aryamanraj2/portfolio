"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import DelhiClock from "@/components/delhi-clock"

// Simple throttle function
function throttle<T extends (...args: unknown[]) => unknown>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  let lastFunc: ReturnType<typeof setTimeout>;
  let lastRan: number;
  return function(this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      lastRan = Date.now();
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(this, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("home")
  const [blurAmount, setBlurAmount] = useState(0)
  const [bgOpacity, setBgOpacity] = useState(0)
  const navRef = useRef<HTMLDivElement>(null)

  // Helper to get navbar height with caching
  const getNavbarHeight = useCallback(() => {
    if (navRef.current) {
      return navRef.current.offsetHeight;
    }
    return 80; // more reasonable fallback
  }, []);

  // Improved section detection with better positioning
  const handleScroll = useCallback(throttle(() => {
    const navbarHeight = getNavbarHeight();
    const sections = document.querySelectorAll<HTMLElement>("section[id]");
    let currentSectionId = "home";
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    
    // Check if we're at the bottom of the page
    const atBottom = Math.abs(windowHeight + scrollY - docHeight) < 5;
    
    // Increased offset for better section detection
    const detectionOffset = navbarHeight + 100; // Increased from 10 to 100

    // Find the current section with improved logic
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const sectionId = section.getAttribute("id") || "";
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top + window.scrollY;
      const sectionBottom = sectionTop + rect.height;
      
      // More precise section detection
      if (
        (scrollY >= sectionTop - detectionOffset && scrollY < sectionBottom - detectionOffset) ||
        (atBottom && i === sections.length - 1)
      ) {
        currentSectionId = sectionId;
        break;
      }
    }

    // Update active section if changed
    if (activeSection !== currentSectionId) {
      setActiveSection(currentSectionId);
    }

    // Update scrolled state with a larger threshold
    const isScrolled = scrollY > 50; // Increased from 20 to 50
    setScrolled(isScrolled);

    // Blur and opacity with smoother transitions
    const maxBlur = 10;
    const scrollThreshold = 200; // Increased from 150 to 200 for smoother transition
    const newBlurAmount = Math.min(maxBlur, (scrollY / scrollThreshold) * maxBlur);
    setBlurAmount(newBlurAmount);
    
    const maxOpacity = 0.8;
    const newBgOpacity = Math.min(maxOpacity, (scrollY / scrollThreshold) * maxOpacity);
    setBgOpacity(newBgOpacity);
  }, 100), [activeSection, getNavbarHeight]); // Increased throttle from 50 to 100ms

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    // Initialize on mount
    setTimeout(handleScroll, 100);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [handleScroll]);

  const navItems = [
    { name: "About", href: "#about" },
    { name: "Journey", href: "#journey" },
    { name: "Projects", href: "#projects" },
    { name: "Skills", href: "#skills" },
  ]

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 w-full z-50 flex items-center justify-between px-6 lg:px-10 py-4 transition-all duration-300 border-b ${
        scrolled ? 'border-border/30' : 'border-transparent'
      }`}
      style={{
        backdropFilter: `blur(${blurAmount}px)`,
        WebkitBackdropFilter: `blur(${blurAmount}px)`,
        backgroundColor: `hsla(var(--background) / ${bgOpacity})`,
      }}
      ref={navRef}
    >
      {/* Left side: Empty space to balance with right side */}
      <div className="flex-1 flex items-center justify-start">
        <div className="w-16"></div>
      </div>

      {/* Center: Desktop Navigation */}
      <motion.nav
        layout 
        transition={{ type: "spring", stiffness: 300, damping: 25, duration: 0.4 }}
        className={`hidden md:flex items-center justify-center rounded-full transition-all duration-300 ease-[0.16,1,0.3,1] ${
          scrolled ? 'p-1' : 'py-1'
        }`}
        style={{
          backgroundColor: `hsla(var(--secondary) / ${bgOpacity * 0.25})`,
        }}
      >
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`nav-link font-medium relative transition-all duration-500 ease-[0.16,1,0.3,1] ${
              scrolled ? 'px-4 py-2' : 'px-8 py-2'
            } ${
              activeSection === item.href.substring(1)
                ? "text-primary font-semibold"
                : `text-foreground/80 hover:text-primary ${!scrolled ? "text-shadow-sm" : ""}`
            } ${
              scrolled ? "hover:bg-secondary/30 rounded-full" : ""
            }`}
          >
            {activeSection === item.href.substring(1) && (
              <motion.span
                layoutId="activeNavIndicator"
                className="absolute inset-x-0 bottom-0 h-0.5 bg-primary rounded-full mx-1"
                style={{ bottom: "-2px" }}
                transition={{ 
                  type: "spring", 
                  stiffness: 500, 
                  damping: 30 
                }}
              />
            )}
            {/* Divider between items */}
            {item.name !== navItems[navItems.length - 1].name && (
              <span 
                className="absolute right-0 top-1/2 -translate-y-1/2 w-px transition-all duration-300"
                style={{
                  height: scrolled ? '50%' : '4px',
                  opacity: Math.max(0.1, bgOpacity / 4),
                  backgroundColor: `hsla(var(--foreground) / ${Math.max(0.1, bgOpacity / 4)})`,
                }}
              ></span>
            )}
            {item.name}
          </Link>
        ))}
      </motion.nav>

      {/* Right side: Clock & Mobile Menu Button */}
      <div className="flex-1 flex items-center justify-end gap-3">
        <div className="hidden md:block">
          <DelhiClock />
        </div>
        
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-secondary/30 border border-border transition-colors hover:bg-secondary/50 active:bg-secondary/70 active:scale-95"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden fixed inset-x-0 top-[72px] pt-8 pb-12 bg-background/95 backdrop-blur-lg shadow-lg flex flex-col items-center justify-between z-40 border-b border-border/30"
            style={{ 
              maxHeight: 'calc(100vh - 72px)',
              overflowY: 'auto',
              touchAction: 'pan-y'
            }}
          >
            <div className="flex flex-col items-center gap-8 w-full">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.1 + index * 0.05,
                    duration: 0.3,
                    ease: [0.2, 0.6, 0.3, 1]
                  }}
                  className="w-full text-center"
                >
                  <Link
                    href={item.href}
                    className={`text-xl font-medium py-4 px-6 relative transition-colors duration-200 inline-block min-h-[44px] flex items-center rounded-lg hover:bg-secondary/20 active:bg-secondary/40 active:scale-95 ${
                      activeSection === item.href.substring(1) 
                        ? 'text-primary' 
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                    {activeSection === item.href.substring(1) && (
                      <motion.span
                        layoutId="mobileActiveIndicator"
                        className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 bg-primary rounded-full" 
                        style={{ width: '30%' }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
