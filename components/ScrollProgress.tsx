// components/ScrollProgress.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", updateProgress);
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 h-1 bg-chart-3 z-50"
      style={{ width: `${scrollProgress * 100}%` }}
      initial={{ width: 0 }}
      animate={{ width: `${scrollProgress * 100}%` }}
      transition={{ ease: "easeOut", duration: 0.2 }}
    />
  );
}
