"use client"

import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion"
import React, { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"

// Playlist data with songs from the user's actual playlist
const playlistSongs = [
  { title: "As It Was", artist: "Harry Styles", album: "Harry's House" },
  { title: "Blinding Lights", artist: "The Weeknd", album: "After Hours" },
  { title: "SICKO MODE", artist: "Travis Scott", album: "ASTROWORLD" },
  { title: "Yes Indeed", artist: "Lil Baby & Drake", album: "Harder Than Ever" },
  { title: "Future Nostalgia", artist: "Dua Lipa", album: "Future Nostalgia" }
];

// Refined animation variant (subtler)
const scrollFadeUp = {
  hidden: { opacity: 0, y: 20 }, // Reduced y offset
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6, // Slightly faster duration
      ease: [0.16, 1, 0.3, 1] // Standard ease
    }
  }
}

// Define SubJourney Item type (NEW)
interface SubJourneyItem {
  id: string;
  title: string;
  detail?: string; // e.g., "Summer 2016", "AI Track Winner"
}

// Define Journey Item type (MODIFIED)
interface JourneyItem {
  id: string;
  year: string; 
  title: string; 
  description: string; 
  icon?: React.ReactNode; 
  subItems?: SubJourneyItem[]; // Optional array for concurrent achievements
}

// Updated journeyData with College sub-items
const journeyData: JourneyItem[] = [
  {
    id: "journey-0",
    year: "2024-Present", // User provided start year
    title: "Netaji Subhas University of Technology (NSUT)", 
    description: "B.Tech. Electronics and Communication Engineering", // Assuming B.Tech ECE
    subItems: [
      {
        id: "sub-0-1",
        title: "Won Hack on Hills", 
        detail: "NIT Hamirpur - 2025" 
      },
      {
        id: "sub-0-2",
        title: "Incoming SDE Intern", 
        detail: "May 2025 - July 2025" 
      }
    ]
  },
];

// Define Interest Card type
interface InterestCard {
  id: string;
  title: string;
  icon: React.ReactNode;
  link?: string;
  stats?: string;
  description?: string;
}

// Interest cards data
const interestCards: InterestCard[] = [
  {
    id: "music",
    title: "Music",
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>,
    link: "https://music.apple.com/profile/yourusername",
    description: "Find out what I am listening to!"
  },
  {
    id: "movies",
    title: "Movies",
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>,
    link: "https://letterboxd.com/yourusername",
  },
  {
    id: "fitness",
    title: "Fitness",
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
    stats: "Bench: 100kg • Squat: 130kg • Deadlift: 170kg",
  },
  {
    id: "books",
    title: "Reading",
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  }
];

