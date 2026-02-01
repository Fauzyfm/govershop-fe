"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Loader2, Package, ArrowRight, Calendar, Smartphone } from "lucide-react";
import api from "@/lib/api";
import { APIResponse, OrderHistoryResponse } from "@/types/api";

export default function TrackOrderPage() {
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState<OrderHistoryResponse[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone) return;

        setLoading(true);
        setError(null);
        setHasSearched(true);
        setOrders([]);

        try {
            const res = await api.get<any, APIResponse<{ orders: OrderHistoryResponse[] }>>(`/orders/track?phone=${phone}`);
            if (res.success && res.data) {
                setOrders(res.data.orders || []);
            } else {
                setOrders([]);
            }
        } catch (err: any) {
            console.error("Tracking failed", err);
            setError("Gagal melacak pesanan. Pastikan nomor HP benar.");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'processing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'failed': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-gray-500/10 text-gray-400 border-white/5';
        }
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <div className="text-center space-y-4 mb-10">
                <h1 className="text-3xl font-bold">Lacak Pesanan</h1>
                <p className="text-muted-foreground">
                    Masukkan nomor handphone yang kamu gunakan saat membeli untuk melihat riwayat pesanan.
                </p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="mb-12">
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Contoh: 081234567890"
                            className="w-full bg-secondary/30 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !phone}
                        className="bg-primary hover:bg-primary/90 text-black font-bold px-8 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Search className="w-5 h-5" />}
                        <span>Cari</span>
                    </button>
                </div>
            </form>

            {/* Results */}
            <div className="space-y-6">
                {hasSearched && orders.length === 0 && !loading && !error && (
                    <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
                        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">Tidak Ada Pesanan</h3>
                        <p className="text-muted-foreground">
                            Kami tidak menemukan pesanan dengan nomor tersebut.
                        </p>
                    </div>
                )}

                {orders.map((order) => (
                    <Link
                        key={order.id}
                        href={`/payment/${order.id}`}
                        className="block glass p-6 rounded-2xl border border-white/5 hover:border-primary/50 transition-colors group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                                    {order.product_name}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(order.created_at).toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                                {order.status_label}
                            </div>
                        </div>

                        <div className="flex justify-between items-end border-t border-white/5 pt-4">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Total Pembayaran</p>
                                <p className="font-bold text-lg">Rp {order.price.toLocaleString('id-ID')}</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-primary font-medium">
                                Lihat Detail
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
