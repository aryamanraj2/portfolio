"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github, ArrowRight } from "lucide-react"
// import Image from "next/image"; // Uncomment if you plan to use images in the popup
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";


interface Project {
  id: string;
  title: string
  description: string
  image: string
  tags: string[]
  liveUrl: string
  githubUrl: string
  subtitle: string;
}

const scrollFadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

const popupContentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.15
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


interface ProjectsSectionProps {
  onVisibilityChange?: (isVisible: boolean) => void;
}


export default function ProjectsSection({ onVisibilityChange }: ProjectsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { ref: inViewRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const parallaxOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  const combinedRef = (node: HTMLElement | null) => {
    sectionRef.current = node;
    inViewRef(node);
  };

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedProjectId) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDetails();
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
    // Focus first element
    setTimeout(() => {
      if (modalRef.current) {
        const focusable = modalRef.current.querySelector<HTMLElement>('a, button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
        focusable?.focus();
      }
    }, 0);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedProjectId]);

  const projects: Project[] = [
    {
      id: "nsutrack",
      title: "NSUTrack",
      description: "NSUT Trial is a modern Android application built with Jetpack Compose, designed to provide a seamless and intuitive user experience for NSUT (Netaji Subhas University of Technology) students. The app leverages the latest Android development technologies and follows Material Design 3 guidelines to deliver a beautiful and functional interface.",
      image: "/placeholder.svg?height=400&width=600",
      tags: ["Kotlin", "Jetpack Compose", "MVVM", "Retrofit", "GSON", "Navigation Compose", "Material 3", "Beautifulsoup", "Google Fonts", "Material Icons"],
      liveUrl: "https://github.com/aryamanj250/NSUTrack/releases/tag/1.0.0-beta",
      githubUrl: "https://github.com/aryamanj250/NSUTrack",
      subtitle: "All-in-one NSUT Student App",
    },
    {
      id: "wandr",
      title: "Wandr",
      description: "Wandr is not just another travel app that gives you recommendations; it's an AI that executes your trip. Using a multi-agent system, Wandr literally makes phone calls, books reservations, and handles group payments from a single voice command. Just say, \"We're in Goa, ₹5000 each, beach vibes + party, 8 hours,\" and watch as the AI researches, books, and creates a live itinerary in real-time. It's the future of spontaneous travel, turning your 'what now?' moments into fully planned adventures.",
      image: "/placeholder.svg?height=400&width=600",
      tags: ["SwiftUI", "PythonToolkit", "Gemini", "OmniDimension", "Multi-Agent AI"],
      liveUrl: "https://youtu.be/2SnTEBmqZUQ",
      githubUrl: "https://github.com/aryamanj250/Wandr",
      subtitle: "The AI That Actually Books Your Trip",
    },
    {
      id: "himyatra",
      title: "HimYatra",
      description: "A comprehensive tourism solution for Himachal Pradesh featuring a dual-platform system. The web-based HimYatra Companion provides hospitality providers with real-time booking management, occupancy tracking, and visitor analytics. Built with a focus on accessibility and ease of use for both established hotels and smaller homestays.",
      image: "/placeholder.svg?height=400&width=600",
      tags: ["JavaScript", "Flask", "Swift", "Axios", "Node.js", "React"],
      liveUrl: "https://devfolio.co/projects/himyatra-b3cb",
      githubUrl: "https://github.com/aryamanj250/Tourist",
      subtitle: "Himachal Tourism Platform",
    },
    {
      id: "portfolio",
      title: "Portfolio",
      description: "A modern, responsive portfolio website showcasing my projects and skills. Built with a focus on performance, accessibility, and smooth animations. Features a clean, minimalist design with interactive elements and a seamless user experience.",
      image: "/placeholder.svg?height=400&width=600",
      tags: ["TypeScript", "Next.js", "React", "Tailwind CSS", "Framer Motion", "shadcn/ui"],
      liveUrl: "",
      githubUrl: "https://github.com/aryamanj250/portfolio",
      subtitle: "Personal Portfolio Website",
    }
  ];

  useEffect(() => {
    if (onVisibilityChange) {
      onVisibilityChange(inView);
    }
  }, [inView, onVisibilityChange]);

  const handleProjectClick = (projectId: string) => {
    setSelectedProjectId(prevId => (prevId === projectId ? null : projectId));
  };

  const closeDetails = () => {
    setSelectedProjectId(null);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (backdropRef.current && e.target === backdropRef.current) {
      closeDetails();
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedProjectId]);


  return (
    <>
      <motion.section
        id="projects"
        ref={combinedRef}
        className="section-animate py-24 relative overflow-hidden"
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.02] bg-[length:50px_50px]" />
        </div>

        <motion.div
          className="container px-4 mx-auto relative z-10"
          style={{
            y: parallaxY,
            opacity: parallaxOpacity
          }}
        >
          <motion.div
              className="mb-16 text-center"
              variants={scrollFadeUp}
          >
            <h2 className="heading-lg mb-4">
              Featured <span className="gradient-text">Projects</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A selection of my recent work showcasing my skills and expertise in building modern web applications.
            </p>
          </motion.div>

          <motion.ul
              className="space-y-10"
          >
            {projects.map((project) => (
                <motion.li
                    key={project.id}
                    variants={scrollFadeUp}
                    className="relative"
                >
                  <motion.button
                      className="w-full text-left p-8 rounded-2xl bg-card/80 border border-border/30 backdrop-blur-md shadow-xl focus:outline-none group transition-all relative overflow-hidden"
                      onClick={() => handleProjectClick(project.id)}
                      whileHover={{
                        scale: 1.02,
                      }}
                      transition={{ duration: 0.16, ease: 'easeOut' }}
                  >
                    <div className="absolute inset-0 border-[3px] border-white/0 transition-all duration-300 ease-out group-hover:border-white/40 rounded-2xl" />
                    <div className="flex flex-col">
                      <motion.span
                          className="font-display text-4xl md:text-5xl font-bold gradient-text transition-all duration-300 ease-out"
                      >
                        {project.title}
                      </motion.span>
                      <motion.span
                          className="text-base text-muted-foreground mt-1.5 opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        {project.subtitle}
                      </motion.span>
                    </div>
                  </motion.button>
                </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </motion.section>

      {/* Modal rendered in a portal, with animations from about-section */}
      {createPortal(
        <AnimatePresence>
          {selectedProjectId && (() => {
            const project = projects.find(p => p.id === selectedProjectId);
            if (!project) return null;

            return (
              <motion.div
                className="fixed inset-0 z-[71] flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                ref={backdropRef}
                onClick={handleBackdropClick}
              >
                {/* Animated backdrop */}
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
                  className="relative max-w-2xl w-full p-0 md:p-0 rounded-2xl shadow-2xl border border-border bg-white dark:bg-black/95 text-foreground focus:outline-none ring-2 ring-primary/10 z-10"
                  tabIndex={-1}
                  initial={{ scale: 0.7, opacity: 0, y: 40, rotateX: 15, boxShadow: '0 0 0 0 rgba(0,0,0,0)' }}
                  animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)' }}
                  exit={{ scale: 0.9, opacity: 0, y: 20, boxShadow: '0 0 0 0 rgba(0,0,0,0)' }}
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
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors duration-200 p-1 rounded-full hover:bg-muted/20 z-20"
                    onClick={closeDetails}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path></svg>
                  </motion.button>

                  {/* Project Image Preview */}
                  <div className="w-full h-48 md:h-64 rounded-t-2xl overflow-hidden bg-neutral-900 flex items-center justify-center border-b border-border">
                    <img src={project.image} alt={project.title + ' preview'} className="object-cover w-full h-full" />
                  </div>
                  <div className="p-6 md:p-8">
                    <motion.div variants={popupContentVariants} initial="hidden" animate="visible">
                      <motion.h4 variants={popupItemVariants} className="text-3xl font-bold mb-1 gradient-text">{project.title}</motion.h4>
                      <motion.p variants={popupItemVariants} className="text-sm text-muted-foreground mb-5">{project.subtitle}</motion.p>
                      <motion.p variants={popupItemVariants} className="mb-6 leading-relaxed text-foreground">{project.description}</motion.p>
                      {/* Enhanced tags */}
                      <motion.div variants={popupItemVariants} className="flex flex-wrap gap-2 mb-6">
                        {project.tags.map((tag, tagIndex) => (
                          <span key={tagIndex} className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold shadow-sm border border-primary/20 transition-all duration-150">
                            {tag}
                          </span>
                        ))}
                      </motion.div>
                      {/* Enhanced buttons */}
                      <motion.div variants={popupItemVariants} className="flex flex-col sm:flex-row justify-end gap-3 pt-2 border-t border-border/20">
                        <Button
                          size="sm"
                          className="fill-center-button !py-2 !px-4 text-sm flex items-center gap-1.5 w-full sm:w-auto"
                          asChild
                        >
                          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                            Demo
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          className="fill-center-button !py-2 !px-4 text-sm flex items-center gap-1.5 w-full sm:w-auto"
                          asChild
                        >
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4" />
                            Code
                          </a>
                        </Button>
                        <Button size="sm" variant="outline" onClick={closeDetails} className="w-full sm:w-auto !py-2 !px-4">
                          Close
                        </Button>
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
