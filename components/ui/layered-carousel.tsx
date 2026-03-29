"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { CarouselItem } from "@/types/api";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselProps {
    items: CarouselItem[];
    autoPlayInterval?: number;
}

export default function LayeredCarousel({
    items,
    autoPlayInterval = 5000,
}: CarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

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

    if (items.length === 0) return null;

    return (
        <div className="relative w-full max-w-7xl mx-auto py-4 md:py-6">
            {/* Carousel Container */}
            <div className="relative w-full aspect-21/9 md:aspect-5/2 lg:aspect-21/9 rounded-2xl overflow-hidden group">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="absolute inset-0"
                    >
                        {items[currentIndex].link_url ? (
                            <a href={items[currentIndex].link_url} className="block w-full h-full relative">
                                <Image
                                    src={items[currentIndex].image_url}
                                    alt={items[currentIndex].title || "Banner"}
                                    fill
                                    className="object-cover"
                                    sizes="100vw"
                                    priority
                                    unoptimized={!items[currentIndex].image_url?.startsWith("/")}
                                />
                                {items[currentIndex].title && (
                                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent flex items-end p-6 md:p-10">
                                        <h3 className="text-xl md:text-3xl font-bold text-white drop-shadow-md">
                                            {items[currentIndex].title}
                                        </h3>
                                    </div>
                                )}
                            </a>
                        ) : (
                            <div className="relative w-full h-full">
                                <Image
                                    src={items[currentIndex].image_url}
                                    alt={items[currentIndex].title || "Banner"}
                                    fill
                                    className="object-cover"
                                    sizes="100vw"
                                    priority
                                    unoptimized={!items[currentIndex].image_url?.startsWith("/")}
                                />
                                {items[currentIndex].title && (
                                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent flex items-end p-6 md:p-10">
                                        <h3 className="text-xl md:text-3xl font-bold text-white drop-shadow-md">
                                            {items[currentIndex].title}
                                        </h3>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                {items.length > 1 && (
                    <>
                        <button
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </>
                )}
            </div>

            {/* Dot indicators */}
            {items.length > 1 && (
                <div className="flex justify-center items-center mt-6">
                    <div className="flex gap-2.5">
                        {items.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`h-2.5 rounded-full transition-all duration-300 ${index === currentIndex
                                    ? "w-8 bg-primary shadow-[0_0_10px_rgba(230,80,27,0.5)]"
                                    : "w-2.5 bg-white/20 hover:bg-white/40"
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
