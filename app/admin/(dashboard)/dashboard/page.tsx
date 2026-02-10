"use client";

import { useEffect, useState } from "react";
import {
    CreditCard,
    ShoppingCart,
    Banknote,
    RefreshCw,
    Clock
} from "lucide-react";
import api from "@/lib/api";

export default function AdminDashboard() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        try {
            const response: any = await api.get("/admin/dashboard");
            setData(response.data);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (isLoading) {
        return <div className="text-white">Loading dashboard...</div>;
    }

    if (!data) {
        return <div className="text-red-400">Gagal memuat data dashboard</div>;
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_10px_var(--primary)]" />
                Dashboard Overview
            </h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Digiflazz Deposit */}
                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CreditCard className="w-24 h-24 text-primary transform rotate-12 translate-x-8 -translate-y-8" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white/70 text-sm font-medium">Saldo Digiflazz</h3>
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <CreditCard className="w-5 h-5 text-blue-400" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-white mb-1 tracking-tight">
                            {formatCurrency(data.deposit || 0)}
                        </p>
                        <p className="text-xs text-white/50">Real-time dari Digiflazz</p>
                    </div>
                </div>

                {/* Today's Revenue */}
                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Banknote className="w-24 h-24 text-emerald-500 transform rotate-12 translate-x-8 -translate-y-8" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white/70 text-sm font-medium">Omzet Hari Ini</h3>
                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                <Banknote className="w-5 h-5 text-emerald-400" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-white mb-1 tracking-tight">
                            {formatCurrency(data.today_revenue || 0)}
                        </p>
                        <p className="text-xs text-white/50">{data.today_orders || 0} order sukses hari ini</p>
                    </div>
                </div>

                {/* Total Revenue */}
                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Banknote className="w-24 h-24 text-primary transform rotate-12 translate-x-8 -translate-y-8" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white/70 text-sm font-medium">Total Omzet</h3>
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Banknote className="w-5 h-5 text-primary" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-white mb-1 tracking-tight">
                            {formatCurrency(data.total_revenue || 0)}
                        </p>
                        <p className="text-xs text-white/50">Semua waktu</p>
                    </div>
                </div>

                {/* Order Success */}
                <div className="glass-card p-6 rounded-2xl border-l-4 border-l-emerald-500">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white/70 text-sm font-medium">Order Sukses</h3>
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">
                        {data.order_counts?.success || 0}
                    </p>
                    <p className="text-xs text-white/50">Total transaksi berhasil</p>
                </div>

                {/* Order Pending */}
                <div className="glass-card p-6 rounded-2xl border-l-4 border-l-yellow-500">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white/70 text-sm font-medium">Order Pending</h3>
                        <div className="p-2 bg-yellow-500/10 rounded-lg">
                            <Clock className="w-5 h-5 text-yellow-500" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">
                        {data.order_counts?.pending || 0}
                    </p>
                    <p className="text-xs text-white/50">Menunggu pembayaran</p>
                </div>

                {/* Order Failed */}
                <div className="glass-card p-6 rounded-2xl border-l-4 border-l-red-500">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white/70 text-sm font-medium">Order Gagal</h3>
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <div className="w-5 h-5 rounded-full border-2 border-red-500 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-red-500">X</span>
                            </div>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">
                        {data.order_counts?.failed || 0}
                    </p>
                    <p className="text-xs text-white/50">Transaksi gagal / cancelled</p>
                </div>

                {/* Last Sync */}
                <div className="glass-card p-6 rounded-2xl md:col-span-2 lg:col-span-3 bg-linear-to-r from-primary/5 to-transparent">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white/70 text-sm font-medium flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 text-primary animate-spin-slow" />
                            Sync Terakhir
                        </h3>
                        <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-white/50 border border-white/10">
                            Auto-sync active
                        </span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <p className="text-2xl font-bold text-white mb-1 font-mono">
                                {data.last_sync?.completed_at
                                    ? new Date(new Date(data.last_sync.completed_at).getTime() - 7 * 60 * 60 * 1000).toLocaleString('id-ID', { timeZone: 'UTC' })
                                    : "-"}
                            </p>
                            <p className="text-sm text-white/50">
                                {data.last_sync?.total_items || 0} produk diproses
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-black/40 px-4 py-3 rounded-xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                <span className="text-emerald-400 text-xs uppercase tracking-wider block mb-1">Updated</span>
                                <span className="text-white text-xl font-bold">{data.last_sync?.updated_count || 0}</span>
                            </div>
                            <div className="bg-black/40 px-4 py-3 rounded-xl border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                                <span className="text-red-400 text-xs uppercase tracking-wider block mb-1">Failed</span>
                                <span className="text-white text-xl font-bold">{data.last_sync?.failed_count || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
