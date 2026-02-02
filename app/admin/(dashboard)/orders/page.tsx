"use client";

import { useEffect, useState } from "react";
import {
    Search,
    ExternalLink,
    RefreshCw,
    AlertCircle
} from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

export default function AdminOrders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [checkingStatus, setCheckingStatus] = useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (debouncedSearch) params.append("search", debouncedSearch);
            if (statusFilter !== "all") params.append("status", statusFilter);

            const response: any = await api.get(`/admin/orders?${params.toString()}`);
            setOrders(response.data.orders || []);
            setTotal(response.data.total || 0);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            alert("Gagal mengambil data order");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [debouncedSearch, statusFilter]);

    const handleCheckStatus = async (orderId: string) => {
        setCheckingStatus(orderId);
        try {
            const response: any = await api.post(`/admin/orders/${orderId}/check-status`);
            if (response.data?.changed) {
                alert(response.message || "Status telah diupdate");
                fetchOrders();
            } else {
                alert(response.message || "Tidak ada perubahan status");
            }
        } catch (error) {
            console.error("Failed to check status:", error);
            alert("Gagal mengecek status");
        } finally {
            setCheckingStatus(null);
        }
    };

    const getOrderStatusColor = (status: string) => {
        switch (status) {
            case "success":
                return "bg-emerald-500/10 text-emerald-500";
            case "paid":
            case "processing":
                return "bg-blue-500/10 text-blue-500";
            case "pending":
            case "waiting_payment":
                return "bg-yellow-500/10 text-yellow-500";
            case "expired":
                return "bg-orange-500/10 text-orange-500";
            case "failed":
                return "bg-red-500/10 text-red-500";
            case "cancelled":
                return "bg-slate-500/10 text-slate-400";
            default:
                return "bg-slate-500/10 text-slate-500";
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-emerald-500/10 text-emerald-500";
            case "pending":
                return "bg-yellow-500/10 text-yellow-500";
            case "expired":
                return "bg-orange-500/10 text-orange-500";
            case "cancelled":
                return "bg-slate-500/10 text-slate-400";
            default:
                return "bg-slate-500/10 text-slate-500";
        }
    };

    const canCheckStatus = (status: string) => {
        return status === "pending" || status === "waiting_payment";
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Order Management</h1>
                    <div className="text-sm text-slate-500">
                        Total Orders: <span className="text-white font-bold">{total}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Cari ref_id, no hp, email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full md:w-72 transition-colors"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer pr-10 hover:bg-slate-800 transition-colors"
                    >
                        <option value="all">Semua Status</option>
                        <option value="success">Sukses</option>
                        <option value="processing">Processing</option>
                        <option value="pending">Pending</option>
                        <option value="expired">Kadaluwarsa</option>
                        <option value="failed">Gagal</option>
                    </select>

                    <button
                        onClick={fetchOrders}
                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>

            {/* Search Info */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm text-blue-400">
                <p><strong>Pencarian:</strong> Ref ID, No HP, Email, Customer No, Serial Number, Product Name</p>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-950 text-slate-200 uppercase font-medium text-xs">
                            <tr>
                                <th className="px-4 py-3 whitespace-nowrap">Ref ID</th>
                                <th className="px-4 py-3 whitespace-nowrap">SKU</th>
                                <th className="px-4 py-3 min-w-[150px]">Customer</th>
                                <th className="px-4 py-3 min-w-[180px]">Product</th>
                                <th className="px-4 py-3 whitespace-nowrap">Price</th>
                                <th className="px-4 py-3 whitespace-nowrap">Order Status</th>
                                <th className="px-4 py-3 whitespace-nowrap">Payment Status</th>
                                <th className="px-4 py-3 min-w-[150px]">Digiflazz</th>
                                <th className="px-4 py-3 whitespace-nowrap">Date</th>
                                <th className="px-4 py-3 whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={10} className="px-4 py-8 text-center">Loading orders...</td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                                        No orders found.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="px-4 py-3 font-mono text-xs align-top whitespace-nowrap">{order.ref_id}</td>
                                        <td className="px-4 py-3 font-mono text-xs align-top whitespace-nowrap text-slate-500">{order.buyer_sku_code}</td>
                                        <td className="px-4 py-3 align-top">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-white font-medium text-xs">{order.customer_no}</span>
                                                {order.customer_phone && <span className="text-xs text-slate-500">{order.customer_phone}</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 align-top">
                                            <span className="text-white text-xs break-words block">{order.product_name}</span>
                                        </td>
                                        <td className="px-4 py-3 text-emerald-400 font-medium align-top whitespace-nowrap text-xs">
                                            Rp {order.selling_price?.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 align-top">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)} whitespace-nowrap`}>
                                                {order.status_label || order.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 align-top">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)} whitespace-nowrap`}>
                                                {order.payment_status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 align-top">
                                            <div className="flex flex-col text-xs gap-0.5">
                                                <span className={`${order.digiflazz_status === "Sukses" ? "text-emerald-500" : "text-slate-400"} whitespace-nowrap font-medium`}>
                                                    {order.digiflazz_status || "-"}
                                                </span>
                                                {order.serial_number && (
                                                    <span className="text-slate-300 font-mono text-[10px] break-all py-0.5 px-1 bg-slate-950 rounded">
                                                        SN: {order.serial_number}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs align-top whitespace-nowrap text-slate-500">
                                            {new Date(order.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 align-top">
                                            <div className="flex flex-col gap-1.5">
                                                <Link
                                                    href={`/payment/${order.id}`}
                                                    target="_blank"
                                                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                    Payment
                                                </Link>
                                                {canCheckStatus(order.status) && (
                                                    <button
                                                        onClick={() => handleCheckStatus(order.id)}
                                                        disabled={checkingStatus === order.id}
                                                        className="flex items-center gap-1 text-xs text-yellow-400 hover:text-yellow-300 transition-colors disabled:opacity-50"
                                                    >
                                                        {checkingStatus === order.id ? (
                                                            <RefreshCw className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            <AlertCircle className="w-3 h-3" />
                                                        )}
                                                        Check
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {loading ? (
                    <div className="text-center py-8 text-slate-500">Loading orders...</div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">No orders found.</div>
                ) : (
                    orders.map((order) => (
                        <div key={order.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="font-mono text-xs text-slate-500">#{order.ref_id}</span>
                                    <span className="text-[10px] text-slate-600 block">{order.buyer_sku_code}</span>
                                </div>
                                <div className="flex gap-1">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getOrderStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                                        {order.payment_status}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-between items-start gap-4">
                                <h3 className="font-medium text-white text-sm line-clamp-2">{order.product_name}</h3>
                                <div className="text-emerald-400 font-bold text-sm shrink-0">
                                    Rp {order.selling_price?.toLocaleString()}
                                </div>
                            </div>

                            <div className="bg-slate-950/50 p-2 rounded-lg text-xs space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Customer</span>
                                    <span className="text-slate-200 font-mono">{order.customer_no}</span>
                                </div>
                                {order.customer_phone && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Phone</span>
                                        <span className="text-slate-400">{order.customer_phone}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center border-t border-slate-800 pt-2">
                                <span className="text-[10px] text-slate-600">
                                    {new Date(order.created_at).toLocaleString()}
                                </span>
                                <div className="flex gap-3">
                                    <Link
                                        href={`/payment/${order.id}`}
                                        target="_blank"
                                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        Payment
                                    </Link>
                                    {canCheckStatus(order.status) && (
                                        <button
                                            onClick={() => handleCheckStatus(order.id)}
                                            disabled={checkingStatus === order.id}
                                            className="flex items-center gap-1 text-xs text-yellow-400 hover:text-yellow-300 disabled:opacity-50"
                                        >
                                            {checkingStatus === order.id ? (
                                                <RefreshCw className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <AlertCircle className="w-3 h-3" />
                                            )}
                                            Check
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
