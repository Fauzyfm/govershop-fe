import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface GameCardProps {
    name: string;
    image?: string;
    href: string;
}

export default function GameCard({ name, image, href }: GameCardProps) {
    // Generate a placeholder color based on name length for visual variety if no image
    const placeholderHue = (name.length * 20) % 360;

    return (
        <Link
            href={href}
            className="group relative overflow-hidden rounded-xl glass-card transition-all duration-300 hover:scale-[1.02] hover:bg-secondary/60 hover:border-primary/50"
        >
            <div className="aspect-[4/5] w-full relative bg-secondary/50 flex items-center justify-center overflow-hidden">
                {image ? (
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div
                        className="w-full h-full flex items-center justify-center text-4xl font-bold text-white/10 select-none group-hover:text-white/20 transition-colors"
                        style={{ background: `linear-gradient(45deg, hsl(${placeholderHue}, 50%, 10%), hsl(${placeholderHue}, 50%, 20%))` }}
                    >
                        {name.substring(0, 2).toUpperCase()}
                    </div>
                )}

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors truncate">
                        {name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity delay-75 mt-1">
                        <span>Top Up Sekarang</span>
                        <ArrowRight className="w-3 h-3" />
                    </div>
                </div>
            </div>
        </Link>
    );
}
