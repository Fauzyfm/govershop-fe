"use client";

import { motion } from "framer-motion";

interface PageLoadingProps {
    isVisible: boolean;
    gameName?: string;
    gameImage?: string;
}

export default function PageLoading({ isVisible, gameName, gameImage }: PageLoadingProps) {
    if (!isVisible) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl"
        >
            {/* Background Glow Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>

            {/* Content */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
                className="relative flex flex-col items-center gap-6"
            >
                {/* Game Image Card */}
                {gameImage && (
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5, ease: "backOut" }}
                        className="relative w-32 h-40 rounded-2xl overflow-hidden shadow-2xl shadow-primary/30"
                    >
                        <img
                            src={gameImage}
                            alt={gameName || "Loading"}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                        {/* Shimmer Effect */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        />
                    </motion.div>
                )}

                {/* Game Name */}
                {gameName && (
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-xl md:text-2xl font-bold text-white text-center"
                    >
                        {gameName}
                    </motion.h2>
                )}

                {/* Loading Animation */}
                <div className="flex flex-col items-center gap-4">
                    {/* Spinner */}
                    <motion.div
                        className="relative w-16 h-16"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    >
                        {/* Outer ring */}
                        <div className="absolute inset-0 rounded-full border-4 border-white/10" />
                        {/* Spinning gradient arc */}
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-emerald-400" />
                        {/* Inner glow */}
                        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/20 to-emerald-500/10 blur-sm" />
                    </motion.div>

                    {/* Loading Text */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex items-center gap-2"
                    >
                        <span className="text-sm text-white/70 font-medium">Memuat</span>
                        <motion.span
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ repeat: Infinity, duration: 1.2 }}
                            className="flex gap-0.5"
                        >
                            <span className="w-1.5 h-1.5 bg-primary rounded-full" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-primary rounded-full" style={{ animationDelay: '200ms' }} />
                            <span className="w-1.5 h-1.5 bg-primary rounded-full" style={{ animationDelay: '400ms' }} />
                        </motion.span>
                    </motion.div>

                    {/* Animated Dots */}
                    <div className="flex gap-1.5">
                        {[0, 1, 2].map((i) => (
                            <motion.span
                                key={i}
                                className="w-2 h-2 bg-gradient-to-r from-primary to-emerald-400 rounded-full"
                                animate={{
                                    scale: [1, 1.3, 1],
                                    opacity: [0.5, 1, 0.5],
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 0.8,
                                    delay: i * 0.15,
                                    ease: "easeInOut",
                                }}
                            />
                        ))}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
