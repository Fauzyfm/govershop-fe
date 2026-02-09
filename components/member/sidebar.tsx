"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    ShoppingCart,
    LogOut,
    User,
    Settings,
    History,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    Package
} from "lucide-react";

interface MemberSidebarProps {
    isCollapsed: boolean;
    toggleSidebar: () => void;
}

export default function MemberSidebar({ isCollapsed, toggleSidebar }: MemberSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const [balance, setBalance] = useState<number | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/member/profile`, {
                    credentials: "include",
                });
                const json = await res.json();
                if (json.success && json.data) {
                    setBalance(json.data.balance);
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            }
        };
        fetchProfile();
    }, []);

    const handleLogout = async () => {
        if (confirm("Apakah Anda yakin ingin logout?")) {
            // Clear cookies
            document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
            document.cookie = "member_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
            // Clear localStorage
            localStorage.removeItem("user_role");
            // Redirect to unified login
            router.push("/auth/login");
        }
    };

    const isActive = (path: string) => {
        return pathname === path || pathname.startsWith(`${path}/`);
    };

    const menuItems = [
        {
            title: "Main",
            items: [
                {
                    label: "Dashboard",
                    icon: LayoutDashboard,
                    href: "/member/dashboard",
                },
                {
                    label: "Order Product",
                    icon: Package,
                    href: "/member/products",
                },
                {
                    label: "Pesanan Saya",
                    icon: ShoppingCart,
                    href: "/member/orders",
                },
                {
                    label: "Riwayat Transaksi",
                    icon: History,
                    href: "/member/history",
                },
            ]
        },
        {
            title: "Akun",
            items: [
                {
                    label: "Pengaturan",
                    icon: Settings,
                    href: "/member/settings",
                },
                {
                    label: "Profil",
                    icon: User,
                    href: "/member/profile",
                },
            ]
        }
    ];

    return (
        <aside
            className={`glass-card border-r border-white/10 h-screen flex flex-col transition-all duration-300 shrink-0 relative overflow-visible ${isCollapsed ? "w-20" : "w-64"}`}
        >
            {/* Collapse Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="absolute -right-3 top-8 z-50 bg-[#3D0D07] hover:bg-[#5C120B] rounded-full p-1.5 border border-[#740A03] text-white/70 hover:text-white transition-colors shadow-lg shadow-black/50"
            >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            <div className="p-6 border-b border-white/10 flex flex-col items-center justify-center relative overflow-hidden shrink-0 gap-4">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-(--primary)/50 blur-[20px]" />

                <div className="flex items-center gap-2 z-10">
                    {!isCollapsed ? (
                        <h1 className="text-xl font-bold text-white flex items-center gap-2 whitespace-nowrap">
                            <CreditCard className="w-6 h-6 text-(--primary)" />
                            <span className="bg-linear-to-r from-white to-white/70 bg-clip-text text-transparent">Govershop</span>
                            <span className="text-(--primary) neon-glow">Member</span>
                        </h1>
                    ) : (
                        <CreditCard className="w-8 h-8 text-(--primary)" />
                    )}
                </div>

                {!isCollapsed && balance !== null && (
                    <div className="w-full bg-black/20 rounded-xl p-3 border border-white/5 relative group overflow-hidden">
                        <div className="absolute inset-0 bg-(--primary)/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Saldo Anda</p>
                        <p className="text-lg font-bold text-white font-mono">
                            Rp {balance.toLocaleString("id-ID")}
                        </p>
                    </div>
                )}
            </div>

            <nav className="flex-1 p-4 space-y-6 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-[var(--primary)]/20 scrollbar-track-transparent">
                {menuItems.map((group, groupIndex) => (
                    <div key={groupIndex}>
                        {!isCollapsed && (
                            <h3 className="text-[10px] uppercase font-bold text-white/30 mb-2 px-2 tracking-wider">
                                {group.title}
                            </h3>
                        )}
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${active
                                            ? "bg-(--primary)/20 text-white shadow-[0_0_15px_rgba(195,17,12,0.3)] border border-(--primary)/30"
                                            : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                                            }`}
                                        title={isCollapsed ? item.label : ""}
                                    >
                                        {active && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-(--primary) shadow-[0_0_10px_var(--primary)] rounded-r-full" />
                                        )}

                                        <item.icon
                                            className={`w-5 h-5 shrink-0 transition-transform duration-300 ${active ? "text-(--primary) scale-110" : "group-hover:text-white"
                                                }`}
                                        />

                                        {!isCollapsed && (
                                            <span className={`font-medium text-sm truncate transition-all duration-300 ${active ? "translate-x-1" : "group-hover:translate-x-1"
                                                }`}>
                                                {item.label}
                                            </span>
                                        )}

                                        {/* Hover Glow Effect */}
                                        <div className="absolute inset-0 bg-(--primary)/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="p-4 border-t border-white/10 shrink-0">
                <button
                    onClick={handleLogout}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all group border border-transparent hover:border-red-500/20 ${isCollapsed ? "justify-center" : ""}`}
                    title={isCollapsed ? "Logout" : ""}
                >
                    <LogOut className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
                    {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
                </button>
            </div>
        </aside>
    );
}
