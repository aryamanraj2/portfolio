"use client"

import React, { useRef } from "react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { Smartphone, Globe, Layers } from "lucide-react"

interface ExpertiseArea {
  icon: React.ReactElement;
  title: string;
  skills: string[];
  description: string;
  highlightClass?: string;
}

// Animation variants - improved for snappier animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08, // Faster stagger for more snappy feel
      delayChildren: 0.05   // Less delay before starting animations
    }
  }
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.97
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5, // Faster duration
      ease: [0.22, 1, 0.36, 1], // Custom cubic bezier for snappier feel
      type: "spring",
      stiffness: 200, // Higher stiffness for snappier movement
      damping: 20    // Balanced damping for less wobble
    }
  }
};

const skillVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.03, // Much shorter delay between skills
      duration: 0.25,  // Shorter duration
      ease: [0.22, 1, 0.36, 1]
    }
  })
};

export default function SkillsSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const parallaxOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  const expertiseData: ExpertiseArea[] = [
    {
      icon: <Smartphone className="w-5 h-5" />,
      title: "App Dev",
      skills: ["Java", "Dart", "Kotlin", "Jetpack Compose", "Android Studio", "SwiftUI", "Xcode"],
      description: "Skilled in native mobile development for Android & iOS, creating performant, platform-specific user experiences. Proficient in cross-platform solutions with Dart/Flutter.",
      highlightClass: "text-primary",
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: "Web Dev",
      skills: ["(mainly Frontend)", "React", "Next.js", "TypeScript", "JS", "HTML5", "CSS3", "Tailwind"],
      description: "Focused on building modern, responsive web interfaces using cutting-edge frontend technologies. Experience creating engaging and accessible user experiences.",
    },
    {
      icon: <Layers className="w-5 h-5" />,
      title: "Core Skills & Tools",
      skills: ["Python", "DSA", "Linux", "Flask", "Bash", "C++", "Git", "GitHub", "Obsidian"],
      description: "Strong foundation in algorithms, data structures, system administration, and backend principles. Proficient with essential developer tools and version control.",
      highlightClass: "text-accent-foreground",
    },
  ]

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="section-animate py-24 relative overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.02] bg-[length:50px_50px]" />
      </div>

      <motion.div 
        className="container px-4 mx-auto relative z-10"
        style={{
          y: parallaxY,
          opacity: parallaxOpacity
        }}
      >
        {/* Heading - Snappier animation */}
        <motion.div 
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} // Snappier easing
        >
          <motion.h2 
            className="heading-lg mb-4"
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            My <span className="gradient-text">Expertise</span>
          </motion.h2>
          <motion.p 
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            Technologies and areas I specialize in to bring ideas to life.
          </motion.p>
        </motion.div>

        {/* Expertise Grid - Smoother, snappier animations */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {expertiseData.map((area, index) => (
            <motion.div
              key={index}
              className="glass-card p-8 h-full flex flex-col border border-border/30 rounded-2xl overflow-hidden shadow-md relative group"
              variants={cardVariants}
              custom={index}
              whileHover={{
                y: -5, // Less movement for snappier feel
                scale: 1.01, // Subtle scale
                borderColor: "rgba(255, 255, 255, 0.3)",
                boxShadow: "0 15px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } // Faster transition
              }}
            >
              <motion.div 
                className="absolute inset-0 border-[3px] border-white/0 rounded-2xl"
                whileHover={{
                  borderColor: "rgba(255, 255, 255, 0.4)",
                  boxShadow: "0 0 20px rgba(255, 255, 255, 0.15)"
                }}
                transition={{ duration: 0.2 }} // Faster transition
              />
              
              <motion.div 
                className="flex items-center mb-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }} // Less delay between items
              >
                <motion.div 
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 bg-white/5 backdrop-blur-md border border-border/30 shadow-sm ${area.highlightClass ? area.highlightClass.replace('text-', 'bg-').replace('/90', '/10').replace('/100', '/10') : 'bg-primary/10'}`}
                  whileHover={{ scale: 1.05, rotate: 3 }} // Less rotation for snappier feel
                  transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  {area.icon}
                </motion.div>
                <h3 className={`text-2xl font-bold tracking-tight ${area.highlightClass || 'gradient-text'}`}>{area.title}</h3>
              </motion.div>

              <motion.div 
                className="mb-6 flex flex-wrap gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
              >
                {area.skills.map((skill, skillIndex) => (
                  <motion.span
                    key={skillIndex}
                    className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold shadow-sm border border-primary/20"
                    variants={skillVariants}
                    custom={skillIndex}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    whileHover={{ 
                      scale: 1.03, // Less scale for snappier feel 
                      backgroundColor: "rgba(var(--primary), 0.2)",
                      transition: { duration: 0.1 } // Even faster hover transition
                    }}
                  >
                    {skill}
                  </motion.span>
                ))}
              </motion.div>

              <motion.p 
                className="text-base text-muted-foreground flex-grow leading-relaxed max-w-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
              >
                {area.description}
              </motion.p>
            </motion.div>
          ))}
        </motion.div>

      </motion.div>
    </section>
  )
}
