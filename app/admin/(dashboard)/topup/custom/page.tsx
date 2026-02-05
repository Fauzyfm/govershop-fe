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
    Key,
    UserCheck,
    X,
    Info,
    RefreshCw
} from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";
import Modal from "@/components/ui/modal";

export default function AdminCustomTopup() {
    // Form State
    const [source, setSource] = useState<"cash" | "gift">("cash");
    const [sku, setSku] = useState("");
    const [customerNo, setCustomerNo] = useState("");
    const [notes, setNotes] = useState("");

    // Auth State (Moved to Modal)
    const [password, setPassword] = useState("");
    const [totpCode, setTotpCode] = useState("");

    // Processing State
    const [loading, setLoading] = useState(false);
    const [checkingProduct, setCheckingProduct] = useState(false);
    const [validatingUser, setValidatingUser] = useState(false);

    // Modal State
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [productDetails, setProductDetails] = useState<any>(null);
    const [validationResult, setValidationResult] = useState<{
        isValid: boolean;
        accountName?: string;
        message?: string;
    } | null>(null);

    const [hasChecker, setHasChecker] = useState(false);

    // Final Result State
    const [resultModalOpen, setResultModalOpen] = useState(false);
    const [finalResult, setFinalResult] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);

    // Refresh Status Logic
    const handleRefreshStatus = async () => {
        if (!finalResult?.order_id) return;

        setRefreshing(true);
        try {
            const response = await api.get(`/orders/${finalResult.order_id}`);
            const order = response.data;

            // Update finalResult with new data
            setFinalResult((prev: any) => ({
                ...prev,
                status: order.status,
                serial_number: order.serial_number,
                message: order.message,
                ref_id: order.ref_id // Ensure latest ref_id if changed
            }));

            if (order.status === "success" || order.status === "failed") {
                // Optional: maybe auto close or show success toast? 
                // For now just updating the modal is enough.
            }
        } catch (error) {
            console.error("Failed to refresh status", error);
        } finally {
            setRefreshing(false);
        }
    };

    // Step 1: Pre-check Product and Open Modal
    // Step 1: Pre-check Product and Open Modal
    const handlePreCheck = async () => {
        // Validation
        if (!sku.trim()) {
            alert("SKU wajib diisi");
            return;
        }
        if (!customerNo.trim()) {
            alert("Customer No wajib diisi");
            return;
        }

        setCheckingProduct(true);
        setValidationResult(null);
        setHasChecker(false);
        setPassword("");
        setTotpCode("");

        try {
            // Fetch product details (Admin endpoint to see Buy Price)
            const response = await api.get(`/admin/products/${sku.trim()}`);
            const product = response.data;

            if (!product) {
                alert(`Product dengan SKU '${sku}' tidak ditemukan`);
                return;
            }

            setProductDetails(product);

            // Check if checker exists for this brand
            if (product.brand) {
                const brandSlug = product.brand.toLowerCase().replace(/ /g, "");
                try {
                    // Try to fetch the checker product
                    await api.get(`/products/checkuser${brandSlug}`);
                    setHasChecker(true);
                } catch (e) {
                    setHasChecker(false);
                }
            }
            setIsConfirmOpen(true);
        } catch (error: any) {
            alert(error?.response?.status === 404
                ? `Product dengan SKU '${sku}' tidak ditemukan`
                : "Gagal mengambil data product");
        } finally {
            setCheckingProduct(false);
        }
    };

    // Step 2: Check User ID (Manual Trigger)
    const handleCheckUserID = async () => {
        if (!productDetails?.brand || !customerNo) return;

        setValidatingUser(true);
        try {
            const response = await api.post("/validate-account", {
                brand: productDetails.brand,
                customer_no: customerNo
            });

            const data = response.data;
            setValidationResult({
                isValid: data.is_valid,
                accountName: data.account_name,
                message: data.message
            });
        } catch (error) {
            setValidationResult({
                isValid: false,
                message: "Gagal melakukan validasi user"
            });
        } finally {
            setValidatingUser(false);
        }
    };

    // Step 3: Final Submit
    const handleSubmit = async () => {
        if (!password) {
            alert("Password admin wajib diisi");
            return;
        }
        if (totpCode.length !== 6) {
            alert("Kode TOTP harus 6 digit");
            return;
        }

        setLoading(true);
        // Don't clear result here to keep context if needed, wait for success/fail

        try {
            const response: any = await api.post("/admin/topup/custom", {
                sku: sku.trim(),
                customer_no: customerNo.trim(),
                source,
                notes: notes.trim() || undefined,
                password,
                totp_code: totpCode,
            });

            setIsConfirmOpen(false); // Close modal
            setFinalResult(response.data);
            setResultModalOpen(true);

            // Clear form on success
            setSku("");
            setCustomerNo("");
            setNotes("");
            setPassword("");
            setTotpCode("");
            setProductDetails(null);
        } catch (error: any) {
            // Keep modal open on auth error? Maybe. 
            // Or close if it's a fatal error.
            // Let's close modal and show error in main page for clarity
            setIsConfirmOpen(false);
            setFinalResult({
                status: "failed",
                message: error?.response?.data?.message || "Gagal melakukan topup",
            });
            setResultModalOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0
        }).format(price);
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

            {/* Product Info Inputs */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-medium text-slate-400">Informasi Transaksi</h3>

                <div className="space-y-2">
                    <label className="text-sm text-slate-500">SKU Product</label>
                    <input
                        type="text"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        placeholder="Contoh: xl10"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-xs text-slate-500">
                        Pastikan SKU valid (Cek di <Link href="/admin/products" className="text-blue-400 hover:underline">products list</Link>)
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

            {/* Result Display */}


            {/* Main Action Button */}
            <button
                onClick={handlePreCheck}
                disabled={loading || checkingProduct || !sku || !customerNo}
                className={`w-full py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${source === "cash"
                    ? "bg-blue-600 hover:bg-blue-500 text-white"
                    : "bg-pink-600 hover:bg-pink-500 text-white"
                    }`}
            >
                {checkingProduct ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : source === "cash" ? (
                    <DollarSign className="w-5 h-5" />
                ) : (
                    <Gift className="w-5 h-5" />
                )}
                {checkingProduct ? "Mengecek SKU..." : source === "cash" ? "Topup Cash" : "Kirim Gift"}
            </button>

            {/* Confirmation Modal */}
            <Modal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                title="Konfirmasi Pesanan"
            >
                <div className="space-y-6">
                    {/* 1. Product Details */}
                    <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-2">
                        <h4 className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Produk</h4>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-white font-medium text-lg">{productDetails?.product_name}</p>
                                <p className="text-slate-400 font-mono text-sm">{sku}</p>
                            </div>
                            <div className="text-right text-xs text-slate-500">
                                <p>Buy: {productDetails && formatPrice(productDetails.buy_price)}</p>
                                <p>Sell: {productDetails && formatPrice(productDetails.selling_price)}</p>
                            </div>
                        </div>
                    </div>

                    {/* 2. Customer Validation */}
                    <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-3">
                        <h4 className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Tujuan</h4>
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex-1">
                                <p className="text-white font-mono text-lg">{customerNo}</p>
                                {/* Validation Result display */}
                                {validationResult ? (
                                    <div className={`mt-2 text-sm flex items-center gap-2 ${validationResult.isValid ? "text-emerald-400" : "text-amber-400"
                                        }`}>
                                        {validationResult.isValid ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                        {validationResult.accountName || validationResult.message}
                                    </div>
                                ) : (
                                    <p className={`text-xs mt-1 italic ${hasChecker ? "text-slate-500" : "text-amber-500/80"}`}>
                                        {hasChecker
                                            ? "*Pastikan customer No sudah sesuai"
                                            : "Pastikan User ID sesuai. Kesalahan input diluar tanggung jawab kami."}
                                    </p>
                                )}
                            </div>

                            {hasChecker && (
                                <button
                                    onClick={handleCheckUserID}
                                    disabled={validatingUser || validationResult?.isValid}
                                    className="shrink-0 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                                >
                                    {validatingUser ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserCheck className="w-3 h-3" />}
                                    Check ID
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 4. Notes Display */}
                    {notes && (
                        <div className="text-sm p-3 bg-slate-800/50 rounded text-slate-300 border border-slate-800/50">
                            <span className="text-slate-500 text-xs block mb-1">Catatan:</span>
                            {notes}
                        </div>
                    )}

                    {/* 5. Auth (Moved Here) */}
                    <div className="border-t border-slate-800 pt-4 space-y-4">
                        <h4 className="text-xs text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-2">
                            <Shield className="w-3 h-3" /> Autentikasi Admin
                        </h4>

                        <div className="space-y-3">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password Admin"
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                            />
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={totpCode}
                                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    placeholder="TOTP (6 digit)"
                                    maxLength={6}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm font-mono tracking-widest text-center focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => setIsConfirmOpen(false)}
                            className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !password || totpCode.length !== 6}
                            className={`flex-1 py-2.5 rounded-lg text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 ${source === "cash"
                                ? "bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50"
                                : "bg-pink-600 hover:bg-pink-500 disabled:bg-pink-600/50"
                                }`}
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            Konfirmasi & Kirim
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Result Modal */}
            <Modal
                isOpen={resultModalOpen}
                onClose={() => setResultModalOpen(false)}
                title="Status Transaksi"
            >
                <div className="space-y-6 text-center">
                    {finalResult?.status === "success" ? (
                        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                            <Check className="w-8 h-8 text-emerald-500" />
                        </div>
                    ) : finalResult?.status === "processing" ? (
                        <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        </div>
                    ) : (
                        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto">
                            <X className="w-8 h-8 text-red-500" />
                        </div>
                    )}

                    <div>
                        <h3 className={`text-xl font-bold ${finalResult?.status === "success" ? "text-emerald-500" :
                            finalResult?.status === "processing" ? "text-blue-500" : "text-red-500"
                            }`}>
                            {finalResult?.status === "success" ? "Topup Berhasil!" :
                                finalResult?.status === "processing" ? "Sedang Diproses" : "Gagal Topup"}
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">
                            {finalResult?.message || "Transaksi telah diproses sistem"}
                        </p>
                    </div>

                    {finalResult && finalResult.status !== "failed" && (
                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-left space-y-3">
                            <div className="flex justify-between border-b border-slate-800 pb-2">
                                <span className="text-slate-500 text-sm">Product</span>
                                <span className="text-white font-medium text-sm text-right">{finalResult.product}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-800 pb-2">
                                <span className="text-slate-500 text-sm">Customer No</span>
                                <span className="text-white font-medium text-sm font-mono">{finalResult.customer_no}</span>
                            </div>

                            {/* SN Display */}
                            <div className="flex justify-between border-b border-slate-800 pb-2">
                                <span className="text-slate-500 text-sm">SN / Token</span>
                                <span className={`font-mono text-sm text-right ${finalResult.serial_number ? "text-emerald-400 font-bold" : "text-slate-600 italic"}`}>
                                    {finalResult.serial_number || "-"}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-slate-500 text-sm">Ref ID</span>
                                <span className="text-slate-400 text-xs font-mono">{finalResult.ref_id}</span>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={() => setResultModalOpen(false)}
                            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
                        >
                            Tutup
                        </button>

                        {finalResult?.status === "processing" && (
                            <button
                                onClick={handleRefreshStatus}
                                disabled={refreshing}
                                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Refresh Status
                            </button>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
}
