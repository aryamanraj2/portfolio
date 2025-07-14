"use client"

import { useRef, useEffect } from "react"
import * as THREE from "three"
import { useIsMobile } from "@/hooks/use-mobile"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

interface ThreeSceneProps {
  intensity?: number
}

export default function ThreeScene({ intensity = 0.3 }: ThreeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const pointsRef = useRef<THREE.Points | null>(null)
  const frameIdRef = useRef<number | null>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const isMobile = useIsMobile()
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (!containerRef.current) return
    
    // Disable on mobile or when reduced motion is preferred for better performance
    if (isMobile || prefersReducedMotion) {
      return
    }

    // Initialize scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 5
    cameraRef.current = camera

    // Initialize renderer with performance optimizations
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: false, // Disable antialiasing for better performance
      powerPreference: "high-performance"
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // Cap pixel ratio for performance
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Handle mouse movement
    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
      }
    }

    // Handle window resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return
      cameraRef.current.aspect = window.innerWidth / window.innerHeight
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(window.innerWidth, window.innerHeight)
    }

    // Create particle scene with reduced particle count for better performance
    const particlesGeometry = new THREE.BufferGeometry()
    const particlesCount = 800 // Reduced from 1500 for better performance

    const posArray = new Float32Array(particlesCount * 3)
    const colorsArray = new Float32Array(particlesCount * 3)

    // Chinese Silver palette colors
    const colors = [
      [0.9, 0.87, 0.85], // Silver Light
      [0.71, 0.69, 0.68], // Silver Medium
      [0.44, 0.44, 0.44], // Silver Dark
      [0.18, 0.18, 0.18], // Silver Charcoal
    ]

    for (let i = 0; i < particlesCount * 3; i += 3) {
      // Position - spread particles more evenly
      posArray[i] = (Math.random() - 0.5) * 15
      posArray[i + 1] = (Math.random() - 0.5) * 15
      posArray[i + 2] = (Math.random() - 0.5) * 5

      // Color
      const colorIndex = Math.floor(Math.random() * colors.length)
      colorsArray[i] = colors[colorIndex][0]
      colorsArray[i + 1] = colors[colorIndex][1]
      colorsArray[i + 2] = colors[colorIndex][2]
    }

    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3))
    particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colorsArray, 3))

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
      transparent: true,
      opacity: intensity,
    })

    const particles = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particles)
    pointsRef.current = particles

    // Animation loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate)

      if (pointsRef.current) {
        // Consistent, subtle rotation
        pointsRef.current.rotation.x += 0.0003
        pointsRef.current.rotation.y += 0.0003

        // Subtle mouse interaction
        pointsRef.current.rotation.x += mouseRef.current.y * 0.0003
        pointsRef.current.rotation.y += mouseRef.current.x * 0.0003
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("resize", handleResize)

    animate()

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", handleResize)

      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current)
      }

      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement)
        rendererRef.current.dispose()
      }
    }
  }, [intensity, isMobile, prefersReducedMotion])

  return <div ref={containerRef} className="absolute inset-0 -z-10" />
}
