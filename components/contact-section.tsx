"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Button } from "@/components/ui/button"
import { Github, Linkedin, Twitter, Instagram, Mail } from "lucide-react"

// Animation variants
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
}

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  }

export default function ContactSection() {
  const { ref } = useInView({ triggerOnce: false, threshold: 0.1 })

  const socialLinks = [
    { name: "GitHub", icon: <Github className="w-5 h-5" />, url: "https://github.com/yourusername" },
    { name: "LinkedIn", icon: <Linkedin className="w-5 h-5" />, url: "https://linkedin.com/in/yourusername" },
    { name: "Twitter", icon: <Twitter className="w-5 h-5" />, url: "https://twitter.com/yourusername" },
    { name: "Instagram", icon: <Instagram className="w-5 h-5" />, url: "https://instagram.com/yourusername" },
  ]

  return (
    <section 
      id="contact" 
      ref={ref}
      className="section-animate py-20 relative overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.02] bg-[length:50px_50px]" />
        <div className="absolute top-[30%] right-[5%] w-80 h-80 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] left-[10%] w-96 h-96 bg-secondary/5 rounded-full blur-[150px]" />
      </div>

      <div className="container px-4 mx-auto relative z-10">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          {/* Heading */}
          <motion.h2 
            className="heading-lg mb-6"
            variants={itemVariants}
          >
            Let's <span className="gradient-text">Connect</span>
          </motion.h2>

          {/* Short message */}
          <motion.p 
            className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto"
            variants={itemVariants}
          >
            Open to new ideas, collaborations, or just a friendly hello.
          </motion.p>

          {/* Email button */}
          <motion.div 
            className="mb-8 flex justify-center"
            variants={itemVariants}
          >
            <Button
              asChild
              className="fill-center-button group text-base px-6 py-3 h-auto"
            >
              <a href="mailto:your.email@example.com">
                <Mail className="mr-2 h-4 w-4" />
                Say Hello
              </a>
            </Button>
          </motion.div>

          {/* Social links */}
          <motion.div 
            className="flex flex-wrap justify-center gap-3 mb-8"
            variants={itemVariants}
          >
            {socialLinks.map((link, index) => (
              <Button
                key={index}
                asChild
                variant="ghost"
                className="h-10 w-10 rounded-full border border-transparent transition-all duration-150 ease-out group hover:border-white hover:text-white"
              >
                <a 
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.name}
                >
                  <span className="flex items-center justify-center w-full h-full text-inherit">
                    {link.icon}
                  </span>
                </a>
              </Button>
            ))}
          </motion.div>

          {/* Made with love */}
          <motion.p 
            className="mt-8 text-sm text-muted-foreground flex items-center justify-center gap-2"
            variants={itemVariants}
          >
            Made with love <span className="text-white text-lg">&#9825;</span>
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
