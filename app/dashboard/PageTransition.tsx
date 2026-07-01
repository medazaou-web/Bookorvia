"use client";
import { ReactNode, useEffect, useState } from "react";

export default function PageTransition({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`transition-opacity duration-200 ease-out ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {children}
    </div>
  );
}
