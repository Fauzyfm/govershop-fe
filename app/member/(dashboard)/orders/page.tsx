"use client";

import { useState, useEffect, useCallback } from "react";
import { ShoppingCart, Package, Clock, CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";

interface Order {
    id: string;
    ref_id: string;
    product_name: string;
    customer_no: string;
    member_price: number;
    status: string;
    serial_number: string;
    created_at: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    pending: { label: "Menunggu", color: "text-yellow-400 bg-yellow-400/10", icon: Clock },
    processing: { label: "Diproses", color: "text-blue-400 bg-blue-400/10", icon: Package },
    success: { label: "Sukses", color: "text-green-400 bg-green-400/10", icon: CheckCircle },
    failed: { label: "Gagal", color: "text-red-400 bg-red-400/10", icon: XCircle },
    cancelled: { label: "Dibatalkan", color: "text-slate-400 bg-slate-400/10", icon: XCircle },
};

export default function MemberOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const limit = 10;

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            const offset = (page - 1) * limit;
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/member/orders?limit=${limit}&offset=${offset}`, {
                credentials: "include",
            });
            const data = await res.json();
            if (data.success) {
                setOrders(data.orders || []);
                setTotal(data.total || 0);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setIsLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <ShoppingCart className="w-7 h-7 text-(--primary)" />
                    Pesanan Saya
                </h1>
            </div>

            <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
                {isLoading ? (
                    <div className="p-10 text-center">
                        <div className="w-8 h-8 border-2 border-(--primary) border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="p-10 text-center text-(--muted-foreground)">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Belum ada pesanan</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-(--card)/50 border-b border-white/10">
                                <tr>
                                    <th className="text-left p-4 text-(--muted-foreground) font-medium">ID Pesanan</th>
                                    <th className="text-left p-4 text-(--muted-foreground) font-medium">Produk</th>
                                    <th className="text-left p-4 text-(--muted-foreground) font-medium">Tujuan</th>
                                    <th className="text-right p-4 text-(--muted-foreground) font-medium">Harga</th>
                                    <th className="text-center p-4 text-(--muted-foreground) font-medium">Status</th>
                                    <th className="text-left p-4 text-(--muted-foreground) font-medium">SN</th>
                                    <th className="text-left p-4 text-(--muted-foreground) font-medium">Tanggal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => {
                                    const config = statusConfig[order.status] || statusConfig.pending;
                                    const StatusIcon = config.icon;
                                    return (
                                        <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-4 font-mono text-xs text-white">{order.ref_id}</td>
                                            <td className="p-4 text-white">{order.product_name}</td>
                                            <td className="p-4 text-slate-300 font-mono">{order.customer_no}</td>
                                            <td className="p-4 text-right text-white font-medium">
                                                Rp {(order.member_price || 0).toLocaleString("id-ID")}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {config.label}
                                                </span>
                                            </td>
                                            <td className="p-4 font-mono text-xs text-slate-400">{order.serial_number || "-"}</td>
                                            <td className="p-4 text-slate-400 text-xs">
                                                {new Date(order.created_at).toLocaleDateString("id-ID", {
                                                    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                                                })}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-white/10">
                        <span className="text-sm text-(--muted-foreground)">
                            Menampilkan {orders.length} dari {total} pesanan
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg bg-(--card) border border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm text-white px-3">
                                {page} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-lg bg-(--card) border border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
