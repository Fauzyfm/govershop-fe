"use client";

import { useState, useEffect, useCallback } from "react";
import { History, ArrowUpCircle, ArrowDownCircle, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import api from "@/lib/api";

interface Deposit {
    id: number;
    amount: number;
    type: string;
    description: string;
    created_by: string;
    created_at: string;
}

export default function MemberHistoryPage() {
    const [deposits, setDeposits] = useState<Deposit[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const limit = 15;

    const fetchDeposits = useCallback(async () => {
        setIsLoading(true);
        try {
            const offset = (page - 1) * limit;
            const data: any = await api.get(`/member/deposits?limit=${limit}&offset=${offset}`);
            if (data.success) {
                setDeposits(data.deposits || []);
                setTotal(data.total || 0);
            }
        } catch (error) {
            console.error("Error fetching deposits:", error);
        } finally {
            setIsLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchDeposits();
    }, [fetchDeposits]);

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <History className="w-7 h-7 text-(--primary)" />
                Riwayat Transaksi
            </h1>

            <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
                {isLoading ? (
                    <div className="p-10 text-center">
                        <div className="w-8 h-8 border-2 border-(--primary) border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                ) : deposits.length === 0 ? (
                    <div className="p-10 text-center text-(--muted-foreground)">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Belum ada riwayat transaksi</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-(--card)/50 border-b border-white/10">
                                <tr>
                                    <th className="text-left p-4 text-(--muted-foreground) font-medium">Tipe</th>
                                    <th className="text-left p-4 text-(--muted-foreground) font-medium">Deskripsi</th>
                                    <th className="text-right p-4 text-(--muted-foreground) font-medium">Jumlah</th>
                                    <th className="text-left p-4 text-(--muted-foreground) font-medium">Oleh</th>
                                    <th className="text-left p-4 text-(--muted-foreground) font-medium">Tanggal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deposits.map((d) => {
                                    const isCredit = d.type === "credit" || d.type === "topup";
                                    return (
                                        <tr key={d.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${isCredit ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"}`}>
                                                    {isCredit ? <ArrowUpCircle className="w-3 h-3" /> : <ArrowDownCircle className="w-3 h-3" />}
                                                    {isCredit ? "Masuk" : "Keluar"}
                                                </span>
                                            </td>
                                            <td className="p-4 text-white">{d.description}</td>
                                            <td className={`p-4 text-right font-medium ${isCredit ? "text-green-400" : "text-red-400"}`}>
                                                {isCredit ? "+" : "-"} Rp {d.amount.toLocaleString("id-ID")}
                                            </td>
                                            <td className="p-4 text-slate-400">{d.created_by || "System"}</td>
                                            <td className="p-4 text-slate-400 text-xs">
                                                {new Date(d.created_at).toLocaleDateString("id-ID", {
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
                            Menampilkan {deposits.length} dari {total} transaksi
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
