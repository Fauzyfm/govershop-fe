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
    const [cancellingExpired, setCancellingExpired] = useState(false);
    const [cancelling, setCancelling] = useState(false);

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

    // User-initiated Cancel Order
    const handleCancelOrder = async () => {
        if (!confirm("Apakah Anda yakin ingin membatalkan pesanan ini?")) return;

        setCancelling(true);
        try {
            await api.post(`/orders/${orderId}/cancel`);
            alert("Pesanan berhasil dibatalkan");
            fetchStatus(true);
        } catch (err: any) {
            console.error("Failed to cancel order:", err);
            alert("Gagal membatalkan pesanan. Silakan coba lagi.");
        } finally {
            setCancelling(false);
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

    // Auto-cancel expired orders (only if order is still cancellable)
    useEffect(() => {
        const cancelExpiredOrder = async () => {
            // Only try to cancel if expired AND order is still in cancellable state
            const isCancellable = order?.status === 'pending' || order?.status === 'waiting_payment';

            if (expired && order && !cancellingExpired && isCancellable) {
                setCancellingExpired(true);
                try {
                    await api.post(`/orders/${orderId}/cancel`);
                    console.log('Expired order cancelled');
                    // Refresh to get updated status
                    fetchStatus(false);
                } catch (err) {
                    // Silently handle - order may already be cancelled/expired
                    console.log('Order already processed or cancelled');
                }
            }
        };
        cancelExpiredOrder();
    }, [expired, order, orderId, cancellingExpired]);

    // Determine status display
    const getStatusConfig = (status: OrderStatus, customMessage?: string) => {
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
                    bg: 'bg-green-500/10 border border-green-500/20',
                    icon: CheckCircle,
                    label: 'Berhasil',
                    description: 'Top up berhasil! Item sudah masuk ke akun kamu.'
                };
            case 'paid':
            case 'processing':
                return {
                    color: 'text-blue-400',
                    bg: 'bg-blue-500/10 border border-blue-500/20',
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
                    description: customMessage ? `Proses Gagal dikarenakan : ${customMessage}` : 'Transaksi gagal. Silakan hubungi admin.'
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
            case 'expired':
                return {
                    color: 'text-orange-400',
                    bg: 'bg-orange-500/10',
                    icon: Clock,
                    label: 'Kadaluwarsa',
                    description: 'Waktu pembayaran telah habis. Silakan buat pesanan baru.'
                };
            default: // pending
                return {
                    color: 'text-orange-400',
                    bg: 'bg-orange-500/10 border border-orange-500/20',
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

    const statusConfig = getStatusConfig(order.status, order.message);
    const StatusIcon = statusConfig.icon;
    const isWaitingPayment = !expired && (order.status === 'pending' || order.status === 'waiting_payment');
    const payment = order.payment;

    return (
        <div className="max-w-xl mx-auto space-y-6">
            {/* Status Header */}
            <div className="text-center space-y-3">
                <div className={cn(
                    "inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-lg font-semibold shadow-[0_0_15px_rgba(0,0,0,0.5)]",
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
            <div className="glass p-6 rounded-2xl border border-primary/15 space-y-6">

                {/* Show QR/VA only when waiting for payment */}
                {isWaitingPayment && payment && (
                    <>
                        {/* Payment Method Label */}
                        <div className="text-center">
                            <span className="text-xs uppercase tracking-wider text-muted-foreground">
                                Metode Pembayaran
                            </span>
                            <p className="font-bold text-lg wrap-break-word">{getPaymentLabel(payment.payment_method)}</p>
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
                        <div className="border-t border-primary/10 pt-4">
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
                            className="arcade-btn w-full py-3 text-primary-foreground rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            {refreshing ? <Loader2 className="animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                            Cek Status Pembayaran
                        </button>

                        {/* Cancel Order Button */}
                        <button
                            onClick={handleCancelOrder}
                            disabled={cancelling}
                            className="w-full py-3 border border-red-500/30 hover:bg-red-500/10 text-red-400 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            {cancelling ? <Loader2 className="animate-spin w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                            Batalkan Pesanan
                        </button>
                    </>
                )}

                {/* Expired State */}
                {expired && (
                    <div className="text-center py-6">
                        <Link
                            href="/"
                            className="arcade-btn inline-block px-6 py-3 text-primary-foreground font-bold rounded-xl"
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
                        <Link href="/" className="arcade-btn block w-full py-3 text-primary-foreground font-bold rounded-xl mt-4 text-center">
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
                {/* Failed State */}
                {order.status === 'failed' && (
                    <div className="text-center py-6 space-y-4">
                        <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Transaksi Gagal</h3>
                            <p className="text-muted-foreground text-sm px-4">
                                {order.message || "Terjadi kesalahan pada sistem."}
                            </p>
                        </div>

                        <a
                            href={`https://wa.me/6283114014648?text=${encodeURIComponent(`Halo Admin, saya mengalami kendala gagal order dengan Order ID: ${order.order_id} dan ref-id : ${order.ref_id || '-'}, Mohon bantuannya.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="arcade-btn block w-full py-3 text-primary-foreground font-bold rounded-xl mt-4 text-center"
                        >
                            Hubungi Admin (WhatsApp)
                        </a>

                        <Link href="/" className="block w-full py-3 bg-secondary hover:bg-secondary/80 text-white font-bold rounded-xl mt-2 transition-colors">
                            Coba Lagi
                        </Link>
                    </div>
                )}
            </div>

            {/* Order Info */}
            <div className="text-center space-y-1">
                <p className="text-xs text-muted-foreground">
                    Order ID: <span className="font-mono">{order.order_id}</span>
                </p>
                {order.ref_id && (
                    <p className="text-xs text-muted-foreground">
                        Ref ID: <span className="font-mono font-medium text-primary">{order.ref_id}</span>
                    </p>
                )}
            </div>
        </div>
    );
}
