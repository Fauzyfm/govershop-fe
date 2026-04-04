"use client";

import { useEffect, useState } from "react";

interface MeteorStyle {
  top: string;
  left: string;
  animationDelay: string;
  animationDuration: string;
  width: string;
  opacity: number;
}

export function MeteorBackground({ number = 15 }: { number?: number }) {
  const [meteors, setMeteors] = useState<MeteorStyle[]>([]);

  useEffect(() => {
    // Generate meteor styles on the client to avoid hydration mismatch
    // Create more meteors with varied sizes and better distribution
    const generatedMeteors: MeteorStyle[] = new Array(number).fill(true).map(() => {
      // Distribute across the entire viewport more evenly
      // Use negative top values too so some start from above viewport
      const topVal = Math.random() * 120 - 10; // -10% to 110%
      const leftVal = Math.random() * 120 - 10; // -10% to 110%
      
      // Vary sizes: some small, some medium, some large
      const sizeRand = Math.random();
      let width: number;
      if (sizeRand < 0.4) {
        width = Math.floor(Math.random() * 60 + 40); // 40-100px (small)
      } else if (sizeRand < 0.8) {
        width = Math.floor(Math.random() * 80 + 100); // 100-180px (medium)
      } else {
        width = Math.floor(Math.random() * 100 + 180); // 180-280px (large)
      }

      return {
        top: `${topVal}%`,
        left: `${leftVal}%`,
        animationDelay: `${(Math.random() * 12 + 0.2).toFixed(1)}s`,
        animationDuration: `${(Math.random() * 8 + 4).toFixed(1)}s`,
        width: `${width}px`,
        opacity: 0,
      };
    });
    setMeteors(generatedMeteors);
  }, [number]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {meteors.map((style, idx) => (
        <span
          key={idx}
          className="meteor-effect"
          style={style}
        ></span>
      ))}
    </div>
  );
}
