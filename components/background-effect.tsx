"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { useTheme } from "next-themes"
import { useIsMobile } from "@/hooks/use-mobile"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

export default function BackgroundEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const isMobile = useIsMobile()
  const prefersReducedMotion = useReducedMotion()
  
  // Mount check to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!canvasRef.current || !mounted) return
    
    // Disable complex 3D effects on mobile and for reduced motion preference
    if (isMobile || prefersReducedMotion) {
      return
    }

    // Determine if we're in dark mode
    const isDarkMode = resolvedTheme === "dark"
    
    // Set colors based on theme
    const gridColor = isDarkMode ? 0xffffff : 0x000000
    const gridOpacity = isDarkMode ? 0.12 : 0.08
    const particleColor = isDarkMode ? 0xffffff : 0x000000
    const particleOpacity = isDarkMode ? 0.4 : 0.3

    // Create scene, camera, and renderer
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: false, // Disable antialiasing for better performance
      powerPreference: "high-performance"
    })
    
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    
    // Set camera position
    camera.position.z = 20
    
    // Create a cleaner grid with waves
    const gridSize = 40
    const gridDivisions = 30
    const gridMaterial = new THREE.LineBasicMaterial({ 
      color: gridColor,
      transparent: true,
      opacity: gridOpacity,
    })
    
    // Create 3D Grid with waves
    const gridGroup = new THREE.Group()
    
    // Function to create wave effect
    const createWavePoint = (x: number, z: number, time: number = 0) => {
      const distance = Math.sqrt(x*x + z*z) / 5;
      const y = Math.sin(distance + time) * 1.5;
      return new THREE.Vector3(x, y, z);
    }
    
    // Create grid lines with wave effect
    for (let i = 0; i <= gridDivisions; i++) {
      const linePoints = [];
      for (let j = 0; j <= 100; j++) { // Increase resolution for smoother curves
        const x = -gridSize/2 + j * (gridSize/100);
        const z = -gridSize/2 + i * (gridSize/gridDivisions);
        linePoints.push(createWavePoint(x, z));
      }
      
      const line = new THREE.BufferGeometry().setFromPoints(linePoints);
      const gridLine = new THREE.Line(line, gridMaterial);
      gridGroup.add(gridLine);
    }
    
    for (let i = 0; i <= gridDivisions; i++) {
      const linePoints = [];
      for (let j = 0; j <= 100; j++) { // Increase resolution for smoother curves
        const x = -gridSize/2 + i * (gridSize/gridDivisions);
        const z = -gridSize/2 + j * (gridSize/100);
        linePoints.push(createWavePoint(x, z));
      }
      
      const line = new THREE.BufferGeometry().setFromPoints(linePoints);
      const gridLine = new THREE.Line(line, gridMaterial);
      gridGroup.add(gridLine);
    }
    
    scene.add(gridGroup);
    
    // Create particle system with reduced count
    const particlesCount = 250; // Reduced from 500 for better performance
    const particlesGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particlesCount * 3);
    const particleSizes = new Float32Array(particlesCount);
    
    for (let i = 0; i < particlesCount; i++) {
      // Random position within a larger volume than the grid
      const i3 = i * 3;
      particlePositions[i3] = (Math.random() - 0.5) * gridSize * 1.5;
      particlePositions[i3 + 1] = (Math.random() - 0.5) * gridSize * 0.5;
      particlePositions[i3 + 2] = (Math.random() - 0.5) * gridSize * 1.5;
      
      // Random sizes
      particleSizes[i] = Math.random() * 2;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
    
    const particlesMaterial = new THREE.PointsMaterial({
      color: particleColor,
      size: 0.1,
      transparent: true,
      opacity: particleOpacity,
      sizeAttenuation: true,
    });
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    
    // Initial rotation
    gridGroup.rotation.x = Math.PI / 6;
    
    // Mouse interaction for rotation
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    
    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    let time = 0;
    const animate = () => {
      time += 0.01;
      
      // Update wave effect
      gridGroup.children.forEach((child) => {
        if (child instanceof THREE.Line) {
          const line = child;
          const geometry = line.geometry;
          const positions = geometry.attributes.position.array;
          
          for (let i = 0; i < positions.length / 3; i++) {
            const i3 = i * 3;
            const x = positions[i3];
            const z = positions[i3 + 2];
            
            // Apply wave effect
            positions[i3 + 1] = createWavePoint(x, z, time).y;
          }
          
          geometry.attributes.position.needsUpdate = true;
        }
      });
      
      // Rotate particles slightly with consistent speed
      particles.rotation.y += 0.0003;
      particles.rotation.x += 0.0003;
      
      // Rotate grid based on mouse with consistent easing
      targetX = mouseX * 0.3;
      targetY = mouseY * 0.2;
      
      gridGroup.rotation.y += (targetX - gridGroup.rotation.y) * 0.05;
      gridGroup.rotation.x += (targetY - gridGroup.rotation.x) * 0.05;
      
      // Subtle continuous rotation
      gridGroup.rotation.y += 0.0003;
      
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    
    animate();
    
    // Clean up
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      scene.remove(gridGroup);
      scene.remove(particles);
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      gridMaterial.dispose();
      renderer.dispose();
    };
  }, [mounted, resolvedTheme, theme, isMobile, prefersReducedMotion]);

  if (!mounted) return null;

  // Show mobile-optimized background that matches the desktop aesthetic
  if (isMobile || prefersReducedMotion) {
    return (
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/10" />
        
        {/* CSS-only animated particles - similar to desktop */}
        <div className="absolute inset-0">
          {Array.from({ length: 30 }).map((_, i) => {
            const size = Math.random() > 0.7 ? 'w-2 h-2' : 'w-1 h-1';
            const opacity = Math.random() > 0.5 ? 'bg-primary/30' : 'bg-primary/15';
            return (
              <div
                key={i}
                className={`absolute ${size} ${opacity} rounded-full animate-float`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 15}s`,
                  animationDuration: `${10 + Math.random() * 8}s`,
                }}
              />
            );
          })}
        </div>
        
        {/* Larger floating elements for depth */}
        <div className="absolute inset-0">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`large-${i}`}
              className="absolute w-3 h-3 bg-primary/10 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${6 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
        
        {/* Subtle animated grid overlay */}
        <div 
          className="absolute inset-0 opacity-5 animate-wave"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            animationDelay: '2s',
          }}
        />
        
        {/* Additional subtle moving gradients for depth */}
        <div className="absolute inset-0">
          <div 
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: '8s', animationDelay: '1s' }}
          />
          <div 
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-2xl animate-pulse"
            style={{ animationDuration: '12s', animationDelay: '4s' }}
          />
        </div>
      </div>
    )
  }

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full -z-10"
    />
  );
}
