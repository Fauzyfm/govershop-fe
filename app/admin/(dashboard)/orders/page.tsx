"use client";

import { useEffect, useState } from "react";
import {
    Search,
    ExternalLink,
    RefreshCw,
    AlertCircle,
    Download,
    Calendar,
    TrendingUp,
    DollarSign,
    ShoppingCart,
    RotateCcw,
    X,
    Shield
} from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";
import * as XLSX from 'xlsx';

interface OrderSummary {
    total_revenue: number;
    total_cost: number;
    total_profit: number;
    successful_orders: number;
    admin_fee_rate: number;
}

interface Order {
    id: string;
    ref_id: string;
    buyer_sku_code: string;
    product_name: string;
    customer_no: string;
    customer_email?: string;
    customer_phone?: string;
    buy_price: number;
    selling_price: number;
    profit: number;
    status: string;
    status_label: string;
    payment_status: string;
    digiflazz_status?: string;
    serial_number?: string;
    message?: string;
    created_at: string;
    order_source: string;
    admin_notes?: string;
}

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [paymentFilter, setPaymentFilter] = useState("all");
    const [digiflazzFilter, setDigiflazzFilter] = useState("all");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [checkingStatus, setCheckingStatus] = useState<string | null>(null);

    // Manual Topup Modal
    const [manualTopupOrder, setManualTopupOrder] = useState<Order | null>(null);
    const [totpCode, setTotpCode] = useState("");
    const [newCustomerNo, setNewCustomerNo] = useState("");
    const [manualTopupLoading, setManualTopupLoading] = useState(false);

    // Date filter - default to today
    const [dateFrom, setDateFrom] = useState(() => new Date().toISOString().split('T')[0]);
    const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);

    // Summary stats
    const [summary, setSummary] = useState<OrderSummary>({
        total_revenue: 0,
        total_cost: 0,
        total_profit: 0,
        successful_orders: 0,
        admin_fee_rate: 10
    });

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
            if (paymentFilter !== "all") params.append("payment_status", paymentFilter);
            if (digiflazzFilter !== "all") params.append("digiflazz_status", digiflazzFilter);
            if (dateFrom) params.append("date_from", dateFrom);
            if (dateTo) params.append("date_to", dateTo);

            const response: any = await api.get(`/admin/orders?${params.toString()}`);
            setOrders(response.data.orders || []);
            setTotal(response.data.total || 0);
            if (response.data.summary) {
                setSummary(response.data.summary);
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            alert("Gagal mengambil data order");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [debouncedSearch, paymentFilter, digiflazzFilter, dateFrom, dateTo]);

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

    const handleManualTopup = async () => {
        if (!manualTopupOrder) return;

        setManualTopupLoading(true);
        try {
            const response: any = await api.post(`/admin/orders/${manualTopupOrder.id}/manual-topup`, {
                totp_code: totpCode,
                customer_no: newCustomerNo || undefined
            });
            alert(response.message || "Manual topup berhasil!");
            setManualTopupOrder(null);
            setTotpCode("");
            setNewCustomerNo("");
            fetchOrders();
        } catch (error: any) {
            alert(error?.response?.data?.message || "Gagal melakukan manual topup");
        } finally {
            setManualTopupLoading(false);
        }
    };

    const canManualTopup = (order: Order) => {
        return order.status === "failed" && order.payment_status === "completed";
    };

    const handleExportExcel = () => {
        if (orders.length === 0) {
            alert("Tidak ada data untuk diexport");
            return;
        }

        const excelData = orders.map(o => ({
            "Ref ID": o.ref_id,
            "SKU": o.buyer_sku_code,
            "Customer No": o.customer_no,
            "Phone": o.customer_phone || "-",
            "Email": o.customer_email || "-",
            "Product": o.product_name,
            "Modal (Rp)": o.buy_price,
            "Harga Jual (Rp)": o.selling_price,
            "Profit (Rp)": o.profit,
            "Status": o.status_label || o.status,
            "Payment": o.payment_status,
            "Digiflazz": o.digiflazz_status || "-",
            "SN": o.serial_number || "-",
            "Tanggal": new Date(o.created_at).toLocaleString('id-ID'),
            "Source": o.order_source || "website",
            "Notes": o.admin_notes || "-"
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Orders");

        // Add summary row
        const summaryData = [
            {},
            { "Ref ID": "=== SUMMARY ===" },
            { "Ref ID": "Total Revenue", "SKU": `Rp ${summary.total_revenue.toLocaleString()}` },
            { "Ref ID": "Total Modal", "SKU": `Rp ${summary.total_cost.toLocaleString()}` },
            { "Ref ID": "Total Profit", "SKU": `Rp ${summary.total_profit.toLocaleString()}` },
            { "Ref ID": "Transaksi Sukses", "SKU": summary.successful_orders.toString() },
        ];
        XLSX.utils.sheet_add_json(ws, summaryData, { skipHeader: true, origin: -1 });

        XLSX.writeFile(wb, `orders_${dateFrom}_to_${dateTo}.xlsx`);
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
                return "bg-white/5 text-white/40";
            default:
                return "bg-white/5 text-white/30";
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
                return "bg-white/5 text-white/40";
            default:
                return "bg-white/5 text-white/30";
        }
    };

    const canCheckStatus = (status: string) => {
        return status === "pending" || status === "waiting_payment";
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_10px_var(--primary)]" />
                        Order Management
                    </h1>
                    <div className="text-sm text-white/50 ml-4">
                        Total Orders: <span className="text-white font-bold">{total}</span>
                        <span className="mx-2">•</span>
                        <span className="text-white/40">{dateFrom === dateTo ? dateFrom : `${dateFrom} - ${dateTo}`}</span>
                    </div>
                </div>

                {/* Export Button */}
                <button
                    onClick={handleExportExcel}
                    disabled={orders.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600/80 hover:bg-emerald-500 disabled:bg-white/5 disabled:text-white/30 disabled:cursor-not-allowed rounded-xl text-white text-sm font-medium transition-colors border border-emerald-500/20 shadow-lg shadow-emerald-900/20"
                >
                    <Download className="w-4 h-4" />
                    Export Excel
                </button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card rounded-xl p-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign className="w-12 h-12 text-primary" />
                    </div>
                    <div className="flex items-center gap-2 text-white/60 text-xs mb-1 relative z-10">
                        <DollarSign className="w-4 h-4" />
                        Total Revenue
                    </div>
                    <div className="text-xl font-bold text-white relative z-10">
                        Rp {summary.total_revenue.toLocaleString()}
                    </div>
                </div>
                <div className="glass-card rounded-xl p-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShoppingCart className="w-12 h-12 text-orange-400" />
                    </div>
                    <div className="flex items-center gap-2 text-white/60 text-xs mb-1 relative z-10">
                        <ShoppingCart className="w-4 h-4" />
                        Total Cost (Modal)
                    </div>
                    <div className="text-xl font-bold text-orange-400 relative z-10">
                        Rp {summary.total_cost.toLocaleString()}
                    </div>
                </div>
                <div className="glass-card rounded-xl p-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp className="w-12 h-12 text-emerald-400" />
                    </div>
                    <div className="flex items-center gap-2 text-white/60 text-xs mb-1 relative z-10">
                        <TrendingUp className="w-4 h-4" />
                        Total Profit
                    </div>
                    <div className="text-xl font-bold text-emerald-400 relative z-10">
                        Rp {summary.total_profit.toLocaleString()}
                    </div>
                </div>
                <div className="glass-card rounded-xl p-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Shield className="w-12 h-12 text-blue-400" />
                    </div>
                    <div className="flex items-center gap-2 text-white/60 text-xs mb-1 relative z-10">
                        <Calendar className="w-4 h-4" />
                        Transaksi Sukses
                    </div>
                    <div className="text-xl font-bold text-blue-400 relative z-10">
                        {summary.successful_orders}
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative flex-1 mdw-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                    type="text"
                    placeholder="Cari ref_id, no hp, email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-black/20 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 w-full transition-colors"
                />
            </div>
            {/* Filters */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3">

                {/* Date Range */}
                <div className="flex flex-wrap items-center gap-2">
                    <Calendar className="w-4 h-4 text-white/50 " />
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                    />
                    <span className="text-white/50">-</span>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                    />
                </div>

                {/* Payment Status Filter */}
                <select
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                    className="bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50 appearance-none cursor-pointer pr-10 hover:bg-white/5 transition-colors [&>option]:bg-[#280905]"
                >
                    <option value="all">Payment: Semua</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                </select>

                {/* Digiflazz Status Filter */}
                <select
                    value={digiflazzFilter}
                    onChange={(e) => setDigiflazzFilter(e.target.value)}
                    className="bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50 appearance-none cursor-pointer pr-10 hover:bg-white/5 transition-colors [&>option]:bg-[#280905]"
                >
                    <option value="all">Digiflazz: Semua</option>
                    <option value="Sukses">Sukses</option>
                    <option value="Pending">Pending</option>
                    <option value="Gagal">Gagal</option>
                </select>


                {/* Refresh */}
                <button
                    onClick={fetchOrders}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/50 hover:text-white transition-colors border border-white/5"
                    title="Refresh"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>
            </div>

            {/* Table - Horizontal Scroll on Mobile */}
            <div className="glass-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-white/70 min-w-[1200px]">
                        <thead className="bg-white/5 text-white/90 uppercase font-medium text-xs">
                            <tr>
                                <th className="px-4 py-3 whitespace-nowrap">Ref ID</th>
                                <th className="px-4 py-3 whitespace-nowrap">SKU</th>
                                <th className="px-4 py-3 min-w-[150px]">Customer</th>
                                <th className="px-4 py-3 min-w-[180px]">Product</th>
                                <th className="px-4 py-3 whitespace-nowrap">Pembelian</th>
                                <th className="px-4 py-3 whitespace-nowrap">Harga Jual</th>
                                <th className="px-4 py-3 whitespace-nowrap">Profit</th>
                                <th className="px-4 py-3 whitespace-nowrap">Payment</th>
                                <th className="px-4 py-3 min-w-[200px]">Digiflazz</th>
                                <th className="px-4 py-3 whitespace-nowrap">Date</th>
                                <th className="px-4 py-3 whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={11} className="px-4 py-8 text-center text-white/50">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                                            <span>Loading orders...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className="px-4 py-8 text-center text-white/50">
                                        No orders found for selected filters.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-4 py-3 font-medium text-white align-top">
                                            {order.ref_id}
                                            {order.order_source?.startsWith("admin_") && (
                                                <span className={`block text-[10px] w-fit px-1.5 py-0.5 mt-1 rounded ${order.order_source === "admin_gift"
                                                    ? "bg-pink-500/20 text-pink-400 border border-pink-500/30"
                                                    : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                                    }`}>
                                                    {order.order_source === "admin_gift" ? "GIFT" : "CASH"}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs align-top">
                                            <span className="bg-white/10 px-1 py-0.5 rounded text-white/70">
                                                {order.buyer_sku_code}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 align-top">
                                            <div className="flex flex-col text-xs gap-0.5">
                                                <span className="text-white font-mono break-all group-hover:text-primary transition-colors">{order.customer_no}</span>
                                                {order.customer_email && <span className="text-white/40">{order.customer_email}</span>}
                                                {order.customer_phone && <span className="text-white/50">{order.customer_phone}</span>}
                                                {order.admin_notes && (
                                                    <div className="mt-1 p-1 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-500 text-[10px] italic">
                                                        📝 {order.admin_notes}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 align-top">
                                            <span className="text-white text-xs break-all block">{order.product_name}</span>
                                        </td>
                                        <td className="px-4 py-3 text-orange-400 font-medium align-top whitespace-nowrap text-xs">
                                            Rp {order.buy_price?.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-white font-medium align-top whitespace-nowrap text-xs">
                                            Rp {order.selling_price?.toLocaleString()}
                                        </td>
                                        <td className={`px-4 py-3 font-bold align-top whitespace-nowrap text-xs ${order.status === 'failed' || order.status === 'cancelled' || order.status === 'expired'
                                            ? 'text-red-500 line-through opacity-60'
                                            : order.status === 'success' || order.status === 'processing' || order.status === 'paid'
                                                ? 'text-emerald-400'
                                                : 'text-white/40'
                                            }`}>
                                            {order.status === 'failed' || order.status === 'cancelled' || order.status === 'expired'
                                                ? '-'
                                                : `+Rp ${order.profit?.toLocaleString()}`
                                            }
                                        </td>
                                        <td className="px-4 py-3 align-top">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)} whitespace-nowrap border border-white/5`}>
                                                {order.payment_status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 align-top">
                                            <div className="flex flex-col text-xs gap-1">
                                                <span className={`${order.digiflazz_status === "Sukses"
                                                    ? "text-emerald-500"
                                                    : order.digiflazz_status === "Gagal"
                                                        ? "text-red-500"
                                                        : order.digiflazz_status === "Pending"
                                                            ? "text-yellow-500"
                                                            : "text-white/40"
                                                    } whitespace-nowrap font-medium`}>
                                                    {order.digiflazz_status || "-"}
                                                </span>
                                                {order.serial_number && (
                                                    <span className="text-emerald-300 font-mono text-[10px] break-all py-0.5 px-1 bg-emerald-950/30 rounded border border-emerald-500/20">
                                                        SN: {order.serial_number}
                                                    </span>
                                                )}
                                                {order.message && order.digiflazz_status === "Gagal" && (
                                                    <span className="text-red-400 text-[10px] break-all py-0.5 px-1 bg-red-950/30 rounded border border-red-500/20">
                                                        ❌ {order.message}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs align-top whitespace-nowrap text-white/50">
                                            {new Date(order.created_at).toLocaleString('id-ID')}
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
                                                {canManualTopup(order) && (
                                                    <button
                                                        onClick={() => {
                                                            setManualTopupOrder(order);
                                                            setNewCustomerNo(order.customer_no);
                                                        }}
                                                        className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors"
                                                    >
                                                        <RotateCcw className="w-3 h-3" />
                                                        Retry
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

            {/* Info Note */}
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3 text-sm text-blue-400">
                <p><strong>💡 Info:</strong> Profit = Harga Jual - Modal</p>
                <p className="mt-1 text-xs text-blue-400/70">Pencarian: Ref ID, No HP, Email, Customer No, Serial Number, Product Name</p>
            </div>

            {/* Manual Topup Modal */}
            {manualTopupOrder && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#280905] border border-white/10 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Shield className="w-5 h-5 text-orange-400" />
                                Manual Topup
                            </h3>
                            <button
                                onClick={() => {
                                    setManualTopupOrder(null);
                                    setTotpCode("");
                                    setNewCustomerNo("");
                                }}
                                className="text-white/50 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Order Info */}
                        <div className="bg-black/20 rounded-xl p-4 space-y-2 text-sm border border-white/5">
                            <div className="flex justify-between">
                                <span className="text-white/50">Order ID:</span>
                                <span className="text-white font-mono text-xs">{manualTopupOrder.ref_id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/50">Product:</span>
                                <span className="text-white">{manualTopupOrder.product_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/50">SKU:</span>
                                <span className="text-primary font-mono">{manualTopupOrder.buyer_sku_code}</span>
                            </div>
                        </div>

                        {/* Customer No (editable) */}
                        <div className="space-y-2">
                            <label className="text-sm text-white/70">Customer No / User ID</label>
                            <input
                                type="text"
                                value={newCustomerNo}
                                onChange={(e) => setNewCustomerNo(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary/50"
                            />
                            {newCustomerNo !== manualTopupOrder.customer_no && (
                                <p className="text-xs text-yellow-400">⚠️ Customer no berbeda dari aslinya: {manualTopupOrder.customer_no}</p>
                            )}
                        </div>

                        {/* TOTP Code */}
                        <div className="space-y-2">
                            <label className="text-sm text-white/70">Kode TOTP (6 digit)</label>
                            <input
                                type="text"
                                value={totpCode}
                                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                placeholder="000000"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-primary/50"
                                maxLength={6}
                            />
                            <p className="text-xs text-white/40">Masukkan kode dari Google Authenticator</p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setManualTopupOrder(null);
                                    setTotpCode("");
                                    setNewCustomerNo("");
                                }}
                                className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 px-4 py-2 rounded-xl transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleManualTopup}
                                disabled={manualTopupLoading || totpCode.length !== 6 || !newCustomerNo}
                                className="flex-1 bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                            >
                                {manualTopupLoading ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <RotateCcw className="w-4 h-4" />
                                )}
                                Retry Topup
                            </button>
                        </div>

                        {/* Warning */}
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400">
                            ⚠️ Aksi ini akan mengirim topup ke Digiflazz. Pastikan data sudah benar.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
