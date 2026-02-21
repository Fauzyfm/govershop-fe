"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PageLoading from "@/components/ui/page-loading";
import { Clock, Wrench } from "lucide-react";

interface GameCardProps {
    name: string;
    image: string;
    href: string;
    status?: string; // 'active', 'coming_soon', 'maintenance'
}

export default function GameCard({ name, image, href, status = 'active' }: GameCardProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const isComingSoon = status === 'coming_soon';
    const isMaintenance = status === 'maintenance';
    const isDisabled = isComingSoon || isMaintenance;

    // External URLs often block Next.js image optimization proxy (403/400 errors)
    // Only optimize local images (starting with /)
    const isUnoptimized = !image?.startsWith('/');

    const handleClick = (e: React.MouseEvent) => {
        if (isDisabled) return;
        e.preventDefault();
        setIsLoading(true);
        router.push(href);
    };

    const Content = (
        <div className={`
            arcade-card group relative w-full aspect-3/4 rounded-2xl overflow-hidden
            ${isDisabled ? "grayscale opacity-70 cursor-not-allowed" : "cursor-pointer"}
        `}>
            {/* Scanline Overlay */}
            <div className="scanlines absolute inset-0 z-10 pointer-events-none" />

            {/* Image */}
            <div className="absolute inset-0">
                <Image
                    src={image}
                    alt={`Top Up ${name} — Govershop`}
                    fill
                    className={`object-cover transition-transform duration-700 ${isDisabled ? "" : "group-hover:scale-110 group-hover:rotate-1"}`}
                    loading="lazy"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                    unoptimized={isUnoptimized}
                />

                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent opacity-90 ${isDisabled ? "" : "group-hover:opacity-95 transition-opacity"}`} />

                {/* Fire Glow Overlay on Hover */}
                {!isDisabled && (
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                )}
            </div>

            {/* Arcade Border Glow - Fire Colored */}
            {!isDisabled && (
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                        boxShadow: 'inset 0 0 30px rgba(195, 17, 12, 0.4), 0 0 20px rgba(230, 80, 27, 0.3)'
                    }}
                />
            )}

            <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 z-20">
                <h3 className="text-foreground font-bold text-sm sm:text-base md:text-xl drop-shadow-lg group-hover:text-white transition-colors leading-tight line-clamp-2">
                    {name}
                </h3>

                {isDisabled ? (
                    <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full bg-accent/20 backdrop-blur-sm border border-accent/20">
                        <span className="text-[10px] sm:text-xs font-medium text-muted-foreground line-clamp-1">
                            {isComingSoon ? "Segera Hadir" : "Maintenance"}
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <div className="w-full h-1 bg-linear-to-r from-accent to-primary rounded-full shadow-[0_0_10px_rgba(230,80,27,0.8)]" />
                    </div>
                )}
            </div>

            {/* Status Badge */}
            {isComingSoon && (
                <div
                    title="Segera Hadir"
                    className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-accent/90 backdrop-blur-sm text-background rounded-full shadow-lg"
                >
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
            )}
            {isMaintenance && (
                <div
                    title="Maintenance"
                    className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-red-600/90 backdrop-blur-sm text-white rounded-full shadow-lg"
                >
                    <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
            )}
        </div>
    );

    if (isDisabled) {
        return (
            <div className="block select-none pointer-events-none">
                {Content}
            </div>
        );
    }

    return (
        <>
            <PageLoading isVisible={isLoading} gameName={name} gameImage={image} />
            <Link href={href} onClick={handleClick} className="block group-hover:z-10 relative transition-all duration-300">
                {Content}
            </Link>
        </>
    );
}
