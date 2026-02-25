"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { CarouselItem } from "@/types/api";

interface LayeredCarouselProps {
    items: CarouselItem[];
    autoPlayInterval?: number;
}

// Position config type
interface PositionConfig {
    xPercent: number;
    scale: number;
    zIndex: number;
    opacity: number;
    rotateY: number;
}

// Desktop: wider spread, more subtle rotation
const DESKTOP_CONFIGS: Record<number, PositionConfig> = {
    [-2]: { xPercent: -55, scale: 0.65, zIndex: 1, opacity: 0.4, rotateY: 45 },
    [-1]: { xPercent: -28, scale: 0.8, zIndex: 5, opacity: 0.7, rotateY: 30 },
    [0]: { xPercent: 0, scale: 1, zIndex: 10, opacity: 1, rotateY: 0 },
    [1]: { xPercent: 28, scale: 0.8, zIndex: 5, opacity: 0.7, rotateY: -30 },
    [2]: { xPercent: 55, scale: 0.65, zIndex: 1, opacity: 0.4, rotateY: -45 },
};

// Mobile: symmetric centered layout, tighter overlap
const MOBILE_CONFIGS: Record<number, PositionConfig> = {
    [-2]: { xPercent: -40, scale: 0.6, zIndex: 1, opacity: 0.3, rotateY: 40 },
    [-1]: { xPercent: -20, scale: 0.82, zIndex: 5, opacity: 0.6, rotateY: 25 },
    [0]: { xPercent: 0, scale: 1, zIndex: 10, opacity: 1, rotateY: 0 },
    [1]: { xPercent: 20, scale: 0.82, zIndex: 5, opacity: 0.6, rotateY: -25 },
    [2]: { xPercent: 40, scale: 0.6, zIndex: 1, opacity: 0.3, rotateY: -40 },
};

export default function LayeredCarousel({
    items,
    autoPlayInterval = 5000,
}: LayeredCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    // Detect screen size
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
    }, [items.length]);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    }, [items.length]);

    // Auto-play
    useEffect(() => {
        if (items.length <= 1) return;
        const interval = setInterval(nextSlide, autoPlayInterval);
        return () => clearInterval(interval);
    }, [items.length, nextSlide, autoPlayInterval]);

    // Calculate the "diff" for a given index relative to currentIndex
    const getDiff = (index: number): number => {
        let diff = index - currentIndex;
        if (diff > items.length / 2) diff -= items.length;
        if (diff < -items.length / 2) diff += items.length;
        return diff;
    };

    const configs = isMobile ? MOBILE_CONFIGS : DESKTOP_CONFIGS;
    // Mobile: card takes nearly full width for bigger banners; Desktop: 65%
    const cardWidth = isMobile ? 92 : 65;

    if (items.length === 0) return null;

    return (
        <div className="relative w-full py-4 md:py-10">
            {/* Carousel Container */}
            <div
                className="relative mx-auto overflow-hidden"
                style={{
                    maxWidth: "1152px",
                    // Container aspect ratio = 2.3037 * 100 / cardWidth 
                    // so the card (cardWidth% of container) has exactly 3110:1350 ratio matching banner images
                    aspectRatio: `${230.37 / cardWidth} / 1`,
                }}
            >
                {items.map((item, index) => {
                    const diff = getDiff(index);

                    // Only render items within visible range
                    if (Math.abs(diff) > 2) return null;

                    const config = configs[diff] || configs[0];

                    return (
                        <motion.div
                            key={item.id}
                            animate={{
                                x: `${config.xPercent}%`,
                                scale: config.scale,
                                opacity: config.opacity,
                                rotateY: config.rotateY,
                                zIndex: config.zIndex,
                            }}
                            transition={{
                                duration: 0.6,
                                ease: [0.32, 0.72, 0, 1],
                            }}
                            className="absolute rounded-xl md:rounded-2xl overflow-hidden border border-white/10 bg-background"
                            style={{
                                width: `${cardWidth}%`,
                                height: "100%",
                                left: "50%",
                                top: 0,
                                marginLeft: `${-cardWidth / 2}%`,
                                transformStyle: "preserve-3d",
                                boxShadow:
                                    diff === 0
                                        ? "0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)"
                                        : "0 15px 35px rgba(0,0,0,0.3)",
                            }}
                        >
                            {item.link_url ? (
                                <a href={item.link_url} className="block w-full h-full relative group">
                                    <Image
                                        src={item.image_url}
                                        alt={item.title || "Banner"}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 85vw, 750px"
                                        priority={diff === 0}
                                        unoptimized={!item.image_url?.startsWith("/")}
                                    />
                                    {/* Dark overlay for non-active slides */}
                                    {diff !== 0 && (
                                        <div className="absolute inset-0 bg-black/30" />
                                    )}
                                    {/* Shine on hover */}
                                    <div className="absolute inset-0 bg-linear-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                    {/* Title */}
                                    {item.title && diff === 0 && (
                                        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-6 bg-linear-to-t from-black/80 to-transparent">
                                            <h3 className="text-sm md:text-2xl font-bold text-white drop-shadow-md">
                                                {item.title}
                                            </h3>
                                        </div>
                                    )}
                                </a>
                            ) : (
                                <div className="relative w-full h-full">
                                    <Image
                                        src={item.image_url}
                                        alt={item.title || "Banner"}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 85vw, 750px"
                                        priority={diff === 0}
                                        unoptimized={!item.image_url?.startsWith("/")}
                                    />
                                    {diff !== 0 && (
                                        <div className="absolute inset-0 bg-black/30" />
                                    )}
                                    {item.title && diff === 0 && (
                                        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-6 bg-linear-to-t from-black/80 to-transparent">
                                            <h3 className="text-sm md:text-2xl font-bold text-white drop-shadow-md">
                                                {item.title}
                                            </h3>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Dot indicators */}
            {items.length > 1 && (
                <div className="flex justify-center items-center mt-4 md:mt-6">
                    <div className="flex gap-1.5 md:gap-2">
                        {items.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`h-2 md:h-2.5 rounded-full transition-all duration-300 ${index === currentIndex
                                    ? "w-6 md:w-8 bg-primary shadow-[0_0_10px_rgba(230,80,27,0.5)]"
                                    : "w-2 md:w-2.5 bg-white/20 hover:bg-white/40"
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
