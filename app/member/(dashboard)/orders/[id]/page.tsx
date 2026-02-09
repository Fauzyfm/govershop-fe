"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Check,
    Clock,
    X,
    RefreshCw,
    Loader2,
    Copy,
    Package,
    User,
    Calendar,
    Hash
} from "lucide-react";

interface OrderDetail {
    id: string;
    ref_id: string;
    buyer_sku_code: string;
    product_name: string;
    customer_no: string;
    member_price: number;
    status: string;
    serial_number?: string;
    message?: string;
    created_at: string;
    updated_at: string;
}

export default function MemberOrderDetailPage() {
    const params = useParams();
    const orderId = params.id as string;

    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [copied, setCopied] = useState(false);

    const fetchOrder = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/member/orders/${orderId}`, {
                credentials: "include",
            });
            const json = await res.json();
            if (json.success && json.data) {
                setOrder(json.data);
            }
        } catch (error) {
            console.error("Failed to fetch order:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchOrder();
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "success":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Check className="w-4 h-4" /> Sukses
                    </span>
                );
            case "processing":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <Clock className="w-4 h-4" /> Diproses
                    </span>
                );
            case "failed":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                        <X className="w-4 h-4" /> Gagal
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                        <Clock className="w-4 h-4" /> Pending
                    </span>
                );
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-20">
                <X className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Pesanan Tidak Ditemukan</h2>
                <p className="text-white/50 mb-6">Order dengan ID tersebut tidak ada atau bukan milik Anda.</p>
                <Link
                    href="/member/orders"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary)]/80 text-white rounded-xl transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke Pesanan
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/member/orders"
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/70 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-white">Detail Pesanan</h1>
                        <p className="text-white/50 text-sm font-mono">{order.ref_id}</p>
                    </div>
                </div>
                {order.status === "processing" && (
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                )}
            </div>

            {/* Status Card */}
            <div className="glass-card rounded-2xl p-6 text-center">
                <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${order.status === "success" ? "bg-emerald-500/10 border-2 border-emerald-500/30" :
                    order.status === "processing" ? "bg-blue-500/10 border-2 border-blue-500/30" :
                        order.status === "failed" ? "bg-red-500/10 border-2 border-red-500/30" :
                            "bg-yellow-500/10 border-2 border-yellow-500/30"
                    }`}>
                    {order.status === "success" ? <Check className="w-10 h-10 text-emerald-500" /> :
                        order.status === "processing" ? <Clock className="w-10 h-10 text-blue-500" /> :
                            order.status === "failed" ? <X className="w-10 h-10 text-red-500" /> :
                                <Clock className="w-10 h-10 text-yellow-500" />}
                </div>
                <div className="mb-4">{getStatusBadge(order.status)}</div>
                {order.message && (
                    <p className="text-white/60 text-sm">{order.message}</p>
                )}
            </div>

            {/* Serial Number Card (if available) */}
            {order.serial_number && (
                <div className="glass-card rounded-2xl p-6 border-2 border-emerald-500/20 bg-emerald-500/5">
                    <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        Serial Number / Token
                    </h3>
                    <div className="flex items-center gap-3">
                        <code className="flex-1 text-lg font-mono text-white bg-black/30 px-4 py-3 rounded-xl break-all">
                            {order.serial_number}
                        </code>
                        <button
                            onClick={() => handleCopy(order.serial_number!)}
                            className="p-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-xl transition-colors"
                            title="Copy"
                        >
                            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            )}

            {/* Order Details */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">Informasi Pesanan</h3>

                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                        <Package className="w-5 h-5 text-[var(--primary)]" />
                        <div className="flex-1">
                            <p className="text-xs text-white/40">Produk</p>
                            <p className="text-white font-medium">{order.product_name}</p>
                            <p className="text-white/50 text-xs font-mono">{order.buyer_sku_code}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                        <User className="w-5 h-5 text-[var(--primary)]" />
                        <div className="flex-1">
                            <p className="text-xs text-white/40">Tujuan</p>
                            <p className="text-white font-mono">{order.customer_no}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                        <Hash className="w-5 h-5 text-[var(--primary)]" />
                        <div className="flex-1">
                            <p className="text-xs text-white/40">Harga</p>
                            <p className="text-[var(--accent)] font-bold">
                                Rp {(order.member_price || 0).toLocaleString("id-ID")}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                        <Calendar className="w-5 h-5 text-[var(--primary)]" />
                        <div className="flex-1">
                            <p className="text-xs text-white/40">Waktu Order</p>
                            <p className="text-white">{formatDate(order.created_at)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Back Button */}
            <div className="flex gap-3">
                <Link
                    href="/member/orders"
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors text-center border border-white/5"
                >
                    Kembali ke Pesanan
                </Link>
                <Link
                    href="/member/products"
                    className="flex-1 py-3 bg-[var(--primary)] hover:bg-[var(--primary)]/80 text-white rounded-xl font-medium transition-colors text-center"
                >
                    Order Lagi
                </Link>
            </div>
        </div>
    );
}
