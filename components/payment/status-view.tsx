"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { Copy, RefreshCw, CheckCircle, AlertCircle, Clock, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { APIResponse, OrderStatusResponse, OrderStatus } from "@/types/api";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface StatusViewProps {
    orderId: string;
}

// Helper to determine if payment is QR or VA
const isQRIS = (method: string) => method?.toLowerCase().includes('qris');

export default function StatusView({ orderId }: StatusViewProps) {
    const [order, setOrder] = useState<OrderStatusResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState<string>("");
    const [expired, setExpired] = useState(false);

    // Fetch Status
    const fetchStatus = async (isManual = false) => {
        if (isManual) setRefreshing(true);
        try {
            const res = await api.get<any, APIResponse<OrderStatusResponse>>(`/orders/${orderId}/status`);
            if (res.success && res.data) {
                setOrder(res.data);
                setError(null);
            }
        } catch (err: any) {
            console.error("Failed to fetch status", err);
            setError("Gagal memuat status order");
        } finally {
            setLoading(false);
            if (isManual) setRefreshing(false);
        }
    };

    // Initial Load
    useEffect(() => {
        fetchStatus();
    }, [orderId]);

    // Countdown Timer logic
    useEffect(() => {
        if (!order || !order.payment?.expired_at) return;

        // If status is final, stop timer
        if (['success', 'paid', 'processing', 'failed', 'cancelled', 'refunded'].includes(order.status)) {
            setTimeLeft("");
            return;
        }

        const expireTime = new Date(order.payment.expired_at).getTime();

        const updateTimer = () => {
            const now = new Date().getTime();
            const diff = expireTime - now;

            if (diff <= 0) {
                setExpired(true);
                setTimeLeft("00:00:00");
                return;
            }

            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
        };

        const timer = setInterval(updateTimer, 1000);
        updateTimer(); // Initial call

        return () => clearInterval(timer);
    }, [order]);

    // Determine status display
    const getStatusConfig = (status: OrderStatus) => {
        if (expired && (status === 'pending' || status === 'waiting_payment')) {
            return {
                color: 'text-red-400',
                bg: 'bg-red-500/10',
                icon: AlertCircle,
                label: 'Kadaluwarsa',
                description: 'Waktu pembayaran telah habis. Silakan buat pesanan baru.'
            };
        }

        switch (status) {
            case 'success':
                return {
                    color: 'text-green-400',
                    bg: 'bg-green-500/10',
                    icon: CheckCircle,
                    label: 'Berhasil',
                    description: 'Top up berhasil! Item sudah masuk ke akun kamu.'
                };
            case 'paid':
            case 'processing':
                return {
                    color: 'text-blue-400',
                    bg: 'bg-blue-500/10',
                    icon: Loader2,
                    label: 'Diproses',
                    description: 'Pembayaran diterima, sedang memproses top up...',
                    animate: true
                };
            case 'failed':
                return {
                    color: 'text-red-400',
                    bg: 'bg-red-500/10',
                    icon: AlertCircle,
                    label: 'Gagal',
                    description: 'Transaksi gagal. Silakan hubungi support.'
                };
            case 'cancelled':
            case 'refunded':
                return {
                    color: 'text-gray-400',
                    bg: 'bg-gray-500/10',
                    icon: AlertCircle,
                    label: 'Dibatalkan',
                    description: 'Transaksi telah dibatalkan.'
                };
            default: // pending
                return {
                    color: 'text-yellow-400',
                    bg: 'bg-yellow-500/10',
                    icon: Clock,
                    label: 'Menunggu Pembayaran',
                    description: 'Silakan lakukan pembayaran sebelum waktu habis.'
                };
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Toast could be better here
    };

    const getPaymentLabel = (method: string) => {
        if (!method) return "";
        const labels: Record<string, string> = {
            'qris': 'QRIS',
            'bni_va': 'BNI Virtual Account',
            'bri_va': 'BRI Virtual Account',
            'mandiri_va': 'Mandiri Virtual Account',
            'permata_va': 'Permata Virtual Account',
            'cimb_niaga_va': 'CIMB Niaga Virtual Account'
        };
        return labels[method] || method.toUpperCase();
    };

    // Loading state
    if (loading && !order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <RefreshCw className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Memuat status pesanan...</p>
            </div>
        );
    }

    // Error state
    if (error && !order) {
        return (
            <div className="text-center py-20">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Order Tidak Ditemukan</h2>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Link href="/" className="text-primary hover:underline">Kembali ke Beranda</Link>
            </div>
        );
    }

    if (!order) return null;

    const statusConfig = getStatusConfig(order.status);
    const StatusIcon = statusConfig.icon;
    const isWaitingPayment = !expired && (order.status === 'pending' || order.status === 'waiting_payment');
    const payment = order.payment;

    return (
        <div className="max-w-xl mx-auto space-y-6">
            {/* Status Header */}
            <div className="text-center space-y-3">
                <div className={cn(
                    "inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-lg font-semibold",
                    statusConfig.bg,
                    statusConfig.color
                )}>
                    <StatusIcon className={cn("w-5 h-5", statusConfig.animate && "animate-spin")} />
                    <span>{statusConfig.label}</span>
                </div>
                <p className="text-muted-foreground text-sm">{statusConfig.description}</p>

                {/* Countdown Timer */}
                {isWaitingPayment && timeLeft && (
                    <div className="text-2xl font-mono font-bold text-primary animate-pulse py-2">
                        {timeLeft}
                    </div>
                )}
            </div>

            {/* Payment Card */}
            <div className="glass p-6 rounded-2xl border border-white/10 space-y-6">

                {/* Show QR/VA only when waiting for payment */}
                {isWaitingPayment && payment && (
                    <>
                        {/* Payment Method Label */}
                        <div className="text-center">
                            <span className="text-xs uppercase tracking-wider text-muted-foreground">
                                Metode Pembayaran
                            </span>
                            <p className="font-bold text-lg break-words">{getPaymentLabel(payment.payment_method)}</p>
                        </div>

                        {/* QR Code for QRIS */}
                        {payment.qr_string && (
                            <div className="flex flex-col items-center space-y-4">
                                <div className="bg-white p-4 rounded-xl">
                                    <QRCode value={payment.qr_string} size={200} />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Scan QR code dengan aplikasi e-wallet atau mobile banking
                                </p>
                            </div>
                        )}

                        {/* VA Number for Virtual Account */}
                        {payment.va_number && (
                            <div className="text-center space-y-3">
                                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                                    Nomor Virtual Account
                                </span>
                                <div className="flex items-center justify-center gap-3 bg-secondary/30 p-4 rounded-xl">
                                    <span className="text-2xl font-mono font-bold tracking-widest">
                                        {payment.va_number}
                                    </span>
                                    <button
                                        onClick={() => copyToClipboard(payment.va_number || "")}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                        title="Salin"
                                    >
                                        <Copy className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Amount */}
                        <div className="border-t border-white/10 pt-4">
                            <div className="flex justify-between items-center mb-2 text-sm text-muted-foreground">
                                <span>Harga</span>
                                <span>Rp {payment.amount?.toLocaleString('id-ID')}</span>
                            </div>
                            {payment.fee > 0 && (
                                <div className="flex justify-between items-center mb-2 text-sm text-muted-foreground">
                                    <span>Fee Transaksi</span>
                                    <span>Rp {payment.fee?.toLocaleString('id-ID')}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                <span className="font-medium">Total Bayar</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-primary">
                                        Rp {payment.total_payment?.toLocaleString('id-ID')}
                                    </span>
                                    <button
                                        onClick={() => copyToClipboard(payment.total_payment?.toString() || '')}
                                        className="p-1 hover:bg-white/10 rounded transition-colors"
                                    >
                                        <Copy className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Manual Check Button */}
                        <button
                            onClick={() => fetchStatus(true)}
                            disabled={refreshing}
                            className="w-full py-3 bg-secondary hover:bg-secondary/80 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            {refreshing ? <Loader2 className="animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                            Cek Status Pembayaran
                        </button>
                    </>
                )}

                {/* Expired State */}
                {expired && (
                    <div className="text-center py-6">
                        <Link
                            href="/"
                            className="inline-block px-6 py-3 bg-primary text-black font-bold rounded-xl"
                        >
                            Buat Pesanan Baru
                        </Link>
                    </div>
                )}

                {/* Success State */}
                {order.status === 'success' && (
                    <div className="text-center py-6 space-y-4">
                        <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-10 h-10 text-green-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Transaksi Berhasil!</h3>
                            <p className="text-muted-foreground text-sm">
                                Top up sudah masuk ke akun game kamu.
                            </p>
                        </div>
                        {order.serial_number && (
                            <div className="bg-secondary/30 p-3 rounded-lg">
                                <span className="text-xs text-muted-foreground">Serial Number</span>
                                <p className="font-mono text-sm">{order.serial_number}</p>
                            </div>
                        )}
                        <Link href="/" className="block w-full py-3 bg-primary text-black font-bold rounded-xl mt-4">
                            Top Up Lagi
                        </Link>
                    </div>
                )}

                {/* Processing/Paid State */}
                {(order.status === 'paid' || order.status === 'processing') && (
                    <div className="text-center py-6 space-y-4">
                        <div className="w-20 h-20 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center">
                            <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Sedang Diproses</h3>
                            <p className="text-muted-foreground text-sm">
                                Pembayaran diterima! Top up sedang diproses...
                            </p>
                        </div>
                        <button
                            onClick={() => fetchStatus(true)}
                            className="text-sm text-primary hover:underline"
                        >
                            Refresh Status
                        </button>
                    </div>
                )}
            </div>

            {/* Order Info */}
            <div className="text-center space-y-1">
                <p className="text-xs text-muted-foreground">
                    Order ID: <span className="font-mono">{order.order_id}</span>
                </p>
            </div>
        </div>
    );
}
