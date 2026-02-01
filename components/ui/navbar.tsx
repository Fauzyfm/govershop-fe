"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 w-full glass border-b border-white/5">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary tracking-tight">
                    <ShoppingBag className="w-6 h-6" />
                    <span>GOVERSHOP</span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Beranda</Link>
                    <Link href="/track" className="text-sm font-medium hover:text-primary transition-colors">Lacak Pesanan</Link>
                    <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">Tentang Kami</Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden p-2 text-foreground hover:bg-secondary/50 rounded-md"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-background border-b border-border p-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
                    <Link href="/" onClick={() => setIsOpen(false)} className="text-sm font-medium hover:text-primary">Beranda</Link>
                    <Link href="/track" onClick={() => setIsOpen(false)} className="text-sm font-medium hover:text-primary">Lacak Pesanan</Link>
                    <Link href="/about" onClick={() => setIsOpen(false)} className="text-sm font-medium hover:text-primary">Tentang Kami</Link>
                </div>
            )}
        </nav>
    );
}
