"use client";

import { useState } from "react";
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
            arcade-card group relative w-full aspect-3/4 rounded-lg overflow-hidden shadow-xl
            ${isDisabled
                ? "grayscale opacity-60 cursor-not-allowed"
                : "cursor-pointer transition-all duration-500"
            }
        `}>
            {/* Image */}
            <div className="absolute inset-0 border-4 border-[#FFDAD7]">
                <Image
                    src={image}
                    alt={`Top Up ${name} — Restopup`}
                    fill
                    className={`object-cover transition-transform duration-700 ${isDisabled ? "" : ""}`}
                    loading="lazy"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                    unoptimized={isUnoptimized}
                />

                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-linear-to-t  from-background via-background/50 to-transparent opacity-90 w-full ${isDisabled ? "" : "group-hover:opacity-95 transition-opacity duration-500"}`} />

                {/* Subtle glow on hover */}
                {!isDisabled && (
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                )}
            </div>

            {/* Bottom content */}
            <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 z-20">


                {isDisabled ? (
                    <Badge
                        variant="secondary"
                        className="mt-1.5 bg-accent/15 text-muted-foreground border-accent/20 text-[10px] sm:text-xs py-0.5"
                    >
                        {isComingSoon ? (
                            <><Clock className="w-3 h-3 mr-1" /> Segera Hadir</>
                        ) : (
                            <><Wrench className="w-3 h-3 mr-1" /> Maintenance</>
                        )}
                    </Badge>
                ) : (
                    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 flex-col">
                        <h3 className="text-foreground font-bold text-sm sm:text-base md:text-lg drop-shadow-lg group-hover:text-white transition-colors leading-tight line-clamp-2">
                            {name}
                        </h3>
                        <div className="w-full h-0.5 bg-linear-to-r from-accent to-primary rounded-full shadow-[0_0_8px_var(--primary-container)]" />
                    </div>
                )}
            </div>

            {/* Status Badge (top-right corner) */}
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
