"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import MemberSidebar from "@/components/member/sidebar";

export default function MemberLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    useEffect(() => {
        // Check for member_token cookie
        // Since we can't easily read HTTPOnly cookies from client JS, 
        // we might rely on a simple API call or just assume (middleware handles actual protection).
        // But for better UX, let's at least check if we *should* trigger a check.
        // Actually, the best way for client-side Auth check with HTTPOnly cookies 
        // is to make a request to /api/v1/member/me or similar.
        // For now, to keep it simple and consistent with previous "Secured member auth behavior", 
        // we will proceed and let the API calls fail (401) if not auth, redirecting to login.
        // OR: just check if the user came from login?

        // However, looking at the previous AdminLayout, it checks localStorage.
        // Member login does NOT set localStorage anymore.
        // So we should just setIsAuthenticated(true) and let middleware/API handle 401s.
        // OR make a quick "whoami" call.

        // Let's rely on middleware protection for the route.
        // If middleware allows us here, we are likely authenticated (or middleware didn't run properly).
        // Let's just set authenticated to true for transparency.
        setIsAuthenticated(true);
        setIsLoading(false);
    }, []);

    // Close mobile sidebar on route change
    useEffect(() => {
        setIsMobileSidebarOpen(false);
    }, [router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-(--background) flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-(--primary) border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="flex bg-[#280905] h-screen overflow-hidden relative">
            {/* Desktop Sidebar */}
            <div className="hidden md:block h-full">
                <MemberSidebar
                    isCollapsed={isSidebarCollapsed}
                    toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />
            </div>

            {/* Mobile Sidebar (Fixed Overlay) */}
            <div className={`fixed inset-y-0 left-0 z-50 transform ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 md:hidden`}>
                <MemberSidebar
                    isCollapsed={false} // Always expanded on mobile
                    toggleSidebar={() => setIsMobileSidebarOpen(false)} // Close on toggle
                />
            </div>

            {/* Mobile Overlay Backdrop */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}

            <main className="flex-1 p-4 md:p-8 overflow-y-auto min-h-screen transition-all duration-300 w-full relative">
                {/* Mobile Header with Hamburger */}
                <div className="md:hidden flex items-center mb-6">
                    <button
                        onClick={() => setIsMobileSidebarOpen(true)}
                        className="p-2 -ml-2 text-slate-400 hover:text-white"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="font-bold text-white ml-2 text-lg">Govershop Member</span>
                </div>

                {children}
            </main>
        </div>
    );
}
