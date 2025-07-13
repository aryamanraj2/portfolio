"use client"

import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion"
import { Briefcase, School, Calendar, Award, ChevronDown } from "lucide-react"
import { useState, useRef } from "react"
import TimelineItem from "./TimelineItem"

// Enhanced animation variants for snappier animations
const scrollFadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] // Custom cubic bezier for snappier feel
    }
  }
};

// Timeline container animation - snappier with less delay
const timelineContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Faster stagger for more snappy feel
      delayChildren: 0.05   // Less delay before starting animations
    }
  }
};

// Timeline line animation - faster with better easing
const timelineLineVariants = {
  hidden: { scaleY: 0, originY: 0 },
  visible: {
    scaleY: 1,
    transition: {
      duration: 0.8, // Faster animation
      ease: [0.22, 1, 0.36, 1] // Custom cubic bezier for snappier feel
    }
  }
};

// Timeline item checkpoint animation - more dynamic
const timelineItemVariants = {
  hidden: { 
    opacity: 0, 
    x: -20, // Less initial offset for snappier animation
    scale: 0.95
  },
  visible: {
    opacity: 1,
    x: 0,
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

// Updated Education Data
const educationData = [
  {
    degree: "B.Tech in Electronics and Communication Engineering",
    institution: "Netaji Subhas University of Technology (NSUT)",
    duration: "2024 - Present",
    description: "Pursuing a foundational degree in electronics and communication.",
    details: "Relevant coursework includes: Basic Electrical Engineering, Engineering Mathematics, Introduction to Programming. Actively involved in the university's Robotics Club and IEEE student chapter. Looking forward to specializing in VLSI Design and Embedded Systems in later years."
  },
  // Add more education if needed
];

// New Experience & Achievements Data
const experienceAndAchievementsData = [
  {
    type: "achievement",
    title: `Hackathon Winner - "Hack On Hills"`,
    institution: "NIT Hamirpur",
    date: "2025",
    description: "Secured first place in the 'Hack On Hills' hackathon, developing an innovative solution.",
    icon: <Award className="w-4 h-4 mr-2 text-primary/80" />,
    details: "Our team of 4 developed a project focusing on sustainable tourism in mountainous regions. The solution involved a mobile app for eco-friendly travel planning and a backend system for managing local resources. My role involved full-stack development using Python (Flask) for the backend and React Native for the mobile app. We were commended for the project's feasibility and potential impact."
  },
  {
    type: "internship",
    title: "Intern",
    institution: "Exam Centre and TnP, NSUT",
    date: "Ongoing", // Or specify actual duration
    description: "Contributing to the automation of processes and designing iOS/Android applications for students & teachers, alongside a web application for staff.",
    icon: <Briefcase className="w-4 h-4 mr-2 text-primary/80" />,
    details: "Key responsibilities include: \\n- Developing and maintaining features for a cross-platform mobile application using Flutter and Firebase for students and teachers, focusing on timetable management, announcements, and resource sharing. \\n- Assisting in the design and development of a web-based portal for administrative staff to streamline examination scheduling and placement activities, using React and Node.js. \\n- Participating in SCRUM meetings and contributing to the agile development lifecycle."
  }
  // Add more experiences or achievements if needed
];

export default function ExperienceSection() {
  const sectionRef = useRef(null);
  const timelineRef = useRef(null);
  const timelineInView = useInView(timelineRef, { once: true, amount: 0.1 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const { scrollYProgress: timelineScrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start center", "end end"]
  });
  
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const parallaxOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  // Animation for the timeline connector line that appears quicker
  const connectorAnimation = {
    hidden: { scaleY: 0, originY: 0 },
    visible: {
      scaleY: 1,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <section 
      id="journey"
      ref={sectionRef}
      className="section-animate py-24 relative overflow-hidden"
    >
      {/* Background elements */}
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
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={scrollFadeUp}
        >
          <h2 className="heading-lg mb-4">
            My <span className="gradient-text">Journey</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Highlights of my professional experience, achievements, and educational background.
          </p>
        </motion.div>

        <motion.div 
          ref={timelineRef}
          className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-8"
          variants={timelineContainerVariants}
          initial="hidden"
          animate={timelineInView ? "visible" : "hidden"}
        >
          {/* Experience & Achievements Column */}
          <motion.div variants={timelineItemVariants}>
            <motion.h3
              className="text-2xl font-bold mb-8 flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={timelineInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={timelineInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -90 }}
                transition={{ duration: 0.4, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                className="relative"
              >
                <Briefcase className="w-6 h-6 mr-3 text-primary" />
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={timelineInView ? { scale: 1.5, opacity: 0.3 } : { scale: 0, opacity: 0 }}
                  transition={{
                    repeat: Infinity,
                    repeatType: "mirror",
                    duration: 1.5,
                    delay: 0.5,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-primary/20 rounded-full"
                />
              </motion.div>
              Experience & Achievements
            </motion.h3>
            <div className="relative pl-6">
              {/* Animated timeline line with pulse effect */}
              <motion.div
                className="absolute left-0 top-0 w-[2px] h-full origin-top"
                style={{
                  scaleY: timelineScrollYProgress,
                  background: "linear-gradient(to bottom, hsl(var(--primary)), rgba(var(--primary-rgb), 0.6) 70%, transparent)"
                }}
              />
              <motion.div
                variants={timelineContainerVariants}
                className="space-y-0"
              >
                {experienceAndAchievementsData.map((item, index) => (
                  <motion.div
                    key={index}
                    variants={timelineItemVariants}
                    className="relative"
                  >
                    <TimelineItem item={item} isEducation={false} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>

          {/* Education Column */}
          <motion.div variants={timelineItemVariants}>
            <motion.h3 
              className="text-2xl font-bold mb-8 flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={timelineInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={timelineInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -90 }}
                transition={{ duration: 0.4, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                className="relative"
              >
                <School className="w-6 h-6 mr-3 text-primary" />
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={timelineInView ? { scale: 1.5, opacity: 0.3 } : { scale: 0, opacity: 0 }}
                  transition={{
                    repeat: Infinity,
                    repeatType: "mirror",
                    duration: 1.5,
                    delay: 0.7,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-primary/20 rounded-full"
                />
              </motion.div>
              Education
            </motion.h3>
            <div className="relative pl-6">
              {/* Animated timeline line with pulse effect */}
              <motion.div
                className="absolute left-0 top-0 w-[2px] h-full origin-top"
                style={{
                  scaleY: timelineScrollYProgress,
                  background: "linear-gradient(to bottom, hsl(var(--primary)), rgba(var(--primary-rgb), 0.6) 70%, transparent)"
                }}
              />
              <motion.div
                variants={timelineContainerVariants}
                className="space-y-0"
              >
                {educationData.map((edu, index) => (
                  <motion.div
                    key={index}
                    variants={timelineItemVariants}
                    className="relative"
                  >
                    <TimelineItem item={edu} isEducation={true} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
