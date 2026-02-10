"use client";

import { useState, useEffect, useCallback } from "react";
import { ShoppingCart, Package, Clock, CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight, ExternalLink, Search, Filter } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

interface Order {
    id: string;
    ref_id: string;
    buyer_sku_code: string;
    product_name: string;
    customer_no: string;
    member_price: number;
    status: string;
    serial_number: string;
    created_at: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    pending: { label: "Menunggu", color: "text-yellow-400 bg-yellow-400/10", icon: Clock },
    waiting_payment: { label: "Menunggu Bayar", color: "text-yellow-400 bg-yellow-400/10", icon: Clock },
    processing: { label: "Diproses", color: "text-blue-400 bg-blue-400/10", icon: Package },
    success: { label: "Sukses", color: "text-green-400 bg-green-400/10", icon: CheckCircle },
    failed: { label: "Gagal", color: "text-red-400 bg-red-400/10", icon: XCircle },
    cancelled: { label: "Dibatalkan", color: "text-slate-400 bg-slate-400/10", icon: XCircle },
    expired: { label: "Kadaluarsa", color: "text-slate-400 bg-slate-400/10", icon: XCircle },
};

function getToday() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

export default function MemberOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const limit = 10;

    // Filter states
    const [dateFrom, setDateFrom] = useState(getToday());
    const [dateTo, setDateTo] = useState(getToday());
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchInput, setSearchInput] = useState("");

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            const offset = (page - 1) * limit;
            const params = new URLSearchParams({
                limit: String(limit),
                offset: String(offset),
                date_from: dateFrom,
                date_to: dateTo,
            });
            if (statusFilter !== "all") params.set("status", statusFilter);
            if (searchQuery) params.set("search", searchQuery);

            const data: any = await api.get(`/member/orders?${params.toString()}`);
            if (data.success) {
                setOrders(data.orders || []);
                setTotal(data.total || 0);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setIsLoading(false);
        }
    }, [page, dateFrom, dateTo, statusFilter, searchQuery]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [dateFrom, dateTo, statusFilter, searchQuery]);

    const handleSearch = () => {
        setSearchQuery(searchInput);
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <ShoppingCart className="w-7 h-7 text-(--primary)" />
                    Pesanan Saya
                </h1>
            </div>

            {/* Filters */}
            <div className="glass-card rounded-xl border border-white/10 p-4">
                <div className="flex items-center gap-2 mb-3 text-sm text-slate-400">
                    <Filter className="w-4 h-4" />
                    Filter
                </div>
                <div className="flex flex-wrap gap-3">
                    {/* Date From */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-500">Dari Tanggal</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white/30 transition-colors"
                        />
                    </div>

                    {/* Date To */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-500">Sampai Tanggal</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white/30 transition-colors"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-500">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white/30 transition-colors appearance-none pr-8"
                        >
                            <option value="all" className="bg-slate-800">Semua Status</option>
                            <option value="pending" className="bg-slate-800">Menunggu</option>
                            <option value="waiting_payment" className="bg-slate-800">Menunggu Bayar</option>
                            <option value="processing" className="bg-slate-800">Diproses</option>
                            <option value="success" className="bg-slate-800">Sukses</option>
                            <option value="failed" className="bg-slate-800">Gagal</option>
                            <option value="cancelled" className="bg-slate-800">Dibatalkan</option>
                            <option value="expired" className="bg-slate-800">Kadaluarsa</option>
                        </select>
                    </div>

                    {/* Search */}
                    <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                        <label className="text-xs text-slate-500">Cari (SKU, Produk, Ref ID, No Tujuan)</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                placeholder="Ketik dan tekan Enter..."
                                className="flex-1 px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-white/30 transition-colors"
                            />
                            <button
                                onClick={handleSearch}
                                className="px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white hover:bg-white/15 transition-colors"
                            >
                                <Search className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
                {isLoading ? (
                    <div className="p-10 text-center">
                        <div className="w-8 h-8 border-2 border-(--primary) border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="p-10 text-center text-(--muted-foreground)">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Tidak ada pesanan ditemukan</p>
                        <p className="text-xs mt-1 opacity-70">Coba ubah filter atau tanggal</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-(--card)/50 border-b border-white/10">
                                <tr>
                                    <th className="text-left p-4 text-(--muted-foreground) font-medium">ID Pesanan</th>
                                    <th className="text-left p-4 text-(--muted-foreground) font-medium">Produk</th>
                                    <th className="text-left p-4 text-(--muted-foreground) font-medium">SKU</th>
                                    <th className="text-left p-4 text-(--muted-foreground) font-medium">Tujuan</th>
                                    <th className="text-right p-4 text-(--muted-foreground) font-medium">Harga</th>
                                    <th className="text-center p-4 text-(--muted-foreground) font-medium">Status</th>
                                    <th className="text-left p-4 text-(--muted-foreground) font-medium">SN</th>
                                    <th className="text-left p-4 text-(--muted-foreground) font-medium">Tanggal</th>
                                    <th className="text-center p-4 text-(--muted-foreground) font-medium">Aksi</th>
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
                                            <td className="p-4 font-mono text-xs">
                                                <span className="bg-white/10 px-1.5 py-0.5 rounded text-white/70">
                                                    {order.buyer_sku_code}
                                                </span>
                                            </td>
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
                                                {new Date(order.created_at).toLocaleString("id-ID", {
                                                    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                                                    timeZone: "UTC"
                                                })}
                                            </td>
                                            <td className="p-4 text-center">
                                                <Link
                                                    href={`/member/orders/${order.id}`}
                                                    className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                    Detail
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                <div className="flex items-center justify-between p-4 border-t border-white/10">
                    <span className="text-sm text-(--muted-foreground)">
                        {total > 0 ? `Menampilkan ${(page - 1) * limit + 1}–${Math.min(page * limit, total)} dari ${total} pesanan` : "0 pesanan"}
                    </span>
                    {totalPages > 1 && (
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
                    )}
                </div>
            </div>
        </div>
    );
}
