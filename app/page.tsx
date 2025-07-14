'use client';

import Navbar from "@/components/navbar"
import HeroSection from "@/components/hero-section"
import AboutSection from "@/components/about-section"
import ProjectsSection from "@/components/projects-section"
import SkillsSection from "@/components/skills-section"
import ContactSection from "@/components/contact-section"
import ExperienceSection from "@/components/experience-section"

import CustomCursor from "@/components/custom-cursor"
import BackgroundEffect from "@/components/background-effect"
import ScrollToTop from "@/components/scroll-to-top"
import NewLoadingScreen from "@/components/new-loading-screen"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function Home() {
  const [isProjectsSectionVisible, setIsProjectsSectionVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <NewLoadingScreen
            key="loading"
            onLoadingComplete={() => setIsLoading(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={isLoading ? 'hidden' : 'block'}
      >
        <BackgroundEffect />
        <CustomCursor />
        <Navbar />
        <main className="relative z-10">
          <HeroSection />
          <AboutSection />
          <ExperienceSection />
          <ProjectsSection
            onVisibilityChange={setIsProjectsSectionVisible}
          />
          <SkillsSection />
          <ContactSection />
        </main>
        <ScrollToTop />
      </motion.div>
    </>
  );
}
