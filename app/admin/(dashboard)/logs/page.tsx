"use client";

import { useState, useEffect } from "react";
import {
    Activity,
    Webhook,
    RefreshCw,
    CheckCircle,
    XCircle,
    Clock,
    Search,
    Eye
} from "lucide-react";
import api from "@/lib/api";
import Modal from "@/components/ui/modal";

interface SyncLog {
    id: number;
    sync_type: string;
    total_products: number;
    new_products: number;
    updated_products: number;
    failed_products: number;
    status: string;
    error_message?: string;
    started_at: string;
    completed_at?: string;
}

interface WebhookLog {
    id: number;
    source: string;
    payload: string;
    processed: boolean;
    error_message?: string;
    created_at: string;
}

export default function LogsPage() {
    const [activeTab, setActiveTab] = useState<"webhook" | "sync">("webhook");
    const [loading, setLoading] = useState(false);

    // Data
    const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
    const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);

    // Pagination
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [total, setTotal] = useState(0);

    // Modal
    const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
    const [errorDetail, setErrorDetail] = useState<string | null>(null);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const offset = (page - 1) * limit;
            const endpoint = activeTab === "webhook"
                ? `/admin/logs/webhook?limit=${limit}&offset=${offset}`
                : `/admin/logs/sync?limit=${limit}&offset=${offset}`;

            const response = await api.get(endpoint);
            const data = response.data;

            if (activeTab === "webhook") {
                setWebhookLogs(data?.logs || []);
            } else {
                setSyncLogs(data?.logs || []);
            }
            setTotal(data?.total || 0);
        } catch (error) {
            console.error("Failed to fetch logs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [activeTab, page]);

    const handleTabChange = (tab: "webhook" | "sync") => {
        setActiveTab(tab);
        setPage(1);
    };

    // Format helpers
    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    };

    const getDuration = (start: string, end?: string) => {
        if (!end) return "Running...";
        const diff = new Date(end).getTime() - new Date(start).getTime();
        const seconds = Math.floor(diff / 1000);
        return `${seconds}s`;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_10px_var(--primary)]" />
                        System Logs
                    </h1>
                    <p className="text-white/50 text-sm mt-1 ml-4">Monitor webhook events and product synchronization history</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchLogs}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/70 transition-colors border border-white/5"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/10 pb-2">
                <button
                    onClick={() => handleTabChange("webhook")}
                    className={`pb-2 px-4 flex items-center gap-2 font-medium transition-all relative rounded-t-xl border-b-2 ${activeTab === "webhook"
                        ? "text-white border-primary bg-white/5"
                        : "text-white/40 border-transparent hover:text-white hover:bg-white/5"
                        }`}
                >
                    <Webhook className={`w-4 h-4 ${activeTab === "webhook" ? "text-primary" : ""}`} />
                    Webhook Logs
                </button>
                <button
                    onClick={() => handleTabChange("sync")}
                    className={`pb-2 px-4 flex items-center gap-2 font-medium transition-all relative rounded-t-xl border-b-2 ${activeTab === "sync"
                        ? "text-white border-emerald-500 bg-emerald-500/5"
                        : "text-white/40 border-transparent hover:text-white hover:bg-white/5"
                        }`}
                >
                    <RefreshCw className={`w-4 h-4 ${activeTab === "sync" ? "text-emerald-500" : ""}`} />
                    Sync Logs
                </button>
            </div>

            {/* Content */}
            <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-white/40 uppercase bg-white/5 border-b border-white/5">
                            <tr>
                                {activeTab === "webhook" ? (
                                    <>
                                        <th className="px-6 py-4 font-semibold">ID</th>
                                        <th className="px-6 py-4 font-semibold">Source</th>
                                        <th className="px-6 py-4 font-semibold">Payload</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold">Time</th>
                                        <th className="px-6 py-4 text-right font-semibold">Action</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-6 py-4 font-semibold">ID</th>
                                        <th className="px-6 py-4 font-semibold">Type</th>
                                        <th className="px-6 py-4 font-semibold">Stats</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold">Duration</th>
                                        <th className="px-6 py-4 text-right font-semibold">Started At</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-white/30">
                                        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
                                        Loading logs...
                                    </td>
                                </tr>
                            ) : activeTab === "webhook" ? (
                                webhookLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-white/30">
                                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                                                <Webhook className="w-6 h-6 opacity-50" />
                                            </div>
                                            No webhook logs found
                                        </td>
                                    </tr>
                                ) : (
                                    webhookLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4 text-white/70 group-hover:text-white font-mono text-xs">#{log.id}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${log.source === "pakasir"
                                                    ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                                    : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                                                    }`}>
                                                    {log.source}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-white/40 font-mono text-[10px] max-w-xs truncate">
                                                {log.payload.substring(0, 50)}...
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {log.processed ? (
                                                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                                            <CheckCircle className="w-3 h-3" /> Processed
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 text-white/50 text-[10px] font-medium border border-white/10">
                                                            <Clock className="w-3 h-3" /> Pending
                                                        </span>
                                                    )}
                                                    {log.error_message && (
                                                        <button
                                                            onClick={() => setErrorDetail(log.error_message || "")}
                                                            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[10px] font-medium border border-red-500/20 hover:bg-red-500/20 transition-colors shadow-[0_0_10px_rgba(248,113,113,0.1)]"
                                                        >
                                                            <XCircle className="w-3 h-3" /> Error
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-white/60 text-xs">{formatDate(log.created_at)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setSelectedLog(log)}
                                                    className="p-2 hover:bg-primary/20 rounded-full text-white/40 hover:text-primary transition-colors"
                                                    title="View Detail"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )
                            ) : (
                                // Sync Logs
                                syncLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-white/30">
                                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                                                <RefreshCw className="w-6 h-6 opacity-50" />
                                            </div>
                                            No sync logs found
                                        </td>
                                    </tr>
                                ) : (
                                    syncLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4 text-white/70 group-hover:text-white font-mono text-xs">#{log.id}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-500/20">
                                                    {log.sync_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono">
                                                <div className="flex gap-3 text-white/40">
                                                    <span title="Total">T: <span className="text-white">{log.total_products}</span></span>
                                                    <span title="New" className="text-emerald-400">+<span className="text-emerald-400/80">{log.new_products}</span></span>
                                                    <span title="Updated" className="text-blue-400">~<span className="text-blue-400/80">{log.updated_products}</span></span>
                                                    <span title="Failed" className="text-red-400">!<span className="text-red-400/80">{log.failed_products}</span></span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`flex w-fit items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border shadow-[0_0_10px_rgba(0,0,0,0.1)] ${log.status === "success"
                                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                        : log.status === "running"
                                                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                            : "bg-red-500/10 text-red-400 border-red-500/20"
                                                        }`}>
                                                        {log.status === "success" ? <CheckCircle className="w-3 h-3" /> :
                                                            log.status === "running" ? <RefreshCw className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                                                        {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                                                    </span>
                                                    {log.error_message && (
                                                        <button
                                                            onClick={() => setErrorDetail(log.error_message || "")}
                                                            className="p-1 px-2 rounded-full bg-red-500/10 text-red-400 text-[10px] hover:bg-red-500/20 transition-colors border border-red-500/20"
                                                        >
                                                            Detail
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-white/60 text-xs font-mono">
                                                {getDuration(log.started_at, log.completed_at)}
                                            </td>
                                            <td className="px-6 py-4 text-white/60 text-xs text-right">
                                                {formatDate(log.started_at)}
                                            </td>
                                        </tr>
                                    ))
                                )
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-black/20">
                    <span className="text-xs text-white/40">
                        Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} entries
                    </span>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1 || loading}
                            onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1.5 text-xs rounded-lg bg-white/5 disabled:opacity-30 hover:bg-white/10 text-white/70 hover:text-white transition-colors border border-white/5"
                        >
                            Previous
                        </button>
                        <button
                            disabled={page * limit >= total || loading}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1.5 text-xs rounded-lg bg-white/5 disabled:opacity-30 hover:bg-white/10 text-white/70 hover:text-white transition-colors border border-white/5"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Webhook Detail Modal */}
            <Modal
                isOpen={!!selectedLog}
                onClose={() => setSelectedLog(null)}
                title={`Webhook Log #${selectedLog?.id}`}
            >
                <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4 text-sm bg-white/5 p-4 rounded-xl border border-white/5">
                        <div>
                            <span className="block text-white/40 text-xs mb-1">Source</span>
                            <span className="text-white font-mono text-xs px-2 py-0.5 rounded bg-white/5 border border-white/5 inline-block">{selectedLog?.source}</span>
                        </div>
                        <div>
                            <span className="block text-white/40 text-xs mb-1">Time</span>
                            <span className="text-white font-medium text-xs">{selectedLog && formatDate(selectedLog.created_at)}</span>
                        </div>
                        <div>
                            <span className="block text-white/40 text-xs mb-1">Status</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded inline-block ${selectedLog?.processed ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
                                {selectedLog?.processed ? "Processed" : "Pending"}
                            </span>
                        </div>
                        {selectedLog?.error_message && (
                            <div className="col-span-2 mt-2 pt-2 border-t border-white/5">
                                <span className="block text-red-400/80 text-xs mb-1">Error</span>
                                <span className="text-red-400 text-xs bg-red-500/5 p-2 rounded block">{selectedLog.error_message}</span>
                            </div>
                        )}
                    </div>

                    <div>
                        <span className="block text-white/40 text-xs mb-2 pl-1">Payload</span>
                        <div className="bg-black/40 p-4 rounded-xl border border-white/10 overflow-auto max-h-[300px] custom-scrollbar">
                            <pre className="text-[10px] text-emerald-400 font-mono whitespace-pre-wrap break-all leading-relaxed">
                                {selectedLog?.payload ? JSON.stringify(JSON.parse(selectedLog.payload), null, 2) : "-"}
                            </pre>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-white/5">
                        <button
                            onClick={() => setSelectedLog(null)}
                            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors text-sm font-medium"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Error Detail Modal */}
            <Modal
                isOpen={!!errorDetail}
                onClose={() => setErrorDetail(null)}
                title="Error Detail"
            >
                <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400 text-sm font-mono overflow-auto max-h-[300px]">
                        {errorDetail}
                    </div>
                    <div className="flex justify-end pt-2 border-t border-white/5">
                        <button
                            onClick={() => setErrorDetail(null)}
                            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors text-sm font-medium"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
