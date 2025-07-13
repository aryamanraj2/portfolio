"use client"

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface HoverContextProps {
  isButtonHovered: boolean;
}

const HoverContext = createContext<HoverContextProps | undefined>(undefined);

interface HoverProviderProps {
  children: ReactNode;
}

export const HoverProvider: React.FC<HoverProviderProps> = ({ children }) => {
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  useEffect(() => {
    const handleMouseOver = (event: MouseEvent) => {
      // Check for buttons, elements with role="button", interactive elements, or our eyeballs
      if ((event.target instanceof Element)) {
        const target = event.target;
        const isButton = 
          target.tagName === 'BUTTON' || 
          target.hasAttribute('role') && target.getAttribute('role') === 'button' ||
          target.closest('button, [role="button"], a, .btn, .button, input[type="button"], input[type="submit"], .interactive-card') !== null ||
          target.closest('svg[aria-hidden="true"], span[aria-hidden="true"]') !== null;
          
        if (isButton) {
          console.log('HoverContext: Mouse OVER interactive element', target);
          setIsButtonHovered(true);
        }
      }
    };

    const handleMouseOut = (event: MouseEvent) => {
       if ((event.target instanceof Element)) {
         const target = event.target;
         const isButton = 
           target.tagName === 'BUTTON' || 
           target.hasAttribute('role') && target.getAttribute('role') === 'button' ||
           target.closest('button, [role="button"], a, .btn, .button, input[type="button"], input[type="submit"], .interactive-card') !== null ||
           target.closest('svg[aria-hidden="true"], span[aria-hidden="true"]') !== null;
           
         if (isButton) {
           // Only set to false if we're not moving to another button or interactive element
           if (!event.relatedTarget || 
               !(event.relatedTarget instanceof Element) || 
               !(event.relatedTarget.tagName === 'BUTTON' || 
                 (event.relatedTarget.hasAttribute('role') && event.relatedTarget.getAttribute('role') === 'button') ||
                 event.relatedTarget.closest('button, [role="button"], a, .btn, .button, input[type="button"], input[type="submit"], .interactive-card') !== null ||
                 event.relatedTarget.closest('svg[aria-hidden="true"], span[aria-hidden="true"]') !== null)) {
             console.log('HoverContext: Mouse OUT of interactive element', target);
             setIsButtonHovered(false);
           }
         }
       }
    };

    console.log('HoverContext: Adding listeners');
    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mouseout', handleMouseOut, true);

    return () => {
      console.log('HoverContext: Removing listeners');
      document.removeEventListener('mouseover', handleMouseOver, true);
      document.removeEventListener('mouseout', handleMouseOut, true);
    };
  }, []);

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
