"use client"

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface HoverContextProps {
  isButtonHovered: boolean;
}

const HoverContext = createContext<HoverContextProps | undefined>(undefined);

interface HoverProviderProps {
  children: ReactNode;
}

export const HoverProvider: React.FC<HoverProviderProps> = ({ children }) => {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const isMobile = useIsMobile();

  const isInteractiveElement = (target: Element): boolean => {
    return target.tagName === 'BUTTON' || 
           target.hasAttribute('role') && target.getAttribute('role') === 'button' ||
           target.closest('button, [role="button"], a, .btn, .button, input[type="button"], input[type="submit"], .interactive-card') !== null ||
           target.closest('svg[aria-hidden="true"], span[aria-hidden="true"]') !== null;
  };

  useEffect(() => {
    // Don't add hover listeners on mobile devices
    if (isMobile) {
      return;
    }

    const handleMouseOver = (event: MouseEvent) => {
      if ((event.target instanceof Element)) {
        const target = event.target;
        if (isInteractiveElement(target)) {
          console.log('HoverContext: Mouse OVER interactive element', target);
          setIsButtonHovered(true);
        }
      }
    };

    const handleMouseOut = (event: MouseEvent) => {
       if ((event.target instanceof Element)) {
         const target = event.target;
         if (isInteractiveElement(target)) {
           // Only set to false if we're not moving to another interactive element
           if (!event.relatedTarget || 
               !(event.relatedTarget instanceof Element) || 
               !isInteractiveElement(event.relatedTarget)) {
             console.log('HoverContext: Mouse OUT of interactive element', target);
             setIsButtonHovered(false);
           }
         }
       }
    };

    // Touch event handlers for mobile-like interactions on touch-capable devices
    const handleTouchStart = (event: TouchEvent) => {
      if (event.target instanceof Element && isInteractiveElement(event.target)) {
        setIsButtonHovered(true);
      }
    };

    const handleTouchEnd = () => {
      // Delay resetting to allow for tap animations
      setTimeout(() => setIsButtonHovered(false), 150);
    };

    console.log('HoverContext: Adding listeners');
    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mouseout', handleMouseOut, true);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      console.log('HoverContext: Removing listeners');
      document.removeEventListener('mouseover', handleMouseOver, true);
      document.removeEventListener('mouseout', handleMouseOut, true);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile]);

  console.log('HoverContext: Rendering Provider, isButtonHovered:', isButtonHovered);
  return (
    <HoverContext.Provider value={{ isButtonHovered }}>
      {children}
    </HoverContext.Provider>
  );
};

export const useButtonHover = (): HoverContextProps => {
  const context = useContext(HoverContext);
  if (context === undefined) {
    throw new Error('useButtonHover must be used within a HoverProvider');
  }
  return context;
};
