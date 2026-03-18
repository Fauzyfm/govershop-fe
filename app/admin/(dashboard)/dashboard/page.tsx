"use client";

import { useEffect, useState, useCallback } from "react";
import {
    CreditCard,
    Banknote,
    RefreshCw,
    Clock,
    TrendingUp,
    CheckCircle2,
    XCircle,
    ArrowUpRight,
    Wallet,
    Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/api";

// Animated counter hook
function useAnimatedNumber(target: number, duration = 1200) {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (target === 0) {
            setCurrent(0);
            return;
        }

        const startTime = Date.now();
        const startVal = 0;

        const tick = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCurrent(Math.round(startVal + (target - startVal) * eased));

            if (progress < 1) {
                requestAnimationFrame(tick);
            }
        };

        requestAnimationFrame(tick);
    }, [target, duration]);

    return current;
}

// Animated currency component
function AnimatedCurrency({ amount }: { amount: number }) {
    const animated = useAnimatedNumber(amount);
    return (
        <>{new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(animated)}</>
    );
}

// Animated integer count component
function AnimatedCount({ value }: { value: number }) {
    const animated = useAnimatedNumber(value, 800);
    return <>{animated.toLocaleString("id-ID")}</>;
}

// Dashboard Skeleton Loading
function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-56" />
            </div>

            {/* Stats skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="border-border/50 bg-card/80">
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-28" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-9 w-44 mb-2" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Order counts skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="border-border/50 bg-card/80">
                        <CardContent className="pt-6">
                            <Skeleton className="h-4 w-24 mb-4" />
                            <Skeleton className="h-10 w-20 mb-2" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Sync skeleton */}
            <Card className="border-border/50 bg-card/80">
                <CardContent className="pt-6">
                    <Skeleton className="h-4 w-32 mb-4" />
                    <Skeleton className="h-8 w-56 mb-2" />
                    <Skeleton className="h-3 w-44" />
                </CardContent>
            </Card>
        </div>
    );
}

