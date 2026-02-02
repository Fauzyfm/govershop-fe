"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    LogOut,
    CreditCard,
    ChevronLeft,
    ChevronRight,
    Image
} from "lucide-react";

interface AdminSidebarProps {
    isCollapsed: boolean;
    toggleSidebar: () => void;
}

export default function AdminSidebar({ isCollapsed, toggleSidebar }: AdminSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        if (confirm("Apakah Anda yakin ingin logout?")) {
            localStorage.removeItem("admin_token");
            router.push("/admin/login");
        }
    };

    const isActive = (path: string) => {
        return pathname === path || pathname.startsWith(`${path}/`);
    };

    const menuItems = [
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            href: "/admin/dashboard",
        },
        {
            label: "Products",
            icon: Package,
            href: "/admin/products",
        },
        {
            label: "Orders",
            icon: ShoppingCart,
            href: "/admin/orders",
        },
        {
            label: "Kelola Content",
            icon: Image,
            href: "/admin/content",
        },
    ];

    return (
        <aside
            className={`bg-slate-900 border-r border-slate-800 h-screen flex flex-col transition-all duration-300 shrink-0 relative overflow-visible ${isCollapsed ? "w-20" : "w-64"}`}
        >
            {/* Collapse Toggle Button - Always Visible */}
            <button
                onClick={toggleSidebar}
                className="absolute -right-3 top-8 z-50 bg-slate-800 hover:bg-slate-700 rounded-full p-1.5 border border-slate-700 text-slate-400 hover:text-white transition-colors shadow-lg"
            >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            <div className="p-6 border-b border-slate-800 flex items-center justify-center">
                {!isCollapsed ? (
                    <h1 className="text-xl font-bold text-white flex items-center gap-2 whitespace-nowrap">
                        <CreditCard className="w-6 h-6 text-blue-500" />
                        Govershop<span className="text-blue-500">Admin</span>
                    </h1>
                ) : (
                    <CreditCard className="w-8 h-8 text-blue-500" />
                )}
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
                {menuItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors overflow-hidden whitespace-nowrap ${isActive(item.href)
                            ? "bg-blue-600 text-white"
                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            }`}
                        title={isCollapsed ? item.label : ""}
                    >
                        <item.icon className="w-5 h-5 min-w-[20px]" />
                        <span className={`font-medium transition-opacity duration-200 ${isCollapsed ? "opacity-0 w-0" : "opacity-100"}`}>
                            {item.label}
                        </span>
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors overflow-hidden whitespace-nowrap"
                    title={isCollapsed ? "Logout" : ""}
                >
                    <LogOut className="w-5 h-5 min-w-[20px]" />
                    <span className={`font-medium transition-opacity duration-200 ${isCollapsed ? "opacity-0 w-0" : "opacity-100"}`}>
                        Logout
                    </span>
                </button>
            </div>
        </aside>
    );
}
