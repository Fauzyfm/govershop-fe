"use client";

import { useEffect, useState, useCallback } from "react";
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
    Shield,
    Package,
    Filter,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";
import * as XLSX from 'xlsx';

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from "@/components/ui/table";

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
    member_id?: number;
    member_price?: number;
}



// --- Loading Skeleton ---
function OrdersSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-48" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="border-border/50 bg-card/80">
                        <CardContent className="pt-5 pb-5">
                            <Skeleton className="h-4 w-20 mb-2" />
                            <Skeleton className="h-7 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Card className="border-border/50 bg-card/80">
                <CardContent className="pt-6">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex gap-4 py-3">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
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

    // Pagination
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);

    // Manual Topup Modal
    const [manualTopupOrder, setManualTopupOrder] = useState<Order | null>(null);
    const [totpCode, setTotpCode] = useState("");
    const [newCustomerNo, setNewCustomerNo] = useState("");
    const [manualTopupLoading, setManualTopupLoading] = useState(false);

    // Date filter - default to today (Local/WIB)
    const [dateFrom, setDateFrom] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
    const [dateTo, setDateTo] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });

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

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const offset = (page - 1) * limit;
            const params = new URLSearchParams();
            params.append("limit", limit.toString());
            params.append("offset", offset.toString());
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
    }, [debouncedSearch, paymentFilter, digiflazzFilter, dateFrom, dateTo, page, limit]);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, paymentFilter, digiflazzFilter, dateFrom, dateTo]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

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

    const fetchAllOrdersForExport = async (): Promise<Order[]> => {
        try {
            const params = new URLSearchParams();
            params.append("limit", "10000"); // Get all orders
            params.append("offset", "0");
            if (debouncedSearch) params.append("search", debouncedSearch);
            if (paymentFilter !== "all") params.append("payment_status", paymentFilter);
            if (digiflazzFilter !== "all") params.append("digiflazz_status", digiflazzFilter);
            if (dateFrom) params.append("date_from", dateFrom);
            if (dateTo) params.append("date_to", dateTo);

            const response: any = await api.get(`/admin/orders?${params.toString()}`);
            return response.data.orders || [];
        } catch (error) {
            console.error("Failed to fetch all orders for export:", error);
            return [];
        }
    };

    const handleExportExcel = async () => {
        if (total === 0) {
            alert("Tidak ada data untuk diexport");
            return;
        }

        alert("Mengambil semua data order untuk export...");
        const allOrders = await fetchAllOrdersForExport();

        if (allOrders.length === 0) return;

        const excelData = allOrders.map(o => ({
            "Ref ID": o.ref_id,
            "SKU": o.buyer_sku_code,
            "Customer No": o.customer_no,
            "Phone": o.customer_phone || "-",
            "Email": o.customer_email || "-",
            "Product": o.product_name,
            "Modal (Rp)": o.buy_price,
            "Harga Jual (Rp)": o.selling_price,
            "Profit (Rp)": o.profit,
            "Member ID": o.member_id || "-",
            "Member Price (Rp)": o.member_price || "-",
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

    const getOrderBadgeVariant = (status: string) => {
        switch (status) {
            case "success": return "success" as const;
            case "paid":
            case "processing": return "default" as const;
            case "pending":
            case "waiting_payment": return "warning" as const;
            case "expired": return "warning" as const;
            case "failed": return "destructive" as const;
            case "cancelled": return "secondary" as const;
            default: return "outline" as const;
        }
    };

    const getPaymentBadgeVariant = (status: string) => {
        switch (status) {
            case "completed": return "success" as const;
            case "pending": return "warning" as const;
            case "expired": return "warning" as const;
            case "cancelled": return "secondary" as const;
            case "manual": return "default" as const;
            default: return "outline" as const;
        }
    };

    const canCheckStatus = (status: string) => {
        return status === "pending" || status === "waiting_payment";
    };

    const formatCurrency = (amount: number) => `Rp ${amount.toLocaleString('id-ID')}`;

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-6">
            {/* ===== Header ===== */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                        <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            Order Management
                        </h1>
                        <p className="text-sm text-white/50">
                            <span className="text-white font-semibold">{total}</span> orders
                            <span className="mx-1.5 text-white/20">·</span>
                            <span className="text-white/40">{dateFrom === dateTo ? dateFrom : `${dateFrom} — ${dateTo}`}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExportExcel}
                        disabled={orders.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 disabled:bg-white/5 disabled:text-white/30 disabled:border-white/10 disabled:cursor-not-allowed rounded-lg text-emerald-400 text-sm font-medium transition-all"
                    >
                        <Download className="w-4 h-4" />
                        Export Excel
                    </button>
                    <button
                        onClick={() => fetchOrders()}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-white/70 hover:text-white text-sm font-medium transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* ===== Summary Stats ===== */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Revenue */}
                <Card className="group relative overflow-hidden border-primary/20 bg-linear-to-br from-primary/10 via-card to-card hover:border-primary/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(195,17,12,0.15)]">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500" />
                    <CardContent className="pt-5 pb-5 relative z-10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] text-white/50 font-medium uppercase tracking-wider">Revenue</span>
                            <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                <DollarSign className="w-4 h-4 text-primary" />
                            </div>
                        </div>
                        <p className="text-xl font-bold text-white tracking-tight">{formatCurrency(summary.total_revenue)}</p>
                    </CardContent>
                </Card>

                {/* Total Modal */}
                <Card className="group relative overflow-hidden border-orange-500/20 bg-linear-to-br from-orange-500/10 via-card to-card hover:border-orange-500/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)]">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500" />
                    <CardContent className="pt-5 pb-5 relative z-10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] text-white/50 font-medium uppercase tracking-wider">Total Modal</span>
                            <div className="p-2 rounded-xl bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                                <ShoppingCart className="w-4 h-4 text-orange-400" />
                            </div>
                        </div>
                        <p className="text-xl font-bold text-orange-400 tracking-tight">{formatCurrency(summary.total_cost)}</p>
                    </CardContent>
                </Card>

                {/* Profit */}
                <Card className="group relative overflow-hidden border-emerald-500/20 bg-linear-to-br from-emerald-500/10 via-card to-card hover:border-emerald-500/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500" />
                    <CardContent className="pt-5 pb-5 relative z-10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] text-white/50 font-medium uppercase tracking-wider">Profit</span>
                            <div className="p-2 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                                <TrendingUp className="w-4 h-4 text-emerald-400" />
                            </div>
                        </div>
                        <p className="text-xl font-bold text-emerald-400 tracking-tight">{formatCurrency(summary.total_profit)}</p>
                    </CardContent>
                </Card>

                {/* Sukses */}
                <Card className="group relative overflow-hidden border-blue-500/20 bg-linear-to-br from-blue-500/10 via-card to-card hover:border-blue-500/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500" />
                    <CardContent className="pt-5 pb-5 relative z-10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] text-white/50 font-medium uppercase tracking-wider">Sukses</span>
                            <div className="p-2 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                                <Shield className="w-4 h-4 text-blue-400" />
                            </div>
                        </div>
                        <p className="text-xl font-bold text-blue-400 tracking-tight">{summary.successful_orders}</p>
                    </CardContent>
                </Card>
            </div>

            {/* ===== Filters ===== */}
            <Card className="border-transparent bg-card/60">
                <CardContent className="pt-5 pb-5">
                    <div className="flex flex-col gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                            <Input
                                type="text"
                                placeholder="Cari ref_id, no HP, email, customer no, SN, product..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 bg-black/20 border-white/10 h-10"
                            />
                        </div>

                        {/* Filter Row */}
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                            <div className="flex items-center gap-1.5 text-xs text-white/40 shrink-0">
                                <Filter className="w-3.5 h-3.5" />
                                <span>Filter:</span>
                            </div>

                            {/* Date Range */}
                            <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-white/40 shrink-0" />
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="bg-black/20 border-white/10 h-9 w-auto text-xs"
                                />
                                <span className="text-white/30 text-xs">—</span>
                                <Input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="bg-black/20 border-white/10 h-9 w-auto text-xs"
                                />
                            </div>

                            <Separator orientation="vertical" className="h-6 hidden md:block bg-white/10" />

                            {/* Payment Status */}
                            <select
                                value={paymentFilter}
                                onChange={(e) => setPaymentFilter(e.target.value)}
                                className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 appearance-none cursor-pointer pr-8 hover:bg-white/5 transition-colors [&>option]:bg-[#280905]"
                            >
                                <option value="all">Payment: Semua</option>
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                                <option value="expired">Expired</option>
                                <option value="cancelled">Cancelled</option>
                            </select>

                            {/* Digiflazz Status */}
                            <select
                                value={digiflazzFilter}
                                onChange={(e) => setDigiflazzFilter(e.target.value)}
                                className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 appearance-none cursor-pointer pr-8 hover:bg-white/5 transition-colors [&>option]:bg-[#280905]"
                            >
                                <option value="all">Digiflazz: Semua</option>
                                <option value="Sukses">Sukses</option>
                                <option value="Pending">Pending</option>
                                <option value="Gagal">Gagal</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ===== Orders Table ===== */}
            <Card className="border-transparent bg-card/60 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/10 bg-white/3 hover:bg-white/3">
                            <TableHead>Ref ID</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead className="min-w-[140px]">Customer</TableHead>
                            <TableHead className="min-w-[170px]">Product</TableHead>
                            <TableHead>Modal</TableHead>
                            <TableHead>Harga Jual</TableHead>
                            <TableHead>Profit</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead className="min-w-[180px]">Digiflazz</TableHead>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            // Skeleton Loading Rows
                            [...Array(6)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-14" /></TableCell>
                                </TableRow>
                            ))
                        ) : orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={11} className="h-32">
                                    <div className="flex flex-col items-center justify-center gap-2 text-white/40">
                                        <Package className="w-8 h-8 text-white/20" />
                                        <span className="text-sm">Tidak ada order ditemukan untuk filter ini.</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.id} className="group">
                                    {/* Ref ID */}
                                    <TableCell className="font-medium text-white text-xs">
                                        <span className="group-hover:text-primary transition-colors">{order.ref_id}</span>
                                        {order.member_id && (
                                            <Badge variant="default" className="mt-1 text-[10px] bg-purple-500/15 text-purple-400 border-purple-500/30 block w-fit">
                                                👤 Member #{order.member_id}
                                            </Badge>
                                        )}
                                        {order.order_source?.startsWith("admin_") && (
                                            <Badge
                                                variant={order.order_source === "admin_gift" ? "destructive" : "default"}
                                                className={`mt-1 text-[10px] block w-fit ${order.order_source === "admin_gift"
                                                    ? "bg-pink-500/15 text-pink-400 border-pink-500/30"
                                                    : "bg-blue-500/15 text-blue-400 border-blue-500/30"
                                                    }`}
                                            >
                                                {order.order_source === "admin_gift" ? "GIFT" : "CASH"}
                                            </Badge>
                                        )}
                                    </TableCell>

                                    {/* SKU */}
                                    <TableCell>
                                        <code className="text-[11px] bg-white/5 px-1.5 py-0.5 rounded text-white/70 border border-white/5">
                                            {order.buyer_sku_code}
                                        </code>
                                    </TableCell>

                                    {/* Customer */}
                                    <TableCell>
                                        <div className="flex flex-col gap-0.5 text-xs">
                                            <span className="text-white font-mono break-all group-hover:text-primary transition-colors">
                                                {order.customer_no}
                                            </span>
                                            {order.customer_email && (
                                                <span className="text-white/40 truncate">{order.customer_email}</span>
                                            )}
                                            {order.customer_phone && (
                                                <span className="text-white/50">{order.customer_phone}</span>
                                            )}
                                            {order.admin_notes && (
                                                <div className="mt-1 p-1.5 bg-yellow-500/10 border border-yellow-500/15 rounded text-yellow-400/80 text-[10px] italic leading-tight">
                                                    📝 {order.admin_notes}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* Product */}
                                    <TableCell>
                                        <span className="text-white text-xs break-all leading-tight">{order.product_name}</span>
                                    </TableCell>

                                    {/* Modal / Buy Price */}
                                    <TableCell className="text-orange-400 font-medium whitespace-nowrap text-xs">
                                        {formatCurrency(order.buy_price)}
                                    </TableCell>

                                    {/* Selling Price */}
                                    <TableCell className="text-white font-medium whitespace-nowrap text-xs">
                                        {formatCurrency(order.selling_price)}
                                    </TableCell>

                                    {/* Profit */}
                                    <TableCell className="whitespace-nowrap text-xs font-bold">
                                        {order.status === 'failed' || order.status === 'cancelled' || order.status === 'expired' ? (
                                            <span className="text-red-500/60 line-through">—</span>
                                        ) : order.status === 'success' || order.status === 'processing' || order.status === 'paid' ? (
                                            <span className="text-emerald-400">+{formatCurrency(order.profit)}</span>
                                        ) : (
                                            <span className="text-white/30">{formatCurrency(order.profit)}</span>
                                        )}
                                    </TableCell>

                                    {/* Payment Status */}
                                    <TableCell>
                                        <Badge variant={getPaymentBadgeVariant(order.payment_status)} className="text-[10px] whitespace-nowrap">
                                            {order.payment_status}
                                        </Badge>
                                    </TableCell>

                                    {/* Digiflazz Status */}
                                    <TableCell>
                                        <div className="flex flex-col gap-1 text-xs">
                                            <Badge
                                                variant={
                                                    order.digiflazz_status === "Sukses" ? "success"
                                                        : order.digiflazz_status === "Gagal" ? "destructive"
                                                            : order.digiflazz_status === "Pending" ? "warning"
                                                                : "outline"
                                                }
                                                className="text-[10px] w-fit"
                                            >
                                                {order.digiflazz_status || "—"}
                                            </Badge>
                                            {order.serial_number && (
                                                <code className="text-emerald-300/80 font-mono text-[10px] break-all py-0.5 px-1.5 bg-emerald-500/5 rounded border border-emerald-500/15">
                                                    SN: {order.serial_number}
                                                </code>
                                            )}
                                            {order.message && order.digiflazz_status === "Gagal" && (
                                                <span className="text-red-400/80 text-[10px] break-all py-0.5 px-1.5 bg-red-500/5 rounded border border-red-500/15">
                                                    ❌ {order.message}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* Date */}
                                    <TableCell className="text-xs text-white/50 whitespace-nowrap">
                                        {new Date(order.created_at).toLocaleString('id-ID', {
                                            day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                                            timeZone: "UTC"
                                        })}
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell>
                                        <div className="flex flex-col gap-1.5">
                                            <Link
                                                href={`/payment/${order.id}`}
                                                target="_blank"
                                                className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                Payment
                                            </Link>
                                            {canCheckStatus(order.status) && (
                                                <button
                                                    onClick={() => handleCheckStatus(order.id)}
                                                    disabled={checkingStatus === order.id}
                                                    className="inline-flex items-center gap-1 text-xs text-yellow-400 hover:text-yellow-300 transition-colors disabled:opacity-50"
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
                                                    className="inline-flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors"
                                                >
                                                    <RotateCcw className="w-3 h-3" />
                                                    Retry
                                                </button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* ===== Pagination Controls ===== */}
                {(orders.length > 0 || total > 0) && (
                    <div className="bg-white/3 px-4 py-3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-xs text-white/40 font-medium">
                            Menampilkan <span className="text-white/80">{Math.min((page - 1) * limit + 1, total)}</span> — <span className="text-white/80">{Math.min(page * limit, total)}</span> dari <span className="text-white">{total}</span> orders
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                disabled={page === 1 || loading}
                                className="flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 text-white/70 rounded-lg hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:text-white/70 text-xs font-medium transition-all"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                                Prev
                            </button>
                            <span className="px-2 text-xs text-white/50 font-medium min-w-[60px] text-center">
                                {page} / {totalPages || 1}
                            </span>
                            <button
                                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={page >= totalPages || loading}
                                className="flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 text-white/70 rounded-lg hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:text-white/70 text-xs font-medium transition-all"
                            >
                                Next
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </Card>

            {/* ===== Info Note ===== */}
            <Card className="border-transparent bg-blue-500/5">
                <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-2.5 text-sm text-blue-400">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-medium">Profit = Harga Jual - Modal</p>
                            <p className="mt-0.5 text-xs text-blue-400/60">Pencarian: Ref ID, No HP, Email, Customer No, Serial Number, Product Name</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ===== Manual Topup Modal ===== */}
            {manualTopupOrder && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <Card className="max-w-md w-full border-primary/15 bg-card shadow-2xl shadow-black/50">
                        <CardContent className="pt-6 space-y-5">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                                        <Shield className="w-4 h-4 text-orange-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white">Manual Topup</h3>
                                </div>
                                <button
                                    onClick={() => {
                                        setManualTopupOrder(null);
                                        setTotpCode("");
                                        setNewCustomerNo("");
                                    }}
                                    className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Order Info */}
                            <div className="bg-black/20 rounded-xl p-4 space-y-2.5 text-sm border border-white/5">
                                <div className="flex justify-between items-center">
                                    <span className="text-white/50">Order ID</span>
                                    <code className="text-white font-mono text-xs bg-white/5 px-2 py-0.5 rounded">{manualTopupOrder.ref_id}</code>
                                </div>
                                <Separator className="bg-white/5" />
                                <div className="flex justify-between items-center">
                                    <span className="text-white/50">Product</span>
                                    <span className="text-white text-right text-xs max-w-[200px] truncate">{manualTopupOrder.product_name}</span>
                                </div>
                                <Separator className="bg-white/5" />
                                <div className="flex justify-between items-center">
                                    <span className="text-white/50">SKU</span>
                                    <code className="text-primary font-mono text-xs">{manualTopupOrder.buyer_sku_code}</code>
                                </div>
                            </div>

                            {/* Customer No (editable) */}
                            <div className="space-y-2">
                                <label className="text-sm text-white/70 font-medium">Customer No / User ID</label>
                                <Input
                                    type="text"
                                    value={newCustomerNo}
                                    onChange={(e) => setNewCustomerNo(e.target.value)}
                                    className="bg-black/20 border-white/10"
                                />
                                {newCustomerNo !== manualTopupOrder.customer_no && (
                                    <p className="text-xs text-yellow-400 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        Berbeda dari aslinya: {manualTopupOrder.customer_no}
                                    </p>
                                )}
                            </div>

                            {/* TOTP Code */}
                            <div className="space-y-2">
                                <label className="text-sm text-white/70 font-medium">Kode TOTP (6 digit)</label>
                                <Input
                                    type="text"
                                    value={totpCode}
                                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    placeholder="000000"
                                    className="bg-black/20 border-white/10 text-center text-2xl font-mono tracking-[0.5em] h-14"
                                    maxLength={6}
                                />
                                <p className="text-xs text-white/40">Masukkan kode dari Google Authenticator</p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-1">
                                <button
                                    onClick={() => {
                                        setManualTopupOrder(null);
                                        setTotpCode("");
                                        setNewCustomerNo("");
                                    }}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleManualTopup}
                                    disabled={manualTopupLoading || totpCode.length !== 6 || !newCustomerNo}
                                    className="flex-1 bg-primary hover:bg-primary/80 text-white px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 text-sm font-medium"
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
                            <div className="bg-red-500/5 border border-red-500/15 rounded-lg p-3 flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                                <p className="text-xs text-red-400/80">Aksi ini akan mengirim topup ke Digiflazz. Pastikan data sudah benar.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
