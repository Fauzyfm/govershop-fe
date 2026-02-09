"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname?.startsWith("/admin/login") || pathname?.startsWith("/member/login") || pathname?.startsWith("/member/forgot-password") || pathname?.startsWith("/member/reset-password");
    const isMemberDashboard = pathname?.startsWith("/member/dashboard") || pathname?.startsWith("/member/orders") || pathname?.startsWith("/member/history") || pathname?.startsWith("/member/settings") || pathname?.startsWith("/member/profile") || pathname?.startsWith("/member/products") || pathname?.startsWith("/member/topup");
    const isDashboard = pathname?.startsWith("/admin") || isMemberDashboard;

    // Don't show public layout (Navbar, Footer, 3D BG) for auth pages or dashboards
    if (isDashboard || isAuthPage) {
        return <div className="min-h-screen flex flex-col antialiased">{children}</div>;
    }

    return (
        <div className="min-h-screen flex flex-col antialiased relative">
            {/* 3D Retro Grid Background - Only for Public Pages */}
            <div className="retro-grid-container">
                <div className="retro-grid" />
                <div className="horizon-glow" />
                <div className="particles" />
            </div>

            <Navbar />
            <main className="flex-1 container mx-auto px-4 md:px-8 lg:px-12 py-8 relative z-10">
                {children}
            </main>
            <Footer />
        </div>
    );
}
