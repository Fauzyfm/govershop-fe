"use client";

import { useEffect, useState } from "react";
import {
    ShoppingCart,
    Search,
    ExternalLink
} from "lucide-react";
import api from "@/lib/api";

export default function AdminOrders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Debounce search
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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [debouncedSearch, statusFilter]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "success":
            case "paid":
                return "bg-emerald-500/10 text-emerald-500";
            case "pending":
            case "waiting_payment":
            case "processing":
                return "bg-yellow-500/10 text-yellow-500";
            case "failed":
            case "cancelled":
                return "bg-red-500/10 text-red-500";
            default:
                return "bg-slate-500/10 text-slate-500";
        }
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
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Cari order..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full md:w-64 transition-colors"
                        />
                    </div>

                    {/* Filter */}
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer pr-10 hover:bg-slate-800 transition-colors"
                        >
                            <option value="all">Semua Status</option>
                            <option value="success">Sukses</option>
                            <option value="processing">Processing</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Gagal</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-slate-400"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-950 text-slate-200 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4 whitespace-nowrap">Ref ID</th>
                                <th className="px-6 py-4 min-w-[200px]">Customer</th>
                                <th className="px-6 py-4 min-w-[200px]">Product</th>
                                <th className="px-6 py-4 whitespace-nowrap">Price</th>
                                <th className="px-6 py-4 whitespace-nowrap">Status</th>
                                <th className="px-6 py-4 min-w-[200px]">Digiflazz Info</th>
                                <th className="px-6 py-4 whitespace-nowrap">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center">Loading orders...</td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                        No orders found.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs align-top whitespace-nowrap">{order.ref_id}</td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-white font-medium break-words">{order.customer_no}</span>
                                                <div className="flex flex-col text-xs text-slate-500">
                                                    {order.customer_phone && <span>{order.customer_phone}</span>}
                                                    {order.customer_email && <span className="text-slate-400 italic">{order.customer_email}</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <span className="text-white break-words block min-w-[150px]">{order.product_name}</span>
                                        </td>
                                        <td className="px-6 py-4 text-emerald-400 font-medium align-top whitespace-nowrap">
                                            Rp {order.selling_price?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)} whitespace-nowrap`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="flex flex-col text-xs gap-1">
                                                <span className={`${order.digiflazz_status === "Sukses" ? "text-emerald-500" : "text-slate-400"} whitespace-nowrap font-medium`}>
                                                    {order.digiflazz_status || "-"}
                                                </span>
                                                {order.serial_number && (
                                                    <span className="text-slate-300 font-mono break-all py-0.5 px-1 bg-slate-950 rounded">
                                                        SN: {order.serial_number}
                                                    </span>
                                                )}
                                                {order.message && (
                                                    <span className="text-red-400 break-words italic max-w-[200px]">
                                                        Msg: {order.message}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs align-top whitespace-nowrap">
                                            {new Date(order.created_at).toLocaleString()}
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
                            {/* Header: Ref ID & Status */}
                            <div className="flex justify-between items-start">
                                <span className="font-mono text-xs text-slate-500">#{order.ref_id}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>

                            {/* Product & Price */}
                            <div className="flex justify-between items-start gap-4">
                                <h3 className="font-medium text-white line-clamp-2">{order.product_name}</h3>
                                <div className="text-right shrink-0">
                                    <div className="text-emerald-400 font-bold">Rp {order.selling_price?.toLocaleString()}</div>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="bg-slate-950/50 p-2.5 rounded-lg text-sm space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Customer</span>
                                    <span className="text-slate-200 font-mono">{order.customer_no}</span>
                                </div>
                                {order.customer_phone && (
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-600">Phone</span>
                                        <span className="text-slate-400">{order.customer_phone}</span>
                                    </div>
                                )}
                            </div>

                            {/* Digiflazz Status / SN */}
                            {(order.digiflazz_status || order.serial_number || order.message) && (
                                <div className="text-xs space-y-1 border-t border-slate-800 pt-2">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Provider</span>
                                        <span className={`${order.digiflazz_status === "Sukses" ? "text-emerald-500" : "text-slate-400"} font-medium`}>
                                            {order.digiflazz_status || "-"}
                                        </span>
                                    </div>
                                    {order.serial_number && (
                                        <div className="bg-slate-950 p-1.5 rounded font-mono text-slate-300 break-all">
                                            SN: {order.serial_number}
                                        </div>
                                    )}
                                    {order.message && (
                                        <div className="text-red-400 italic">
                                            {order.message}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Footer: Date */}
                            <div className="text-xs text-slate-600 pt-1 text-right">
                                {new Date(order.created_at).toLocaleString()}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
