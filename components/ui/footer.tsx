import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t border-primary/20 bg-background/80 backdrop-blur-sm py-12 relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-linear-to-t from-primary/10 to-transparent pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* Logo & Description */}
                    <div className="text-center md:text-left">
                        <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-foreground mb-3 neon-glow hover:text-primary transition-colors">
                            GOVERSHOP
                        </Link>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            Platform Top Up Game Terpercaya dengan proses kilat dan harga termurah.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="flex gap-8 text-sm font-medium">
                        <Link href="/" className="text-muted-foreground hover:text-primary transition-colors hover:shadow-[0_0_8px_rgba(195,17,12,0.4)]">
                            Beranda
                        </Link>
                        <Link href="/track" className="text-muted-foreground hover:text-primary transition-colors hover:shadow-[0_0_8px_rgba(195,17,12,0.4)]">
                            Lacak Pesanan
                        </Link>
                        <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors hover:shadow-[0_0_8px_rgba(195,17,12,0.4)]">
                            Terms & Conditions
                        </Link>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-10 pt-6 border-t border-white/5 text-center flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground/60">
                    <p>&copy; {new Date().getFullYear()} Govershop. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
