"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

interface PageLoadingProps {
    isVisible: boolean;
    gameName?: string;
    gameImage?: string;
}

export default function PageLoading({ isVisible, gameName, gameImage }: PageLoadingProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-100 flex items-center justify-center bg-background/95 backdrop-blur-xl"
                >
                    {/* Ambient Glow Background - Fire colors */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[100px] animate-pulse" />
                        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full bg-accent/20 blur-[80px] animate-pulse" style={{ animationDelay: '0.5s' }} />
                    </div>

                    {/* Loading Content */}
                    <div className="relative z-10 flex flex-col items-center gap-6">
                        {/* Game Preview */}
                        {gameImage && (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: 0.4 }}
                                className="relative"
                            >
                                {/* Glow Effect */}
                                <div className="absolute -inset-4 bg-linear-to-b from-primary/30 to-accent/30 rounded-3xl blur-2xl" />

                                {/* Image Container */}
                                <div className="arcade-card relative w-32 h-40 rounded-2xl overflow-hidden border-2 border-primary/50 shadow-[0_0_30px_rgba(230,80,27,0.3)]">
                                    <img
                                        src={gameImage}
                                        alt={gameName || "Loading"}
                                        className="w-full h-full object-cover"
                                    />

                                    {/* Shimmer Effect */}
                                    <motion.div
                                        animate={{ x: ["-100%", "100%"] }}
                                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                        className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* Game Name */}
                        {gameName && (
                            <motion.h3
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-xl font-bold text-foreground text-center neon-glow"
                            >
                                {gameName}
                            </motion.h3>
                        )}

                        {/* Spinner & Flame */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="relative flex items-center justify-center"
                        >
                            {/* Outer Ring */}
                            <div className="w-16 h-16 rounded-full border-2 border-primary/20 glow-pulse absolute" />

                            {/* Spinning Ring */}
                            <div className="w-16 h-16 rounded-full border-2 border-transparent border-t-primary border-r-accent animate-spin absolute" />
                        </motion.div>

                        {/* Loading Text */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="flex items-center gap-2 text-muted-foreground text-sm font-medium tracking-widest uppercase mt-3"
                        >
                            <span className="flex gap-1">
                                <motion.span
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}
                                    className="text-primary"
                                >.</motion.span>
                                <motion.span
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                                    className="text-primary"
                                >.</motion.span>
                                <motion.span
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                                    className="text-primary"
                                >.</motion.span>
                            </span>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
