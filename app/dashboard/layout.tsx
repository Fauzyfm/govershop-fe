"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Wallet } from "lucide-react";
import MemberSidebar from "@/components/member/sidebar";
import api from "@/lib/api";

export default function MemberLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }

            try {
                // Verify token and get user profile
                // Assuming GET /api/user/profile exists, if not we rely on localStorage or just token presence
                // For now, let's just check token presence and minimal profile
                const storedUser = localStorage.getItem("user");
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
                setIsAuthenticated(true);
            } catch (error) {
                console.error("Auth check failed", error);
                localStorage.removeItem("token");
                router.push("/login");
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    // Close mobile sidebar on route change
    useEffect(() => {
        setIsMobileSidebarOpen(false);
    }, [router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#280905] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <div className="text-white/70">Loading Dashboard...</div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="flex bg-[#280905] min-h-screen overflow-hidden relative font-sans text-white">
            {/* Desktop Sidebar */}
            <div className={`hidden md:block h-full transition-all duration-300 ${isSidebarCollapsed ? "w-20" : "w-64"}`}>
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
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}

            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Header */}
                <header className="h-16 border-b border-white/10 glass-card flex items-center justify-between px-4 md:px-8 shrink-0 z-20">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileSidebarOpen(true)}
                            className="md:hidden p-2 -ml-2 text-white/70 hover:text-white transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="text-lg font-bold text-white hidden md:block">
                            Dashboard
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Balance Display */}
                        <div className="flex items-center gap-3 px-4 py-1.5 bg-black/20 border border-white/10 rounded-full">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <Wallet className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Saldo</span>
                                <span className="text-sm font-bold text-white">
                                    Rp {user?.balance?.toLocaleString() || "0"}
                                </span>
                            </div>
                        </div>

                        {/* User Profile */}
                        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                            <div className="text-right hidden sm:block">
                                <div className="text-sm font-medium text-white">{user?.username || "Member"}</div>
                                <div className="text-xs text-white/50">{user?.email || "member@govershop.com"}</div>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-linear-to-br from-primary to-rose-600 border border-white/20 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_10px_var(--primary)]">
                                {user?.username?.charAt(0).toUpperCase() || "M"}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