export default function AboutSection() {
  // Random song from playlist
  const [currentSong, setCurrentSong] = useState(playlistSongs[0]);
  const [songIndex, setSongIndex] = useState(0);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
  
  // Client-side only state
  const [isClient, setIsClient] = useState(false);
  
  // State for popup
  const [popupContent, setPopupContent] = useState<InterestCard | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  
  // Set up client-side only effects
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Change song with animation
  useEffect(() => {
    const interval = setInterval(() => {
      setSongIndex((prev) => (prev + 1) % playlistSongs.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    setCurrentSong(playlistSongs[songIndex]);
  }, [songIndex]);

  // Parallax effect for scroll
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const parallaxOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  // Scroll lock and focus trap for modal
  useEffect(() => {
    if (!popupContent) return;
    // Scroll lock
    document.body.style.overflow = 'hidden';
    // Focus trap and Escape
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPopupContent(null);
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'a, button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    setTimeout(() => {
      if (modalRef.current) {
        const focusable = modalRef.current.querySelector<HTMLElement>('a, button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
        focusable?.focus();
      }
    }, 0);
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [popupContent]);

  // Enhanced modal animation variants
  const popupContentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };
  const popupItemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20, 
      scale: 0.95,
      filter: "blur(6px)" 
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { 
        duration: 0.4, 
        ease: [0.25, 0.46, 0.45, 0.94],
        type: 'spring',
        stiffness: 300,
        damping: 25
      }
    }
  };

  return (
    <section 
      id="about" 
      ref={sectionRef}
      className="section-animate py-24 relative overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.02] bg-[length:50px_50px]" />
        {/* <div className="absolute top-[15%] left-[5%] w-72 h-72 bg-secondary/5 rounded-full blur-[100px]" /> */}
        {/* <div className="absolute bottom-[20%] right-[10%] w-64 h-64 bg-primary/5 rounded-full blur-[100px]" /> */}
      </div>

      <motion.div 
        className="container px-4 mx-auto relative z-10"
        style={{ 
          y: parallaxY,
          opacity: parallaxOpacity
        }}
      >
        <div className="max-w-5xl mx-auto space-y-20">
          {/* Section heading */}
          <motion.div 
            className="text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={scrollFadeUp}
          >
            <motion.h2 
              className="heading-lg mb-6"
              variants={scrollFadeUp}
            >
              About{" "}
              <motion.span 
                className="gradient-text"
                initial={{ backgroundSize: "100%" }}
                animate={{ 
                  backgroundSize: ["100%", "200%", "100%"],
                  backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              >
                Me
              </motion.span>
            </motion.h2>
            <motion.div 
              className="h-[1px] w-32 bg-gradient-to-r from-transparent via-primary/30 to-transparent mx-auto mb-8"
              variants={scrollFadeUp}
            />
          </motion.div>

          {/* Bio Section (moved above cards) */}
          <motion.div 
            className="space-y-6 max-w-3xl mx-auto text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={scrollFadeUp}
          >
            <p className="text-lg md:text-xl font-light leading-relaxed text-foreground/90">
              I craft digital experiences that blend creativity with functionality. My approach combines clean code with intuitive design, turning complex problems into elegant solutions.
            </p>
            <p className="text-lg md:text-xl font-light leading-relaxed text-foreground/80">
              When I&apos;m not building the web, you&apos;ll find me exploring new coffee shops, getting lost in cinematic universes, or pushing my limits at the gym.
            </p>
          </motion.div>

          {/* Interest Cards Section (as rectangular grid) */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={scrollFadeUp}
          >
            {interestCards.map((card, index) => {
              const isClickable = ['movies', 'fitness', 'books'].includes(card.id);

              const cardContent = (
                <>
                  <div className="p-3 rounded-lg bg-primary/10 text-primary mb-4 flex-shrink-0">
                    {card.icon}
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium text-lg mb-1">{card.title}</h4>
                    {card.id === 'music' && card.description && (
                       <p className="text-sm text-muted-foreground mt-1">{card.description}</p>
                    )}
                    {card.id === 'fitness' && card.stats && !isClickable && ( // Only show stats on card if not clickable (i.e., not using popup yet)
                       <p className="text-sm text-muted-foreground">{card.stats}</p>
                    )}
                    {card.id !== 'music' && !isClickable && card.description && ( // Only show description on card if not clickable
                       <p className="text-sm text-muted-foreground mt-1">{card.description}</p>
                    )}
                  </div>
                  {isClickable && (
                    <span className="ml-2 text-muted-foreground opacity-70 group-hover:opacity-100 transition-opacity duration-200">
                      {/* Placeholder for a subtle info/arrow icon */}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </span>
                  )}
                </>
              );

              if (isClickable) {
                return (
                  <motion.div
                    key={card.id}
                    className="interactive-card flex flex-col items-center text-center p-8 rounded-2xl bg-card/80 border border-border/30 backdrop-blur-md shadow-xl h-full cursor-pointer group relative"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setPopupContent(card)}
                  >
                    <div className="absolute inset-0 border-[3px] border-white/0 transition-all duration-300 ease-out group-hover:border-white/40 rounded-2xl" />
                    {cardContent}
                  </motion.div>
                );
              } else {
                return (
                  <motion.a
                    key={card.id}
                    href={card.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center text-center p-8 rounded-2xl bg-card/80 border border-border/30 backdrop-blur-md shadow-xl h-full group relative"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="absolute inset-0 border-[3px] border-white/0 transition-all duration-300 ease-out group-hover:border-white/40 rounded-2xl" />
                    {cardContent}
                  </motion.a>
                );
              }
            })}
          </motion.div>

        </div>
      </motion.div>

      {/* Modal rendered in a portal, outside the blurred overlay */}
      {isClient && createPortal(
        <AnimatePresence>
          {popupContent && (
            <motion.div
              className="fixed inset-0 z-[71] flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
              ref={backdropRef}
              onClick={e => { if (backdropRef.current && e.target === backdropRef.current) setPopupContent(null); }}
            >
              {/* Overlay for modal (for fade-out on close) */}
              <motion.div 
                className="absolute inset-0 bg-black/40 backdrop-blur-md z-0" 
                initial={{ backdropFilter: 'blur(0px)', backgroundColor: 'rgba(0,0,0,0)' }}
                animate={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.4)' }}
                exit={{ backdropFilter: 'blur(0px)', backgroundColor: 'rgba(0,0,0,0)' }}
                transition={{ duration: 0.2 }}
              />
              {/* Modal itself */}
              <motion.div
                ref={modalRef}
                className="relative max-w-lg w-full p-0 md:p-0 rounded-2xl shadow-2xl border border-border bg-white dark:bg-black/95 text-foreground focus:outline-none ring-2 ring-primary/10 z-10"
                tabIndex={-1}
                initial={{ 
                  scale: 0.7, 
                  opacity: 0, 
                  y: 40,
                  rotateX: 15,
                  boxShadow: '0 0 0 0 rgba(0,0,0,0)' 
                }}
                animate={{ 
                  scale: 1, 
                  opacity: 1, 
                  y: 0,
                  rotateX: 0,
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)' 
                }}
                exit={{
                  scale: 0.9,
                  opacity: 0,
                  y: 20,
                  boxShadow: '0 0 0 0 rgba(0,0,0,0)'
                }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                  mass: 0.5,
                  opacity: { duration: 0.25, ease: "easeOut" },
                  y: { type: 'spring', stiffness: 300, damping: 30 },
                  scale: { duration: 0.25, ease: "easeOut" }
                }}
                onClick={e => e.stopPropagation()}
              >
                {/* Close button */}
                <motion.button 
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors duration-200 p-1 rounded-full hover:bg-muted/20"
                  onClick={() => setPopupContent(null)}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path></svg>
                </motion.button>
                <div className="p-8">
                  <motion.div variants={popupContentVariants} initial="hidden" animate="visible">
                    <motion.h4 variants={popupItemVariants} className="text-3xl font-bold mb-1 gradient-text">{popupContent.title}</motion.h4>
                    {popupContent.id === 'movies' && (
                      <motion.div variants={popupItemVariants} className="prose prose-invert">
                        <p className="font-bold mb-2">Best Movies I&apos;ve Watched Recently:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Rocky</li>
                          <li>Parasite</li>
                          <li>The Irishman</li>
                          <li>Se7en</li>
                          <li>Rush</li>
                          <li>Prestige</li>
                        </ul>
                      </motion.div>
                    )}
                    {popupContent.id === 'fitness' && (
                      <motion.div variants={popupItemVariants} className="prose prose-invert">
                        <p className="font-bold mb-2">Key Stats:</p>
                        <ul className="list-disc pl-5 space-y-1 mb-4">
                          <li><span className="font-semibold">Bench:</span> 100kg</li>
                          <li><span className="font-semibold">Squat:</span> 130kg</li>
                          <li><span className="font-semibold">Deadlift:</span> 170kg</li>
                        </ul>
                        <p className="font-bold mb-2">Workout Split:</p>
                        <ul className="list-disc pl-5 space-y-1 mb-4">
                          <li>Chest + Front Deltoids</li>
                          <li>Back + Rear Deltoids</li>
                          <li>Arms</li>
                          <li>Legs</li>
                          <li>Chest and Triceps</li>
                          <li>Back and Biceps</li>
                        </ul>
                        <p className="text-base font-light">I follow a push/pull/legs-inspired split with extra focus on deltoids and arms, ensuring each muscle group gets optimal recovery and growth.</p>
                      </motion.div>
                    )}
                    {popupContent.id === 'books' && (
                      <motion.div variants={popupItemVariants} className="prose prose-invert">
                        <p className="font-bold mb-2">Currently Reading:</p>
                        <ul className="list-disc pl-5 space-y-1 mb-4">
                          <li>Letters to Milena by Franz Kafka</li>
                        </ul>
                        <p className="font-bold mb-2">Favorite Reads:</p>
                        <ul className="list-disc pl-5 space-y-1 mb-4">
                          <li>Sapiens by Yuval Noah Harari</li>
                          <li>White Nights by Fyodor Dostoevsky</li>
                          <li>Catch 22 by Joseph Heller</li>
                        </ul>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  );
}

// The RoadmapItemCard component is no longer used and has been removed.
