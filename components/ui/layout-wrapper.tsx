"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith("/admin");

    return (
        <div className="min-h-screen flex flex-col antialiased">
            {!isAdmin && <Navbar />}
            <main className={`flex-1 ${!isAdmin ? "container mx-auto px-4 md:px-8 lg:px-12 py-8" : ""}`}>
                {children}
            </main>
            {!isAdmin && <Footer />}
        </div>
    );
}
