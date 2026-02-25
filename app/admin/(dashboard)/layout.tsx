"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import AdminSidebar from "@/components/admin/sidebar";

export default function AdminLayout({
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
        // Check if user has admin role stored (set during login)
        // Token is now stored in HTTP-only cookie, not accessible via JS
        const userRole = localStorage.getItem("user_role");
        if (!userRole || userRole !== "admin") {
            router.push("/admin/login");
        } else {
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, [router]);

    // Close mobile sidebar on route change
    useEffect(() => {
        setIsMobileSidebarOpen(false);
    }, [router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-white">Loading...</div>
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
                <AdminSidebar
                    isCollapsed={isSidebarCollapsed}
                    toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />
            </div>

            {/* Mobile Sidebar (Fixed Overlay) */}
            <div className={`fixed inset-y-0 left-0 z-50 transform ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 md:hidden`}>
                <AdminSidebar
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
                    <span className="font-bold text-white ml-2 text-lg">Restopup Admin</span>
                </div>

                {children}
            </main>
        </div>
    );
}
