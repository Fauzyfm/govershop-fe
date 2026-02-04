"use client";

import { useEffect, useState } from "react";
import {
    Shield,
    QrCode,
    Check,
    AlertCircle,
    Loader2,
    ShieldCheck,
    ShieldOff
} from "lucide-react";
import api from "@/lib/api";

interface TOTPStatus {
    enabled: boolean;
    setup: boolean;
}

interface SetupResponse {
    qr_code: string;
    secret: string;
    issuer: string;
    account: string;
}

export default function AdminSecurityPage() {
    const [status, setStatus] = useState<TOTPStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [setupData, setSetupData] = useState<SetupResponse | null>(null);
    const [code, setCode] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const response: any = await api.get("/admin/totp/status");
            setStatus(response.data);
        } catch (error) {
            console.error("Failed to get TOTP status:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSetup = async () => {
        setActionLoading(true);
        setMessage(null);
        try {
            const response: any = await api.post("/admin/totp/setup");
            setSetupData(response.data);
            setMessage({ type: "success", text: "Scan QR code dengan Google Authenticator" });
        } catch (error: any) {
            setMessage({ type: "error", text: error?.response?.data?.message || "Gagal setup TOTP" });
        } finally {
            setActionLoading(false);
        }
    };

    const handleEnable = async () => {
        if (code.length !== 6) {
            setMessage({ type: "error", text: "Masukkan 6 digit kode" });
            return;
        }

        setActionLoading(true);
        setMessage(null);
        try {
            await api.post("/admin/totp/enable", { code });
            setMessage({ type: "success", text: "2FA berhasil diaktifkan!" });
            setSetupData(null);
            setCode("");
            fetchStatus();
        } catch (error: any) {
            setMessage({ type: "error", text: error?.response?.data?.message || "Kode tidak valid" });
        } finally {
            setActionLoading(false);
        }
    };

    const handleDisable = async () => {
        if (code.length !== 6) {
            setMessage({ type: "error", text: "Masukkan 6 digit kode untuk menonaktifkan" });
            return;
        }

        if (!confirm("Yakin ingin menonaktifkan 2FA? Ini akan mengurangi keamanan akun.")) {
            return;
        }

        setActionLoading(true);
        setMessage(null);
        try {
            await api.post("/admin/totp/disable", { code });
            setMessage({ type: "success", text: "2FA berhasil dinonaktifkan" });
            setCode("");
            fetchStatus();
        } catch (error: any) {
            setMessage({ type: "error", text: error?.response?.data?.message || "Kode tidak valid" });
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Shield className="w-7 h-7 text-blue-500" />
                Keamanan Admin
            </h1>

            {/* Current Status */}
            <div className={`p-6 rounded-xl border ${status?.enabled ? "bg-emerald-500/10 border-emerald-500/30" : "bg-slate-900 border-slate-800"}`}>
                <div className="flex items-center gap-4">
                    {status?.enabled ? (
                        <ShieldCheck className="w-12 h-12 text-emerald-500" />
                    ) : (
                        <ShieldOff className="w-12 h-12 text-slate-500" />
                    )}
                    <div>
                        <h2 className="text-lg font-semibold text-white">
                            Two-Factor Authentication (2FA)
                        </h2>
                        <p className={`text-sm ${status?.enabled ? "text-emerald-400" : "text-slate-400"}`}>
                            {status?.enabled ? "✓ Aktif - Akun Anda dilindungi" : "✗ Tidak aktif"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Message */}
            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === "success"
                        ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                        : "bg-red-500/10 border border-red-500/30 text-red-400"
                    }`}>
                    {message.type === "success" ? (
                        <Check className="w-5 h-5" />
                    ) : (
                        <AlertCircle className="w-5 h-5" />
                    )}
                    {message.text}
                </div>
            )}

            {/* Setup Section */}
            {!status?.enabled && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-white">Aktifkan 2FA dengan Google Authenticator</h3>

                    {!setupData ? (
                        <div className="space-y-4">
                            <p className="text-slate-400 text-sm">
                                2FA menambahkan lapisan keamanan ekstra. Setelah aktif, Anda akan diminta memasukkan kode 6 digit dari aplikasi authenticator setiap kali melakukan manual topup.
                            </p>
                            <button
                                onClick={handleSetup}
                                disabled={actionLoading}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                {actionLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <QrCode className="w-5 h-5" />
                                )}
                                Setup 2FA
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-slate-400 text-sm">
                                1. Scan QR code di bawah dengan Google Authenticator atau Authy
                            </p>

                            {/* QR Code */}
                            <div className="flex justify-center p-4 bg-white rounded-lg">
                                <img src={setupData.qr_code} alt="TOTP QR Code" className="w-48 h-48" />
                            </div>

                            {/* Manual Secret */}
                            <div className="p-3 bg-slate-800 rounded-lg">
                                <p className="text-xs text-slate-500 mb-1">Atau masukkan secret ini secara manual:</p>
                                <code className="text-sm text-blue-400 font-mono break-all">{setupData.secret}</code>
                            </div>

                            {/* Verify Code */}
                            <div className="space-y-2">
                                <p className="text-slate-400 text-sm">2. Masukkan kode 6 digit dari aplikasi:</p>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                        placeholder="000000"
                                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-blue-500"
                                        maxLength={6}
                                    />
                                    <button
                                        onClick={handleEnable}
                                        disabled={actionLoading || code.length !== 6}
                                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                                    >
                                        {actionLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Check className="w-5 h-5" />
                                        )}
                                        Aktifkan
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Disable Section */}
            {status?.enabled && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-white">Nonaktifkan 2FA</h3>
                    <p className="text-slate-400 text-sm">
                        ⚠️ Menonaktifkan 2FA akan mengurangi keamanan akun. Manual topup akan bisa dilakukan tanpa verifikasi tambahan.
                    </p>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder="Kode 6 digit"
                            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white text-center text-lg font-mono tracking-widest focus:outline-none focus:border-blue-500"
                            maxLength={6}
                        />
                        <button
                            onClick={handleDisable}
                            disabled={actionLoading || code.length !== 6}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {actionLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <ShieldOff className="w-5 h-5" />
                            )}
                            Nonaktifkan
                        </button>
                    </div>
                </div>
            )}

            {/* Info */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-sm text-blue-400">
                <p><strong>💡 Info:</strong></p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>2FA diperlukan untuk fitur Manual Topup</li>
                    <li>Gunakan Google Authenticator, Authy, atau Microsoft Authenticator</li>
                    <li>Simpan secret key di tempat yang aman sebagai backup</li>
                </ul>
            </div>
        </div>
    );
}
