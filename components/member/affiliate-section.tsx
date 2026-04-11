"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Link2,
    Copy,
    Check,
    TrendingUp,
    Users,
    Wallet,
    BarChart3,
    Shield,
    Zap,
    Info,
    ToggleLeft,
    ToggleRight,
    ExternalLink,
} from "lucide-react";
import api from "@/lib/api";

interface AffiliateData {
    code: string;
    link: string;
    total_usages: number;
    link_usages: number;
    code_usages: number;
    total_commission: number;
    affiliate_balance: number;
    commission_percent: number;
    discount_enabled: boolean;
    discount_percent: number;
    min_discount_amount: number;
}

export default function AffiliateSection() {
    const [data, setData] = useState<AffiliateData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isNotAffiliate, setIsNotAffiliate] = useState(false);
    const [copied, setCopied] = useState<"link" | "code" | null>(null);
    const [showInfo, setShowInfo] = useState(false);

    const fetchAffiliate = useCallback(async () => {
        try {
            const json: any = await api.get("/member/affiliate");
            if (json.success && json.data) {
                setData(json.data);
            }
        } catch (err: any) {
            // 404 = not an affiliate, any other error = silently fail
            setIsNotAffiliate(true);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAffiliate();
    }, [fetchAffiliate]);

    const handleCopy = async (text: string, type: "link" | "code") => {
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            const input = document.createElement("input");
            input.value = text;
            document.body.appendChild(input);
            input.select();
            document.execCommand("copy");
            document.body.removeChild(input);
        }
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="glass-card rounded-xl border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-5 h-5 rounded bg-white/10 animate-pulse" />
                    <div className="w-32 h-4 rounded bg-white/10 animate-pulse" />
                </div>
                <div className="space-y-3">
                    <div className="w-full h-10 rounded-lg bg-white/5 animate-pulse" />
                    <div className="grid grid-cols-2 gap-3">
                        <div className="h-16 rounded-lg bg-white/5 animate-pulse" />
                        <div className="h-16 rounded-lg bg-white/5 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    // Not an affiliate — show CTA
    if (isNotAffiliate || !data) {
        return (
            <div className="glass-card rounded-xl border border-white/10 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-(--primary)/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                <div className="relative flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-(--primary)/10 flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5 text-(--primary)" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm mb-1">Affiliate Program</h3>
                        <p className="text-xs text-(--muted-foreground) leading-relaxed">
                            Dapatkan komisi dari setiap transaksi melalui link referral Anda. Hubungi admin untuk mendaftar.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Full affiliate dashboard
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Link2 className="w-7 h-7 text-(--accent)" />
                    Affiliate Program
                </h2>
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[10px] text-green-400 font-medium uppercase tracking-wider">Aktif</span>
                </div>
            </div>

            {/* Link & Code Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Referral Link */}
                <div className="glass-card rounded-xl border border-white/10 p-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-(--primary)/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:bg-(--primary)/10 transition-colors" />
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-2">
                            <Link2 className="w-4 h-4 text-(--primary)" />
                            <span className="text-xs font-semibold text-white">Link Referral</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 bg-black/30 rounded-lg px-3 py-2.5 border border-white/5 font-mono text-xs text-white/70 truncate">
                                {data.link}
                            </div>
                            <button
                                onClick={() => handleCopy(data.link, "link")}
                                className={`p-2.5 rounded-lg border transition-all duration-300 shrink-0 ${
                                    copied === "link"
                                        ? "bg-green-500/20 border-green-500/30 text-green-400"
                                        : "bg-(--primary)/10 border-(--primary)/20 text-(--primary) hover:bg-(--primary)/20"
                                }`}
                                title="Copy link"
                            >
                                {copied === "link" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Referral Code */}
                <div className="glass-card rounded-xl border border-white/10 p-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-(--accent)/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:bg-(--accent)/10 transition-colors" />
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4 text-(--accent)" />
                            <span className="text-xs font-semibold text-white">Kode Referral</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 bg-black/30 rounded-lg px-3 py-2.5 border border-white/5 text-center">
                                <span className="font-mono text-base font-bold text-white tracking-[0.25em]">{data.code}</span>
                            </div>
                            <button
                                onClick={() => handleCopy(data.code, "code")}
                                className={`p-2.5 rounded-lg border transition-all duration-300 shrink-0 ${
                                    copied === "code"
                                        ? "bg-green-500/20 border-green-500/30 text-green-400"
                                        : "bg-(--accent)/10 border-(--accent)/20 text-(--accent) hover:bg-(--accent)/20"
                                }`}
                                title="Copy kode"
                            >
                                {copied === "code" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Saldo Komisi */}
                <div className="glass-card rounded-xl border border-white/10 p-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Wallet className="w-10 h-10 text-(--primary)" />
                    </div>
                    <p className="text-(--muted-foreground) text-[10px] font-medium mb-0.5 uppercase tracking-wider">Saldo Komisi</p>
                    <h4 className="text-lg font-bold text-white">
                        Rp {data.affiliate_balance.toLocaleString("id-ID")}
                    </h4>
                </div>

                {/* Komisi Bulan Ini */}
                <div className="glass-card rounded-xl border border-white/10 p-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp className="w-10 h-10 text-green-400" />
                    </div>
                    <p className="text-(--muted-foreground) text-[10px] font-medium mb-0.5 uppercase tracking-wider">Komisi Bulan Ini</p>
                    <h4 className="text-lg font-bold text-green-400">
                        Rp {data.total_commission.toLocaleString("id-ID")}
                    </h4>
                </div>

                {/* Total Transaksi */}
                <div className="glass-card rounded-xl border border-white/10 p-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <BarChart3 className="w-10 h-10 text-blue-400" />
                    </div>
                    <p className="text-(--muted-foreground) text-[10px] font-medium mb-0.5 uppercase tracking-wider">Total Transaksi</p>
                    <h4 className="text-lg font-bold text-white">{data.total_usages}</h4>
                    <p className="text-[10px] text-(--muted-foreground)">bulan ini</p>
                </div>

                {/* Breakdown */}
                <div className="glass-card rounded-xl border border-white/10 p-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Zap className="w-10 h-10 text-yellow-400" />
                    </div>
                    <p className="text-(--muted-foreground) text-[10px] font-medium mb-0.5 uppercase tracking-wider">Channel</p>
                    <div className="flex items-baseline gap-2 mt-0.5">
                        <div>
                            <span className="text-base font-bold text-white">{data.link_usages}</span>
                            <span className="text-[10px] text-(--muted-foreground) ml-0.5">Link</span>
                        </div>
                        <div className="w-px h-4 bg-white/10" />
                        <div>
                            <span className="text-base font-bold text-white">{data.code_usages}</span>
                            <span className="text-[10px] text-(--muted-foreground) ml-0.5">Kode</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info & Settings Accordion */}
            <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
                <button
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
                    onClick={() => setShowInfo(!showInfo)}
                >
                    <span className="text-sm font-medium text-white flex items-center gap-2">
                        <Info className="w-4 h-4 text-(--primary)" />
                        Info & Pengaturan Diskon
                    </span>
                    <svg className={`w-4 h-4 text-(--muted-foreground) transition-transform ${showInfo ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {showInfo && (
                    <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4">
                        {/* Commission Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                                <h4 className="text-xs font-medium text-white mb-1 flex items-center gap-1.5">
                                    <Link2 className="w-3 h-3 text-(--primary)" /> Link Referral
                                </h4>
                                <p className="text-[10px] text-(--muted-foreground) leading-relaxed">
                                    Komisi {data.commission_percent}% dari profit. Tanpa diskon customer.
                                </p>
                            </div>
                            <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                                <h4 className="text-xs font-medium text-white mb-1 flex items-center gap-1.5">
                                    <Shield className="w-3 h-3 text-(--accent)" /> Kode Redeem
                                </h4>
                                <p className="text-[10px] text-(--muted-foreground) leading-relaxed">
                                    Diskon dipotong dari komisi Anda. Net = {data.commission_percent}% − diskon.
                                </p>
                            </div>
                            <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                                <h4 className="text-xs font-medium text-white mb-1 flex items-center gap-1.5">
                                    <Shield className="w-3 h-3 text-yellow-400" /> Anti-Abuse
                                </h4>
                                <p className="text-[10px] text-(--muted-foreground) leading-relaxed">
                                    Maks 10× komisi & 3× diskon per customer/bulan.
                                </p>
                            </div>
                        </div>

                        {/* Discount Toggle */}
                        <div className="bg-black/20 rounded-lg p-4 border border-white/5 space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-white font-medium">Diskon untuk Customer</p>
                                    <p className="text-[10px] text-(--muted-foreground)">Dipotong dari komisi Anda</p>
                                </div>
                                <button
                                    onClick={async () => {
                                        try {
                                            await api.put("/member/affiliate/settings", {
                                                discount_enabled: !data.discount_enabled,
                                            });
                                            setData(prev => prev ? { ...prev, discount_enabled: !prev.discount_enabled } : prev);
                                        } catch {
                                            alert("Gagal menyimpan pengaturan");
                                        }
                                    }}
                                    className="transition-all"
                                >
                                    {data.discount_enabled ? (
                                        <ToggleRight className="w-9 h-9 text-(--primary)" />
                                    ) : (
                                        <ToggleLeft className="w-9 h-9 text-(--muted-foreground)" />
                                    )}
                                </button>
                            </div>

                            {data.discount_enabled && (
                                <>
                                    <div className="h-px bg-white/5" />
                                    <div>
                                        <label className="text-[10px] text-(--muted-foreground) mb-1 block">Persentase Diskon</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={data.discount_percent}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value) || 0;
                                                    setData(prev => prev ? { ...prev, discount_percent: val } : prev);
                                                }}
                                                onBlur={async (e) => {
                                                    const val = parseFloat(e.target.value) || 0;
                                                    if (val > data.commission_percent) {
                                                        alert(`Maks ${data.commission_percent}%`);
                                                        return;
                                                    }
                                                    try {
                                                        await api.put("/member/affiliate/settings", { discount_percent: val });
                                                    } catch {
                                                        alert("Gagal menyimpan");
                                                    }
                                                }}
                                                min={0}
                                                max={data.commission_percent}
                                                step={0.1}
                                                className="w-20 bg-black/30 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-(--primary)/50 focus:outline-none"
                                            />
                                            <span className="text-xs text-(--muted-foreground)">%</span>
                                            <span className="text-[10px] text-(--muted-foreground)">
                                                → Net komisi: <span className="text-white font-medium">{(data.commission_percent - data.discount_percent).toFixed(1)}%</span>
                                            </span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
