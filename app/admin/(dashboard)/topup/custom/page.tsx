"use client";

import { useState } from "react";
import {
    Zap,
    Gift,
    DollarSign,
    Loader2,
    Check,
    AlertCircle,
    Shield,
    Key
} from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

export default function AdminCustomTopup() {
    const [source, setSource] = useState<"cash" | "gift">("cash");
    const [sku, setSku] = useState("");
    const [customerNo, setCustomerNo] = useState("");
    const [notes, setNotes] = useState("");
    const [password, setPassword] = useState("");
    const [totpCode, setTotpCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{
        success: boolean;
        message: string;
        data?: any;
    } | null>(null);

    const handleSubmit = async () => {
        // Validation
        if (!sku.trim()) {
            setResult({ success: false, message: "SKU wajib diisi" });
            return;
        }
        if (!customerNo.trim()) {
            setResult({ success: false, message: "Customer No wajib diisi" });
            return;
        }
        if (!password) {
            setResult({ success: false, message: "Password admin wajib diisi" });
            return;
        }
        if (totpCode.length !== 6) {
            setResult({ success: false, message: "Kode TOTP harus 6 digit" });
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const response: any = await api.post("/admin/topup/custom", {
                sku: sku.trim(),
                customer_no: customerNo.trim(),
                source,
                notes: notes.trim() || undefined,
                password,
                totp_code: totpCode,
            });

            setResult({
                success: true,
                message: response.message || "Topup berhasil!",
                data: response.data,
            });

            // Clear form on success
            setSku("");
            setCustomerNo("");
            setNotes("");
            setPassword("");
            setTotpCode("");
        } catch (error: any) {
            setResult({
                success: false,
                message: error?.response?.data?.message || "Gagal melakukan topup",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Zap className="w-7 h-7 text-yellow-500" />
                    Custom Topup
                </h1>
                <Link
                    href="/admin/orders"
                    className="text-sm text-slate-400 hover:text-white"
                >
                    ← Kembali ke Orders
                </Link>
            </div>

            {/* Source Type */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <label className="text-sm text-slate-400">Tipe Topup</label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setSource("cash")}
                        className={`p-4 rounded-lg border-2 transition-all ${source === "cash"
                                ? "border-blue-500 bg-blue-500/10"
                                : "border-slate-700 hover:border-slate-600"
                            }`}
                    >
                        <DollarSign className={`w-8 h-8 mx-auto mb-2 ${source === "cash" ? "text-blue-400" : "text-slate-500"}`} />
                        <div className={`font-medium ${source === "cash" ? "text-blue-400" : "text-slate-400"}`}>Cash</div>
                        <p className="text-xs text-slate-500 mt-1">Bayar langsung</p>
                    </button>
                    <button
                        onClick={() => setSource("gift")}
                        className={`p-4 rounded-lg border-2 transition-all ${source === "gift"
                                ? "border-pink-500 bg-pink-500/10"
                                : "border-slate-700 hover:border-slate-600"
                            }`}
                    >
                        <Gift className={`w-8 h-8 mx-auto mb-2 ${source === "gift" ? "text-pink-400" : "text-slate-500"}`} />
                        <div className={`font-medium ${source === "gift" ? "text-pink-400" : "text-slate-400"}`}>Gift</div>
                        <p className="text-xs text-slate-500 mt-1">Gratis/Hadiah</p>
                    </button>
                </div>
            </div>

            {/* Product Info */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-medium text-slate-400">Informasi Produk</h3>

                <div className="space-y-2">
                    <label className="text-sm text-slate-500">SKU Product</label>
                    <input
                        type="text"
                        value={sku}
                        onChange={(e) => setSku(e.target.value.toUpperCase())}
                        placeholder="Contoh: xl10"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-xs text-slate-500">
                        Cek SKU di <Link href="/admin/products" className="text-blue-400 hover:underline">halaman products</Link>
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm text-slate-500">Customer No / User ID</label>
                    <input
                        type="text"
                        value={customerNo}
                        onChange={(e) => setCustomerNo(e.target.value)}
                        placeholder="Contoh: 081234567890"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm text-slate-500">Catatan (Opsional)</label>
                    <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Contoh: Bonus untuk customer loyal"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Authentication */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Autentikasi
                </h3>

                <div className="space-y-2">
                    <label className="text-sm text-slate-500 flex items-center gap-2">
                        <Key className="w-3 h-3" />
                        Password Admin
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Masukkan password admin"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm text-slate-500">Kode TOTP (6 digit)</label>
                    <input
                        type="text"
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="000000"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-blue-500"
                        maxLength={6}
                    />
                    <p className="text-xs text-slate-500">Dari Google Authenticator</p>
                </div>
            </div>

            {/* Result */}
            {result && (
                <div className={`p-4 rounded-lg flex items-start gap-3 ${result.success
                        ? "bg-emerald-500/10 border border-emerald-500/30"
                        : "bg-red-500/10 border border-red-500/30"
                    }`}>
                    {result.success ? (
                        <Check className="w-5 h-5 text-emerald-400 mt-0.5" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                    )}
                    <div>
                        <p className={result.success ? "text-emerald-400" : "text-red-400"}>
                            {result.message}
                        </p>
                        {result.data && (
                            <div className="mt-2 text-sm text-slate-400 space-y-1">
                                <p>Product: <span className="text-white">{result.data.product}</span></p>
                                <p>Customer: <span className="text-white">{result.data.customer_no}</span></p>
                                {result.data.serial_number && (
                                    <p>SN: <span className="text-emerald-400 font-mono">{result.data.serial_number}</span></p>
                                )}
                                <p>Ref ID: <span className="text-slate-500 font-mono text-xs">{result.data.ref_id}</span></p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                disabled={loading || !sku || !customerNo || !password || totpCode.length !== 6}
                className={`w-full py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${source === "cash"
                        ? "bg-blue-600 hover:bg-blue-500 text-white"
                        : "bg-pink-600 hover:bg-pink-500 text-white"
                    }`}
            >
                {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : source === "cash" ? (
                    <DollarSign className="w-5 h-5" />
                ) : (
                    <Gift className="w-5 h-5" />
                )}
                {loading ? "Memproses..." : source === "cash" ? "Topup Cash" : "Kirim Gift"}
            </button>

            {/* Warning */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-xs text-yellow-400">
                ⚠️ <strong>Perhatian:</strong> Topup akan langsung dikirim ke Digiflazz. Pastikan SKU dan Customer No sudah benar sebelum submit.
            </div>
        </div>
    );
}
