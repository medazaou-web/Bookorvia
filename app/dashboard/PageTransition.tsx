"use client";
import { ReactNode, useEffect, useState } from "react";

export default function PageTransition({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`animate-in ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {children}
    </div>
  );
}
