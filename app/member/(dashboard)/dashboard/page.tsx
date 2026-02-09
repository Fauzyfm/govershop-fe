"use client";

import { useState, useEffect, useCallback } from "react";
import { CreditCard, Package, Clock, TrendingUp, CheckCircle, ShoppingCart } from "lucide-react";
import Link from "next/link";

interface DashboardData {
    balance: number;
    total_orders: number;
    success_orders: number;
    pending_orders: number;
    today_orders: number;
}

interface Order {
    id: string;
    ref_id: string;
    product_name: string;
    customer_no: string;
    member_price: number;
    status: string;
    created_at: string;
}

export default function MemberDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDashboard = useCallback(async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/member/dashboard`, {
                credentials: "include",
            });
            const json = await res.json();
            if (json.success && json.data) {
                setData(json.data);
            }
        } catch (error) {
            console.error("Error fetching dashboard:", error);
        }
    }, []);

    const fetchRecentOrders = useCallback(async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/member/orders?limit=5`, {
                credentials: "include",
            });
            const json = await res.json();
            if (json.success && json.orders) {
                setRecentOrders(json.orders);
            }
        } catch (error) {
            console.error("Error fetching recent orders:", error);
        }
    }, []);

    useEffect(() => {
        Promise.all([fetchDashboard(), fetchRecentOrders()]).finally(() => setIsLoading(false));
    }, [fetchDashboard, fetchRecentOrders]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <div className="w-8 h-8 border-2 border-(--primary) border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white mb-6">Dashboard Member</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Saldo */}
                <div className="glass-card p-6 rounded-xl border border-white/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CreditCard className="w-16 h-16 text-(--primary)" />
                    </div>
                    <div>
                        <p className="text-(--muted-foreground) text-sm font-medium mb-1">Saldo Anda</p>
                        <h3 className="text-2xl font-bold text-white">
                            Rp {(data?.balance || 0).toLocaleString("id-ID")}
                        </h3>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-(--accent)">
                        <TrendingUp className="w-3 h-3" />
                        <span>Hubungi admin untuk top up</span>
                    </div>
                </div>

                {/* Total Pesanan */}
                <div className="glass-card p-6 rounded-xl border border-white/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Package className="w-16 h-16 text-(--primary)" />
                    </div>
                    <div>
                        <p className="text-(--muted-foreground) text-sm font-medium mb-1">Total Pesanan</p>
                        <h3 className="text-2xl font-bold text-white">{data?.total_orders || 0}</h3>
                    </div>
                    <div className="mt-4 text-xs text-slate-400">
                        {data?.success_orders || 0} sukses
                    </div>
                </div>

                {/* Pesanan Pending */}
                <div className="glass-card p-6 rounded-xl border border-white/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Clock className="w-16 h-16 text-(--primary)" />
                    </div>
                    <div>
                        <p className="text-(--muted-foreground) text-sm font-medium mb-1">Sedang Diproses</p>
                        <h3 className="text-2xl font-bold text-white">{data?.pending_orders || 0}</h3>
                    </div>
                </div>

                {/* Pesanan Hari Ini */}
                <div className="glass-card p-6 rounded-xl border border-white/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CheckCircle className="w-16 h-16 text-(--primary)" />
                    </div>
                    <div>
                        <p className="text-(--muted-foreground) text-sm font-medium mb-1">Pesanan Hari Ini</p>
                        <h3 className="text-2xl font-bold text-white">{data?.today_orders || 0}</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pesanan Terbaru */}
                <div className="glass-card p-6 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-(--accent)" />
                            Pesanan Terbaru
                        </h3>
                        <Link href="/member/orders" className="text-xs text-(--accent) hover:underline">
                            Lihat Semua
                        </Link>
                    </div>
                    {recentOrders.length === 0 ? (
                        <div className="text-center py-10 text-(--muted-foreground)">
                            <p>Belum ada pesanan.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between p-3 bg-(--card)/50 rounded-lg border border-white/5">
                                    <div>
                                        <p className="text-sm text-white font-medium">{order.product_name}</p>
                                        <p className="text-xs text-slate-400">{order.customer_no}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-(--accent) font-medium">
                                            Rp {(order.member_price || 0).toLocaleString("id-ID")}
                                        </p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === "success" ? "bg-green-500/20 text-green-400" :
                                            order.status === "processing" ? "bg-blue-500/20 text-blue-400" :
                                                order.status === "failed" ? "bg-red-500/20 text-red-400" :
                                                    "bg-yellow-500/20 text-yellow-400"
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="glass-card p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Aksi Cepat</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/member/orders" className="p-4 bg-(--card)/50 rounded-xl border border-white/5 hover:border-(--primary)/30 transition-all text-center group">
                            <ShoppingCart className="w-8 h-8 text-(--primary) mx-auto mb-2 group-hover:scale-110 transition-transform" />
                            <p className="text-sm text-white">Pesanan Saya</p>
                        </Link>
                        <Link href="/member/history" className="p-4 bg-(--card)/50 rounded-xl border border-white/5 hover:border-(--primary)/30 transition-all text-center group">
                            <CreditCard className="w-8 h-8 text-(--primary) mx-auto mb-2 group-hover:scale-110 transition-transform" />
                            <p className="text-sm text-white">Riwayat Saldo</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
