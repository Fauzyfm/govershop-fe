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
            <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Digiflazz Deposit */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-400 text-sm font-medium">Saldo Digiflazz</h3>
                        <CreditCard className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold text-white mb-1">
                        {formatCurrency(data.deposit || 0)}
                    </p>
                    <p className="text-xs text-slate-500">Real-time dari Digiflazz</p>
                </div>

                {/* Today's Revenue */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-400 text-sm font-medium">Omzet Hari Ini</h3>
                        <Banknote className="w-5 h-5 text-emerald-500" />
                    </div>
                    <p className="text-2xl font-bold text-white mb-1">
                        {formatCurrency(data.today_revenue || 0)}
                    </p>
                    <p className="text-xs text-slate-500">{data.today_orders || 0} order sukses hari ini</p>
                </div>

                {/* Total Revenue */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-400 text-sm font-medium">Total Omzet</h3>
                        <Banknote className="w-5 h-5 text-indigo-500" />
                    </div>
                    <p className="text-2xl font-bold text-white mb-1">
                        {formatCurrency(data.total_revenue || 0)}
                    </p>
                    <p className="text-xs text-slate-500">Semua waktu</p>
                </div>

                {/* Order Success */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-400 text-sm font-medium">Order Sukses</h3>
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-white mb-1">
                        {data.order_counts?.success || 0}
                    </p>
                    <p className="text-xs text-slate-500">Total transaksi berhasil</p>
                </div>

                {/* Order Pending */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-400 text-sm font-medium">Order Pending</h3>
                        <Clock className="w-5 h-5 text-yellow-500" />
                    </div>
                    <p className="text-2xl font-bold text-white mb-1">
                        {data.order_counts?.pending || 0}
                    </p>
                    <p className="text-xs text-slate-500">Menunggu pembayaran</p>
                </div>

                {/* Order Failed */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-400 text-sm font-medium">Order Gagal</h3>
                        <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-white mb-1">
                        {data.order_counts?.failed || 0}
                    </p>
                    <p className="text-xs text-slate-500">Transaksi gagal / cancelled</p>
                </div>

                {/* Last Sync */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl md:col-span-2 lg:col-span-3">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-400 text-sm font-medium">Sync Terakhir</h3>
                        <RefreshCw className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <p className="text-lg font-bold text-white mb-1">
                                {data.last_sync?.completed_at
                                    ? new Date(data.last_sync.completed_at).toLocaleString()
                                    : "-"}
                            </p>
                            <p className="text-xs text-slate-500">
                                {data.last_sync?.total_items || 0} produk
                            </p>
                        </div>
                        <div className="flex gap-4 text-xs font-mono">
                            <div className="bg-slate-950 px-3 py-2 rounded">
                                <span className="text-emerald-500 block">Updated</span>
                                <span className="text-white text-lg">{data.last_sync?.updated_count || 0}</span>
                            </div>
                            <div className="bg-slate-950 px-3 py-2 rounded">
                                <span className="text-red-500 block">Failed</span>
                                <span className="text-white text-lg">{data.last_sync?.failed_count || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
