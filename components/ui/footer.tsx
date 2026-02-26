import Link from "next/link";
import Image from "next/image";


export default function Footer() {
    return (
        <footer className="border-t border-primary/20 bg-background/80 backdrop-blur-sm py-12 relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-linear-to-t from-primary/10 to-transparent pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    {/* Logo & Description */}
                    <div className="text-center md:text-left">
                        <Link href="/" className="inline-block mb-3" aria-label="Restopup Beranda">
                            <div className="relative h-12 w-40 mx-auto md:mx-0">
                                <Image
                                    src="/Banner/logo-restopup-v2.png"
                                    alt="Restopup"
                                    fill
                                    className="object-contain object-left"
                                />
                            </div>
                        </Link>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            Platform Top Up Game Terpercaya dengan proses kilat dan harga termurah.
                        </p>
                    </div>

                    {/* Navigasi */}
                    <nav aria-label="Navigasi utama footer">
                        <h3 className="text-sm font-bold text-foreground mb-4">Navigasi</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                                    Beranda Top Up Game
                                </Link>
                            </li>
                            <li>
                                <Link href="/track" className="text-muted-foreground hover:text-primary transition-colors">
                                    Lacak Pesanan Top Up
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    {/* Bantuan */}
                    <nav aria-label="Tautan bantuan footer">
                        <h3 className="text-sm font-bold text-foreground mb-4">Bantuan</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/terms-conditions" className="text-muted-foreground hover:text-primary transition-colors">
                                    Syarat &amp; Ketentuan Restopup
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">
                                    Kebijakan Privasi
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>

                {/* Copyright */}
                <div className="mt-10 pt-6 border-t border-white/5 text-center flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground/60">
                    <p>&copy; {new Date().getFullYear()} Restopup. All rights reserved.</p>
                    <p>Platform Top Up Game #1 di Indonesia</p>
                </div>
            </div>
        </footer>
    );
}

