'use client';

import useLenis from '@/hooks/use-lenis';

const SmoothScrollProvider = ({ children }: { children: React.ReactNode }) => {
  useLenis();
  return <>{children}</>;
};

export default SmoothScrollProvider;
