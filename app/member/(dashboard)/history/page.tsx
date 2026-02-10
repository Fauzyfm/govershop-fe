"use client";

import { useState, useEffect, useCallback } from "react";
import { History, ArrowUpCircle, ArrowDownCircle, ChevronLeft, ChevronRight, AlertCircle, Filter } from "lucide-react";
import api from "@/lib/api";

interface Deposit {
    id: number;
    amount: number;
    type: string;
    description: string;
    created_by: string;
    created_at: string;
}

function getToday() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

export default function MemberHistoryPage() {
    const [deposits, setDeposits] = useState<Deposit[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const limit = 10;

    // Filter states
    const [dateFrom, setDateFrom] = useState(getToday());
    const [dateTo, setDateTo] = useState(getToday());
    const [typeFilter, setTypeFilter] = useState("all");

    const fetchDeposits = useCallback(async () => {
        setIsLoading(true);
        try {
            const offset = (page - 1) * limit;
            const params = new URLSearchParams({
                limit: String(limit),
                offset: String(offset),
                date_from: dateFrom,
                date_to: dateTo,
            });
            if (typeFilter !== "all") params.set("type", typeFilter);

            const data: any = await api.get(`/member/deposits?${params.toString()}`);
            if (data.success) {
                setDeposits(data.deposits || []);
                setTotal(data.total || 0);
            }
        } catch (error) {
            console.error("Error fetching deposits:", error);
        } finally {
            setIsLoading(false);
        }
    }, [page, dateFrom, dateTo, typeFilter]);

    useEffect(() => {
        fetchDeposits();
    }, [fetchDeposits]);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [dateFrom, dateTo, typeFilter]);

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <History className="w-7 h-7 text-(--primary)" />
                Riwayat Transaksi
            </h1>

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

                    {/* Type Filter */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-500">Tipe</label>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white/30 transition-colors appearance-none pr-8"
                        >
                            <option value="all" className="bg-slate-800">Semua Tipe</option>
                            <option value="credit" className="bg-slate-800">Masuk (Credit)</option>
                            <option value="debit" className="bg-slate-800">Keluar (Debit)</option>
                            <option value="refund" className="bg-slate-800">Refund</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
                {isLoading ? (
                    <div className="p-10 text-center">
                        <div className="w-8 h-8 border-2 border-(--primary) border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                ) : deposits.length === 0 ? (
                    <div className="p-10 text-center text-(--muted-foreground)">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Tidak ada riwayat transaksi ditemukan</p>
                        <p className="text-xs mt-1 opacity-70">Coba ubah filter atau rentang tanggal</p>
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
                                    const isCredit = d.type === "credit" || d.type === "topup" || d.type === "refund";
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
                                                {new Date(d.created_at).toLocaleString("id-ID", {
                                                    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                                                    timeZone: "UTC"
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
                <div className="flex items-center justify-between p-4 border-t border-white/10">
                    <span className="text-sm text-(--muted-foreground)">
                        {total > 0 ? `Menampilkan ${(page - 1) * limit + 1}–${Math.min(page * limit, total)} dari ${total} transaksi` : "0 transaksi"}
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
