"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRightIcon } from "lucide-react"
import EyeballA from "./eyeball-a"

export default function HeroSection() {

  const heroVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  }

  return (
    <section id="home" className="section-animate relative min-h-[85vh] flex items-center justify-center pt-16 pb-16">
      {/* Added relative and overflow-hidden here */}
      <div className="container px-4 mx-auto relative z-10 overflow-hidden">
        {/* Moved Grid lines INSIDE the container */}
        <div className="absolute inset-0 bg-grid-white/[0.01] bg-[length:50px_50px] pointer-events-none" />
        
        <motion.div 
          className="max-w-4xl mx-auto text-center relative z-20"
          initial="hidden"
          animate="visible"
          variants={heroVariants}
        >
          <div className="p-8 rounded-2xl bg-card/80 border border-border/30 backdrop-blur-md shadow-xl transition-all duration-200 ease-out">
            <motion.h1 
              className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight"
              variants={itemVariants}
            >
              <span className="inline-block gradient-text">
                Aryam<EyeballA />n Jaiswal.
              </span>
            </motion.h1>

            <motion.p 
              className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto text-foreground/80"
              variants={itemVariants}
            >
              Based out of Delhi, I'm passionate about crafting experiences that are engaging, accessible, and user-centric.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
              variants={itemVariants}
            >
              <Button
                asChild
                className="fill-center-button text-lg"
              >
                <a href="#projects">
                  View My Work
                  <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
              <Button
                asChild
                className="fill-center-button text-lg"
              >
                <a href="/Aryaman_Jaiswal_Resume.pdf" download="Aryaman_Jaiswal_Resume.pdf" target="_blank" rel="noopener noreferrer">
                  Resume
                </a>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