export default function AdminDashboard() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchData = useCallback(async (showRefresh = false) => {
        if (showRefresh) setIsRefreshing(true);
        try {
            const response: any = await api.get("/admin/dashboard");
            setData(response.data);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        const pad = (n: number, w = 2) => n.toString().padStart(w, '0');
        return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
    };

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    if (!data) {
        return (
            <Card className="border-red-500/30 bg-red-500/5">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-3 text-red-400">
                        <XCircle className="w-5 h-5" />
                        <span>Gagal memuat data dashboard. Silakan refresh halaman.</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                        <Activity className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            Dashboard Overview
                        </h1>
                        <p className="text-sm text-white/50">Monitoring real-time bisnis Anda</p>
                    </div>
                </div>
                <button
                    onClick={() => fetchData(true)}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm font-medium disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* === Financial Stats Row === */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Saldo Digiflazz */}
                <Card className="group relative overflow-hidden border-blue-500/20 bg-linear-to-br from-blue-500/10 via-card to-card hover:border-blue-500/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500" />
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardDescription className="text-white/60 font-medium text-xs uppercase tracking-wider">
                                Saldo Digiflazz
                            </CardDescription>
                            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                                <Wallet className="w-4 h-4 text-blue-400" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-white tracking-tight mb-1">
                            <AnimatedCurrency amount={data.deposit || 0} />
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-blue-400/80">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                            Real-time dari Digiflazz
                        </div>
                    </CardContent>
                </Card>

                {/* Omzet Hari Ini */}
                <Card className="group relative overflow-hidden border-emerald-500/20 bg-linear-to-br from-emerald-500/10 via-card to-card hover:border-emerald-500/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500" />
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardDescription className="text-white/60 font-medium text-xs uppercase tracking-wider">
                                Omzet Hari Ini
                            </CardDescription>
                            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                                <TrendingUp className="w-4 h-4 text-emerald-400" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-white tracking-tight mb-1">
                            <AnimatedCurrency amount={data.today_revenue || 0} />
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400/80">
                            <ArrowUpRight className="w-3 h-3" />
                            {data.today_orders || 0} order sukses hari ini
                        </div>
                    </CardContent>
                </Card>

                {/* Total Revenue */}
                <Card className="group relative overflow-hidden border-amber-500/20 bg-linear-to-br from-amber-500/10 via-card to-card hover:border-amber-500/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500" />
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardDescription className="text-white/60 font-medium text-xs uppercase tracking-wider">
                                Total Omzet
                            </CardDescription>
                            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
                                <Banknote className="w-4 h-4 text-amber-400" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-white tracking-tight mb-1">
                            <AnimatedCurrency amount={data.total_revenue || 0} />
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-amber-400/80">
                            <Banknote className="w-3 h-3" />
                            Semua waktu
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* === Order Status Row === */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Order Sukses */}
                <Card className="group border-emerald-500/15 hover:border-emerald-500/30 transition-all duration-300 bg-card/90 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span className="text-white/60 text-sm font-medium">Order Sukses</span>
                            </div>
                            <Badge variant="success">Berhasil</Badge>
                        </div>
                        <p className="text-4xl font-bold text-white mb-2 tracking-tight">
                            <AnimatedCount value={data.order_counts?.success || 0} />
                        </p>
                        <Separator className="bg-emerald-500/10 mb-3" />
                        <p className="text-xs text-white/40">Total transaksi berhasil</p>
                    </CardContent>
                </Card>

                {/* Order Pending */}
                <Card className="group border-yellow-500/15 hover:border-yellow-500/30 transition-all duration-300 bg-card/90 hover:shadow-[0_0_20px_rgba(234,179,8,0.1)]">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-yellow-400" />
                                <span className="text-white/60 text-sm font-medium">Order Pending</span>
                            </div>
                            <Badge variant="warning">Menunggu</Badge>
                        </div>
                        <p className="text-4xl font-bold text-white mb-2 tracking-tight">
                            <AnimatedCount value={data.order_counts?.pending || 0} />
                        </p>
                        <Separator className="bg-yellow-500/10 mb-3" />
                        <p className="text-xs text-white/40">Menunggu pembayaran</p>
                    </CardContent>
                </Card>

                {/* Order Gagal */}
                <Card className="group border-red-500/15 hover:border-red-500/30 transition-all duration-300 bg-card/90 hover:shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <XCircle className="w-4 h-4 text-red-400" />
                                <span className="text-white/60 text-sm font-medium">Order Gagal</span>
                            </div>
                            <Badge variant="destructive">Gagal</Badge>
                        </div>
                        <p className="text-4xl font-bold text-white mb-2 tracking-tight">
                            <AnimatedCount value={data.order_counts?.failed || 0} />
                        </p>
                        <Separator className="bg-red-500/10 mb-3" />
                        <p className="text-xs text-white/40">Transaksi gagal / dibatalkan</p>
                    </CardContent>
                </Card>
            </div>

            {/* === Last Sync Section === */}
            <Card className="border-primary/15 bg-linear-to-r from-primary/5 via-card to-card overflow-hidden">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                                    <RefreshCw className="w-4 h-4 text-primary animate-[spin_8s_linear_infinite]" />
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold text-sm">Sinkronisasi Terakhir</h3>
                                    <p className="text-xs text-white/40">Sinkronisasi otomatis produk Digiflazz</p>
                                </div>
                            </div>

                            <div className="pl-1">
                                <p className="text-xl font-bold text-white font-mono tracking-tight">
                                    {formatDate(data.last_sync?.completed_at)}
                                </p>
                                <p className="text-sm text-white/50 mt-1">
                                    {data.last_sync?.total_items || 0} produk diproses
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-black/30 px-3 py-4 rounded-xl border border-emerald-500/15 text-center hover:border-emerald-500/30 transition-colors">
                                <span className="text-emerald-400 text-[10px] uppercase tracking-widest block mb-1.5 font-semibold">Updated</span>
                                <span className="text-white text-2xl font-bold">
                                    <AnimatedCount value={data.last_sync?.updated_count || 0} />
                                </span>
                            </div>
                            <div className="bg-black/30 px-3 py-4 rounded-xl border border-red-500/15 text-center hover:border-red-500/30 transition-colors">
                                <span className="text-red-400 text-[10px] uppercase tracking-widest block mb-1.5 font-semibold">Failed</span>
                                <span className="text-white text-2xl font-bold">
                                    <AnimatedCount value={data.last_sync?.failed_count || 0} />
                                </span>
                            </div>
                            <div className="bg-black/30 px-3 py-4 rounded-xl border border-white/10 text-center hover:border-white/20 transition-colors">
                                <span className="text-white/50 text-[10px] uppercase tracking-widest block mb-1.5 font-semibold">Status</span>
                                <Badge variant="success" className="mt-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Active
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
