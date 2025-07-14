"use client"

import { motion, AnimatePresence, useInView } from "framer-motion"
import { Calendar, ChevronDown } from "lucide-react"
import { useState, useRef, useEffect } from "react"

// Snappier fade up animation
const scrollFadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

// Improved checkpoint animation variants
const checkpointVariants = {
  hidden: {
    scale: 0,
    opacity: 0,
    rotate: -45
  },
  visible: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: {
      duration: 0.4,
      ease: [0.34, 1.56, 0.64, 1],
      delay: 0.1
    }
  }
};

// Snappier card slide animation
const cardSlideVariants = {
  hidden: {
    opacity: 0,
    x: -20,
    scale: 0.97
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
      type: "spring",
      stiffness: 180,
      damping: 18
    }
  }
};

interface TimelineItemProps {
  item: any; // Consider defining a more specific type for item
  isEducation: boolean;
}

export default function TimelineItem({ item, isEducation }: TimelineItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const expandTimerRef = useRef<NodeJS.Timeout | null>(null);
  const collapseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const itemRef = useRef(null);
  const isInView = useInView(itemRef, { once: true, amount: 0.3 });

  const EXPAND_DELAY = 100; // Faster expand delay
  const COLLAPSE_DELAY = 150; // Faster collapse delay

  const handleMouseEnter = () => {

    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
    if (!isExpanded) {
      expandTimerRef.current = setTimeout(() => {
        setIsExpanded(true);
      }, EXPAND_DELAY);
    }
  };

  const handleMouseLeave = () => {
    if (expandTimerRef.current) {
      clearTimeout(expandTimerRef.current);
      expandTimerRef.current = null;
    }
    collapseTimerRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, COLLAPSE_DELAY);
  };

  useEffect(() => {
    return () => {
      if (expandTimerRef.current) clearTimeout(expandTimerRef.current);
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    };
  }, []);

  // Common classes for dot to avoid repetition if we want to change color based on isExpanded or item type later
  const dotBaseClasses = "absolute w-3.5 h-3.5 rounded-full bg-background border-2 z-10 transition-colors duration-150"
  const dotPositionClasses = "top-5 left-[-calc(1.5rem+0.4375rem)]" // Centered on stem from parent's pl-6

  return (
    <motion.div 
      ref={itemRef}
      className="relative mb-8"
      variants={cardSlideVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {/* Animated checkpoint dot with pulse effect */}
      <motion.div
        className={`${dotBaseClasses} ${dotPositionClasses} ${isExpanded ? "border-primary bg-primary/20" : "border-secondary bg-secondary/10"}`}
        variants={checkpointVariants}
        whileHover={{ 
          scale: 1.2, 
          boxShadow: "0 0 15px rgba(var(--primary), 0.6)",
          borderColor: "hsl(var(--primary))",
          transition: { duration: 0.2 }
        }}
        style={{
          background: isExpanded 
            ? "radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, hsl(var(--primary) / 0.1) 70%, transparent 100%)"
            : "radial-gradient(circle, hsl(var(--secondary) / 0.1) 0%, transparent 70%)"
        }}
      >
        {/* Inner glow dot */}
        <motion.div
          className="absolute inset-1 rounded-full bg-primary/60"
          initial={{ scale: 0, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ delay: 0.3, duration: 0.2 }} // Faster animation
        />
        
        {/* Pulse animation */}
      </motion.div>

      <motion.div
        className="relative ml-[calc(1.5rem+0.875rem)] rounded-lg border bg-background/80 transition-shadow duration-150 cursor-pointer"
        whileHover={{
          borderColor: isExpanded ? "hsl(var(--primary) / 0.8)" : "hsl(var(--primary) / 0.6)",
          boxShadow: isExpanded ? 
            "0px 6px 15px hsla(var(--primary-foreground), 0.08), 0px 3px 6px hsla(var(--primary-foreground), 0.06)" :
            "0px 4px 12px hsla(var(--primary-foreground), 0.06), 0px 2px 4px hsla(var(--primary-foreground), 0.04)",
          y: -2,
          transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ borderColor: isExpanded ? "hsl(var(--primary))" : "hsl(var(--border) / 0.3)" }}
      >
        <div className="p-4 relative"> {/* Inner padding for content & Chevron */}
          {/* Card Main Content */}
          {isEducation ? (
            <>
              <h4 className="text-lg font-semibold mb-0.5">{item.degree}</h4>
              <p className="text-sm text-primary font-medium mb-1">{item.institution}</p>
              {item.duration && (
                <p className="text-xs text-muted-foreground mb-2 flex items-center">
                  <Calendar className="w-3 h-3 mr-1.5 opacity-70" />
                  {item.duration}
                </p>
              )}
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </>
          ) : (
            <>
              <div className="flex items-center mb-1">
                {item.icon}
                <h4 className="text-lg font-semibold">{item.title}</h4>
              </div>
              <p className="text-sm text-primary font-medium mb-1">{item.institution}</p>
              {item.date && (
                <p className="text-xs text-muted-foreground mb-2 flex items-center">
                  <Calendar className="w-3 h-3 mr-1.5 opacity-70" />
                  {item.date}
                </p>
              )}
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </>
          )}

          {/* Details Section (conditionally rendered based on isExpanded) */}
          {item.details && (
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.section
                  layout // Keep layout for smooth height transition
                  key="content"
                  initial="collapsed"
                  animate="open"
                  exit="collapsed"
                  variants={{
                    open: { 
                      opacity: 1, 
                      height: "auto", 
                      marginTop: "16px", 
                      transition: { 
                        duration: 0.25, 
                        ease: [0.22, 1, 0.36, 1] 
                      } 
                    },
                    collapsed: { 
                      opacity: 0, 
                      height: 0, 
                      marginTop: "0px", 
                      transition: { 
                        duration: 0.2, 
                        ease: [0.22, 1, 0.36, 1] 
                      } 
                    }
                  }}
                  className="overflow-hidden" // Important for height animation
                >
                  {/* Details section inner div: more transparent for layered glass effect over card's bg-background/80 */}
                  <div className="pt-4 border-t border-border/20 bg-background/30 backdrop-blur-sm rounded-b-md">
                    <p className="text-sm text-muted-foreground whitespace-pre-line p-4">{item.details}</p>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          )}

          {/* Chevron Icon for expand/collapse indication - snappier animation */}
          {item.details && (
            <motion.div 
              className="absolute top-4 right-4 text-muted-foreground"
              animate={{ 
                rotate: isExpanded ? 180 : 0,
                scale: isExpanded ? 1.1 : 1,
                color: isExpanded ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"
              }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
} 