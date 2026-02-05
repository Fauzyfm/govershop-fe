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
                    <h1 className="text-2xl font-bold text-white">System Logs</h1>
                    <p className="text-slate-400">Monitor webhook events and product synchronization history</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchLogs}
                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-700">
                <button
                    onClick={() => handleTabChange("webhook")}
                    className={`pb-3 px-2 flex items-center gap-2 font-medium transition-colors relative ${activeTab === "webhook"
                        ? "text-blue-400"
                        : "text-slate-400 hover:text-slate-200"
                        }`}
                >
                    <Webhook className="w-4 h-4" />
                    Webhook Logs
                    {activeTab === "webhook" && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => handleTabChange("sync")}
                    className={`pb-3 px-2 flex items-center gap-2 font-medium transition-colors relative ${activeTab === "sync"
                        ? "text-emerald-400"
                        : "text-slate-400 hover:text-slate-200"
                        }`}
                >
                    <RefreshCw className="w-4 h-4" />
                    Sync Logs
                    {activeTab === "sync" && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400 rounded-t-full" />
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="bg-slate-800/50 rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
                            <tr>
                                {activeTab === "webhook" ? (
                                    <>
                                        <th className="px-6 py-3">ID</th>
                                        <th className="px-6 py-3">Source</th>
                                        <th className="px-6 py-3">Payload</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Time</th>
                                        <th className="px-6 py-3 text-right">Action</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-6 py-3">ID</th>
                                        <th className="px-6 py-3">Type</th>
                                        <th className="px-6 py-3">Stats</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Duration</th>
                                        <th className="px-6 py-3 text-right">Started At</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                                        Loading logs...
                                    </td>
                                </tr>
                            ) : activeTab === "webhook" ? (
                                webhookLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                                            No webhook logs found
                                        </td>
                                    </tr>
                                ) : (
                                    webhookLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-700/30 transition-colors">
                                            <td className="px-6 py-4 text-slate-300">#{log.id}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${log.source === "pakasir"
                                                    ? "bg-purple-500/10 text-purple-400"
                                                    : "bg-orange-500/10 text-orange-400"
                                                    }`}>
                                                    {log.source}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 font-mono text-xs max-w-xs truncate">
                                                {log.payload.substring(0, 50)}...
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {log.processed ? (
                                                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-medium border border-emerald-500/20">
                                                            <CheckCircle className="w-3 h-3" /> Processed
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500 text-[10px] font-medium border border-slate-500/20">
                                                            <Clock className="w-3 h-3" /> Pending
                                                        </span>
                                                    )}
                                                    {log.error_message && (
                                                        <button
                                                            onClick={() => setErrorDetail(log.error_message || "")}
                                                            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-medium border border-red-500/20 hover:bg-red-500/20 transition-colors"
                                                        >
                                                            <XCircle className="w-3 h-3" /> Detail Error
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400">{formatDate(log.created_at)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setSelectedLog(log)}
                                                    className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
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
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                                            No sync logs found
                                        </td>
                                    </tr>
                                ) : (
                                    syncLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-700/30 transition-colors">
                                            <td className="px-6 py-4 text-slate-300">#{log.id}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-xs font-mono">
                                                    {log.sync_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs">
                                                <div className="flex gap-3 text-slate-400">
                                                    <span title="Total">Total: <span className="text-white">{log.total_products}</span></span>
                                                    <span title="New" className="text-emerald-400">+{log.new_products}</span>
                                                    <span title="Updated" className="text-blue-400">~{log.updated_products}</span>
                                                    <span title="Failed" className="text-red-400">!{log.failed_products}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`flex w-fit items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${log.status === "success"
                                                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                        : log.status === "running"
                                                            ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                                            : "bg-red-500/10 text-red-500 border-red-500/20"
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
                                                            Detail Error
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 text-xs font-mono">
                                                {getDuration(log.started_at, log.completed_at)}
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 text-right">
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
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700/50 bg-slate-900/30">
                    <span className="text-sm text-slate-400">
                        Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} entries
                    </span>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1 || loading}
                            onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1 text-sm rounded bg-slate-800 disabled:opacity-50 hover:bg-slate-700 text-slate-300 transition-colors"
                        >
                            Previous
                        </button>
                        <button
                            disabled={page * limit >= total || loading}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 text-sm rounded bg-slate-800 disabled:opacity-50 hover:bg-slate-700 text-slate-300 transition-colors"
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
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="block text-slate-400 text-xs">Source</span>
                            <span className="text-white font-medium">{selectedLog?.source}</span>
                        </div>
                        <div>
                            <span className="block text-slate-400 text-xs">Time</span>
                            <span className="text-white font-medium">{selectedLog && formatDate(selectedLog.created_at)}</span>
                        </div>
                        <div>
                            <span className="block text-slate-400 text-xs">Status</span>
                            <span className={selectedLog?.processed ? "text-emerald-400" : "text-amber-400"}>
                                {selectedLog?.processed ? "Processed" : "Pending"}
                            </span>
                        </div>
                        {selectedLog?.error_message && (
                            <div className="col-span-2">
                                <span className="block text-slate-400 text-xs">Error</span>
                                <span className="text-red-400">{selectedLog.error_message}</span>
                            </div>
                        )}
                    </div>

                    <div>
                        <span className="block text-slate-400 text-xs mb-2">Payload</span>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 overflow-auto max-h-[300px]">
                            <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap break-all">
                                {selectedLog?.payload ? JSON.stringify(JSON.parse(selectedLog.payload), null, 2) : "-"}
                            </pre>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            onClick={() => setSelectedLog(null)}
                            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
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
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {errorDetail}
                    </div>
                    <div className="flex justify-end pt-2">
                        <button
                            onClick={() => setErrorDetail(null)}
                            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
