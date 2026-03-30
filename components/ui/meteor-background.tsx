"use client";

import { useEffect, useState } from "react";

export function MeteorBackground({ number = 15 }: { number?: number }) {
  const [meteors, setMeteors] = useState<any[]>([]);

  useEffect(() => {
    // Generate meteor styles on the client to avoid hydration mismatch
    const generatedMeteors = new Array(number).fill(true).map(() => ({
      top: `${Math.floor(Math.random() * 100)}vh`,
      left: `${Math.floor(Math.random() * 100)}vw`,
      animationDelay: `${Math.random() * 5 + 0.2}s`,
      animationDuration: `${Math.floor(Math.random() * 6 + 3)}s`,
    }));
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
