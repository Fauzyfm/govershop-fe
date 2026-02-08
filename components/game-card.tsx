"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageLoading from "@/components/ui/page-loading";

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

    const handleClick = (e: React.MouseEvent) => {
        if (isDisabled) return;
        e.preventDefault();
        setIsLoading(true);
        router.push(href);
    };

    const Content = (
        <div className={`
            group relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-slate-900 border border-white/5 shadow-2xl transition-all duration-500
            ${isDisabled ? "grayscale opacity-80 cursor-not-allowed" : "hover:border-primary/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:-translate-y-1"}
        `}>
            {/* Image */}
            <div className="absolute inset-0">
                <img
                    src={image}
                    alt={name}
                    className={`w-full h-full object-cover transition-transform duration-700 ${isDisabled ? "" : "group-hover:scale-110"}`}
                    loading="lazy"
                />

                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 ${isDisabled ? "opacity-90" : "group-hover:opacity-90 transition-opacity"}`} />
            </div>

            {/* Content */}
            <div className="absolute inset-x-0 bottom-0 p-4 transform transition-all duration-300">
                <h3 className="text-white font-bold text-lg md:text-xl truncate drop-shadow-md">
                    {name}
                </h3>

                {isDisabled ? (
                    <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
                        <span className="text-xs font-medium text-white/80">
                            {isComingSoon ? "Segera Hadir" : "Maintenance"}
                        </span>
                    </div>
                ) : (
                    <div className="w-8 h-1 bg-gradient-to-r from-primary to-emerald-400 mt-2 rounded-full transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                )}
            </div>

            {/* Glow effect on hover (only active) */}
            {!isDisabled && (
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 group-hover:ring-primary/50 transition-all pointer-events-none" />
            )}

            {/* Status Overlay for visual clarity */}
            {isComingSoon && (
                <div className="absolute top-3 right-3 px-3 py-1 bg-amber-500/90 backdrop-blur-md text-black text-xs font-bold rounded-full shadow-lg">
                    COMING SOON
                </div>
            )}
            {isMaintenance && (
                <div className="absolute top-3 right-3 px-3 py-1 bg-red-500/90 backdrop-blur-md text-white text-xs font-bold rounded-full shadow-lg">
                    MAINTENANCE
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
            <Link href={href} onClick={handleClick} className="block">
                {Content}
            </Link>
        </>
    );
}
