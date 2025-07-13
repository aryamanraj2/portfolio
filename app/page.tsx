'use client';

import Navbar from "@/components/navbar"
import HeroSection from "@/components/hero-section"
import AboutSection from "@/components/about-section"
import ProjectsSection from "@/components/projects-section"
import SkillsSection from "@/components/skills-section"
import ContactSection from "@/components/contact-section"
import ExperienceSection from "@/components/experience-section"
import Footer from "@/components/footer"
import CustomCursor from "@/components/custom-cursor"
import BackgroundEffect from "@/components/background-effect"
import ScrollToTop from "@/components/scroll-to-top"
import LoadingScreen from "@/components/loading-screen"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function Home() {
  const [isProjectsSectionVisible, setIsProjectsSectionVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Match loading screen duration: 2000ms progress + 300ms hold + 800ms exit
    const timer = setTimeout(() => setIsLoading(false), 3100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingScreen key="loading" />
        ) : (
          <motion.main 
            key="main"
            className="min-h-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ 
              duration: 0.6,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            {/* Dynamic background effect */}
            <BackgroundEffect />
            
            {/* Custom cursor */}
            <CustomCursor />
            
            {/* Navigation */}
            <Navbar />
            
            {/* Main content sections */}
            <HeroSection />
            <AboutSection />
            <ExperienceSection />
            <ProjectsSection
              key={isLoading ? "loading" : "loaded"}
              onVisibilityChange={setIsProjectsSectionVisible}
            />
            <SkillsSection />
            <ContactSection />
            
            {/* Scroll to top button */}
            <ScrollToTop />
          </motion.main>
        )}
      </AnimatePresence>
    </>
  )
}
