"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";


export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 w-full glass border-b border-primary/20 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight group">
                    <div className="relative h-10 w-32"> {/* Adjust width as needed based on aspect ratio */}
                        <Image
                            src="/Banner/logo-govershop.png"
                            alt="Govershop Logo"
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </div>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:shadow-[0_0_10px_rgba(195,17,12,0.5)]">
                        Beranda
                    </Link>
                    <Link href="/track" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:shadow-[0_0_10px_rgba(195,17,12,0.5)]">
                        Lacak Pesanan
                    </Link>
                    <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:shadow-[0_0_10px_rgba(195,17,12,0.5)]">
                        Tentang Kami
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden p-2 text-foreground hover:bg-white/5 rounded-lg transition-colors"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X className="w-6 h-6 text-primary" /> : <Menu className="w-6 h-6 text-primary" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full glass border-b border-primary/20 p-4 flex flex-col gap-4 animate-in slide-in-from-top-2 z-50">
                    <Link href="/" onClick={() => setIsOpen(false)} className="text-sm font-medium text-foreground hover:text-primary py-2 border-b border-white/5">
                        Beranda
                    </Link>
                    <Link href="/track" onClick={() => setIsOpen(false)} className="text-sm font-medium text-foreground hover:text-primary py-2 border-b border-white/5">
                        Lacak Pesanan
                    </Link>
                    <Link href="/about" onClick={() => setIsOpen(false)} className="text-sm font-medium text-foreground hover:text-primary py-2">
                        Tentang Kami
                    </Link>
                </div>
            )}
        </nav>
    );
}
