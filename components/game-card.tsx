"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PageLoading from "@/components/ui/page-loading";
import { Clock, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GameCardProps {
    name: string;
    image: string;
    href: string;
    status?: string; // 'active', 'coming_soon', 'maintenance'
}

export default function GameCard({ name, image, href, status = 'active' }: GameCardProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
    const cardRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const isComingSoon = status === 'coming_soon';
    const isMaintenance = status === 'maintenance';
    const isDisabled = isComingSoon || isMaintenance;

    const isUnoptimized = !image?.startsWith('/');

    // 3D tilt on mouse move
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (isDisabled || !cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;
        setTilt({ rotateX, rotateY });
    }, [isDisabled]);

    const handleMouseLeave = useCallback(() => {
        setTilt({ rotateX: 0, rotateY: 0 });
    }, []);

    const handleClick = (e: React.MouseEvent) => {
        if (isDisabled) return;
        e.preventDefault();
        setIsLoading(true);
        router.push(href);
    };

    const CardContent = (
        <div
            ref={cardRef}
            className={`crystal-wrapper w-full ${isDisabled ? "grayscale opacity-60" : ""}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* Crystal border glow — clipped to gem shape */}
            <div className="crystal-border crystal-clip">
                {/* Inner card — also clipped to gem shape */}
                <div
                    className="crystal-card crystal-clip aspect-3/4"
                    style={{
                        transform: !isDisabled
                            ? `perspective(800px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`
                            : undefined,
                        transition: 'transform 0.15s ease-out',
                    }}
                >
                    {/* Game image — fills entire card */}
                    <div className="absolute inset-0">
                        <Image
                            src={image}
                            alt={`Top Up ${name} — Restopup`}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            loading="lazy"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                            unoptimized={isUnoptimized}
                        />
                    </div>

                    {/* Dark gradient from bottom for readability */}
                    <div className={`
                        absolute inset-0
                        bg-gradient-to-t from-black/80 via-black/30 to-transparent
                        transition-opacity duration-500
                        ${isDisabled ? "opacity-70" : "opacity-60 group-hover:opacity-80"}
                    `} />

                    {/* Shimmer sweep effect — always active */}
                    {!isDisabled && <div className="crystal-shimmer" />}

                    {/* Name overlay — always visible */}
                    {!isDisabled && (
                        <div className="crystal-name-overlay">
                            <h3 className="text-white font-bold text-xs sm:text-sm md:text-base drop-shadow-lg leading-tight line-clamp-2">
                                {name}
                            </h3>
                            <div className="w-8 h-0.5 bg-gradient-to-r from-white/80 to-white/20 rounded-full mt-1.5" />
                        </div>
                    )}

                    {/* Disabled state content */}
                    {isDisabled && (
                        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 z-20">
                            <Badge
                                variant="secondary"
                                className="bg-accent/15 text-muted-foreground border-accent/20 text-[10px] sm:text-xs py-0.5"
                            >
                                {isComingSoon ? (
                                    <><Clock className="w-3 h-3 mr-1" /> Segera Hadir</>
                                ) : (
                                    <><Wrench className="w-3 h-3 mr-1" /> Maintenance</>
                                )}
                            </Badge>
                        </div>
                    )}

                    {/* Status Badge (top-right corner) */}
                    {isComingSoon && (
                        <div
                            title="Segera Hadir"
                            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-accent/90 backdrop-blur-sm text-background rounded-full shadow-lg"
                        >
                            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                    )}
                    {isMaintenance && (
                        <div
                            title="Maintenance"
                            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-red-600/90 backdrop-blur-sm text-white rounded-full shadow-lg"
                        >
                            <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    if (isDisabled) {
        return (
            <div className="block select-none pointer-events-none">
                {CardContent}
            </div>
        );
    }

    return (
        <>
            <PageLoading isVisible={isLoading} gameName={name} gameImage={image} />
            <Link href={href} onClick={handleClick} className="block group relative transition-all duration-300">
                {CardContent}
            </Link>
        </>
    );
}
