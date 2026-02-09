"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    Zap,
    Loader2,
    Check,
    AlertCircle,
    ShieldCheck,
    X,
    RefreshCw,
    ArrowLeft,
    UserCheck
} from "lucide-react";
import Link from "next/link";
import Modal from "@/components/ui/modal";

interface ProductDetails {
    buyer_sku_code: string;
    product_name: string;
    display_name: string;
    category: string;
    brand: string;
    price: number;
    is_available: boolean;
}

function TopupContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const skuParam = searchParams.get("sku") || "";

    // Form State
    const [sku, setSku] = useState(skuParam);
    const [customerNo, setCustomerNo] = useState("");

    // Auth State
    const [password, setPassword] = useState("");

    // Processing State
    const [loading, setLoading] = useState(false);
    const [loadingProduct, setLoadingProduct] = useState(false);
    const [validatingUser, setValidatingUser] = useState(false);

    // Modal State
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [productDetails, setProductDetails] = useState<ProductDetails | null>(null);
    const [validationResult, setValidationResult] = useState<{
        isValid: boolean;
        accountName?: string;
        message?: string;
    } | null>(null);
    const [hasChecker, setHasChecker] = useState(false);
    const [checkerPrice, setCheckerPrice] = useState<number | null>(null);

    // Result Modal State
    const [resultModalOpen, setResultModalOpen] = useState(false);
    const [finalResult, setFinalResult] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch product on load if SKU provided
    useEffect(() => {
        if (skuParam) {
            fetchProduct(skuParam);
        }
    }, [skuParam]);

    const fetchProduct = async (skuCode: string) => {
        setLoadingProduct(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/member/products/${skuCode}`, {
                credentials: "include",
            });
            const json = await res.json();
            if (json.success && json.data) {
                setProductDetails(json.data);
                // Check if checker exists and get its price
                if (json.data.brand) {
                    const brandSlug = json.data.brand.toLowerCase().replace(/ /g, "");
                    const checkerSku = `checkuser${brandSlug}`;
                    try {
                        const checkerRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products/${checkerSku}`);
                        if (checkerRes.ok) {
                            const checkerData = await checkerRes.json();
                            setHasChecker(true);
                            if (checkerData?.data?.sell_price) {
                                setCheckerPrice(checkerData.data.sell_price);
                            } else if (checkerData?.data?.price) {
                                setCheckerPrice(checkerData.data.price);
                            }
                        } else {
                            setHasChecker(false);
                            setCheckerPrice(null);
                        }
                    } catch {
                        setHasChecker(false);
                        setCheckerPrice(null);
                    }
                }
            } else {
                setProductDetails(null);
            }
        } catch (error) {
            console.error("Failed to fetch product:", error);
            setProductDetails(null);
        } finally {
            setLoadingProduct(false);
        }
    };

    // Check User ID
    const handleCheckUserID = async () => {
        if (!productDetails?.brand || !customerNo) return;

        setValidatingUser(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/validate-account`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    brand: productDetails.brand,
                    customer_no: customerNo,
                }),
            });
            const data = await res.json();
            setValidationResult({
                isValid: data.is_valid,
                accountName: data.account_name,
                message: data.message,
            });
        } catch {
            setValidationResult({
                isValid: false,
                message: "Gagal melakukan validasi user",
            });
        } finally {
            setValidatingUser(false);
        }
    };

    // Open Confirmation Modal
    const handlePreCheck = () => {
        if (!productDetails) {
            alert("Produk tidak ditemukan");
            return;
        }
        if (!customerNo.trim()) {
            alert("Customer No wajib diisi");
            return;
        }
        setPassword("");
        setIsConfirmOpen(true);
    };

    // Submit Order
    const handleSubmit = async () => {
        if (!password) {
            alert("Password wajib diisi untuk konfirmasi");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/member/orders`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    sku: sku.trim(),
                    customer_no: customerNo.trim(),
                    password,
                }),
            });

            const data = await res.json();

            setIsConfirmOpen(false);

            if (data.success) {
                setFinalResult(data.data);
                setResultModalOpen(true);
                // Clear form
                setCustomerNo("");
                setPassword("");
                setValidationResult(null);
            } else {
                setFinalResult({
                    status: "failed",
                    message: data.error || "Gagal melakukan order",
                });
                setResultModalOpen(true);
            }
        } catch (error: any) {
            setIsConfirmOpen(false);
            setFinalResult({
                status: "failed",
                message: error?.message || "Gagal melakukan order",
            });
            setResultModalOpen(true);
        } finally {
            setLoading(false);
        }
    };

    // Refresh Order Status
    const handleRefreshStatus = async () => {
        if (!finalResult?.order_id) return;

        setRefreshing(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/member/orders/${finalResult.order_id}`, {
                credentials: "include",
            });
            const json = await res.json();
            if (json.success && json.data) {
                setFinalResult((prev: any) => ({
                    ...prev,
                    status: json.data.status,
                    serial_number: json.data.serial_number,
                    message: json.data.message,
                }));
            }
        } catch (error) {
            console.error("Failed to refresh status:", error);
        } finally {
            setRefreshing(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <div className="max-w-xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="w-1.5 h-8 bg-(--primary) rounded-full shadow-[0_0_10px_var(--primary)]" />
                    <Zap className="w-7 h-7 text-yellow-500" />
                    Topup Product
                </h1>
                <Link
                    href="/member/products"
                    className="text-sm text-white/50 hover:text-white transition-colors flex items-center gap-1"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Produk
                </Link>
            </div>

            {/* Product Details Card */}
            {loadingProduct ? (
                <div className="glass-card rounded-2xl p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-(--primary) mx-auto" />
                    <p className="text-white/50 mt-2">Loading produk...</p>
                </div>
            ) : productDetails ? (
                <div className="glass-card rounded-2xl p-6 space-y-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-white">{productDetails.display_name || productDetails.product_name}</h2>
                            <p className="text-white/50 font-mono text-sm">{productDetails.buyer_sku_code}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${productDetails.is_available
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-red-500/10 text-red-500 border-red-500/20"
                            }`}>
                            {productDetails.is_available ? "Active" : "Inactive"}
                        </span>
                    </div>
                    <div className="flex gap-4 text-sm">
                        <div>
                            <span className="text-white/40">Category:</span>
                            <span className="text-white ml-2">{productDetails.category}</span>
                        </div>
                        <div>
                            <span className="text-white/40">Brand:</span>
                            <span className="text-white ml-2">{productDetails.brand}</span>
                        </div>
                    </div>
                    <div className="pt-3 border-t border-white/10">
                        <span className="text-white/40 text-sm">Harga Member:</span>
                        <span className="text-(--accent) font-bold text-xl ml-3">
                            {formatPrice(productDetails.price)}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="glass-card rounded-2xl p-8 text-center">
                    <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
                    <p className="text-white/50 mt-2">Produk tidak ditemukan</p>
                    <Link href="/member/products" className="text-(--primary) text-sm hover:underline mt-2 inline-block">
                        Pilih produk lain
                    </Link>
                </div>
            )}

            {/* Customer No Input */}
            {productDetails && productDetails.is_available && (
                <div className="glass-card rounded-2xl p-6 space-y-4">
                    <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Tujuan Topup</h3>
                    <div className="space-y-2">
                        <label className="text-sm text-white/50">Customer No / User ID</label>
                        <input
                            type="text"
                            value={customerNo}
                            onChange={(e) => {
                                setCustomerNo(e.target.value);
                                setValidationResult(null);
                            }}
                            placeholder="Contoh: 081234567890 atau 12345678"
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-(--primary)/50 placeholder:text-white/20 transition-all"
                        />
                        <p className="text-xs text-amber-400/80">
                            ⚠️ Pastikan nomor/ID sudah benar. Kesalahan input diluar tanggung jawab kami.
                        </p>
                    </div>
                </div>
            )}

            {/* Submit Button */}
            {productDetails && productDetails.is_available && (
                <button
                    onClick={handlePreCheck}
                    disabled={loading || !customerNo}
                    className="w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg bg-(--primary) hover:bg-(--primary)/80 text-white"
                >
                    <Zap className="w-6 h-6" />
                    Lanjutkan Topup
                </button>
            )}

            {/* Confirmation Modal */}
            <Modal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                title="Konfirmasi Pesanan"
            >
                <div className="space-y-6">
                    {/* Product Details */}
                    <div className="bg-black/20 p-4 rounded-xl border border-white/10 space-y-2">
                        <h4 className="text-xs text-white/40 uppercase tracking-wider font-semibold">Produk</h4>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-white font-medium text-lg">{productDetails?.display_name || productDetails?.product_name}</p>
                                <p className="text-white/40 font-mono text-sm">{sku}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-(--accent) font-bold">{productDetails && formatPrice(productDetails.price)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Customer Validation */}
                    <div className="bg-black/20 p-4 rounded-xl border border-white/10 space-y-3">
                        <h4 className="text-xs text-white/40 uppercase tracking-wider font-semibold">Tujuan</h4>
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex-1">
                                <p className="text-white font-mono text-lg">{customerNo}</p>
                                {validationResult ? (
                                    <div className={`mt-2 text-sm flex items-center gap-2 ${validationResult.isValid ? "text-emerald-400" : "text-amber-400"
                                        }`}>
                                        {validationResult.isValid ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                        {validationResult.accountName || validationResult.message}
                                    </div>
                                ) : (
                                    <p className={`text-xs mt-1 italic ${hasChecker ? "text-white/40" : "text-amber-500/80"}`}>
                                        {hasChecker
                                            ? "*Klik tombol Check ID untuk validasi"
                                            : "Pastikan nomor sudah benar"}
                                    </p>
                                )}
                            </div>
                            {hasChecker && (
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={handleCheckUserID}
                                        disabled={validatingUser || validationResult?.isValid}
                                        className="shrink-0 px-3 py-2 bg-white/5 hover:bg-white/10 text-white/80 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-white/5"
                                    >
                                        {validatingUser ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserCheck className="w-3 h-3" />}
                                        Check ID
                                    </button>
                                    {checkerPrice !== null && (
                                        <span className="text-[10px] text-amber-400/70 text-center">
                                            Biaya: Rp {checkerPrice.toLocaleString("id-ID")}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Password Auth */}
                    <div className="border-t border-white/10 pt-4 space-y-4">
                        <h4 className="text-xs text-white/40 uppercase tracking-wider font-semibold flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3" /> Konfirmasi Password
                        </h4>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Masukkan password Anda"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-(--primary)/50 placeholder:text-white/20 transition-colors"
                        />
                        <p className="text-xs text-white/40">Password diperlukan untuk keamanan transaksi</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => setIsConfirmOpen(false)}
                            className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-medium text-sm transition-colors border border-white/5"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !password}
                            className="flex-1 py-2.5 rounded-xl bg-(--primary) hover:bg-(--primary)/80 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            Konfirmasi & Topup
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
                        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                            <Check className="w-8 h-8 text-emerald-500" />
                        </div>
                    ) : finalResult?.status === "processing" ? (
                        <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        </div>
                    ) : (
                        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                            <X className="w-8 h-8 text-red-500" />
                        </div>
                    )}

                    <div>
                        <h3 className={`text-xl font-bold ${finalResult?.status === "success" ? "text-emerald-500" :
                            finalResult?.status === "processing" ? "text-blue-500" : "text-red-500"
                            }`}>
                            {finalResult?.status === "success" ? "Topup Berhasil!" :
                                finalResult?.status === "processing" ? "Sedang Diproses" : "Topup Gagal"}
                        </h3>
                        <p className="text-white/60 text-sm mt-1">
                            {finalResult?.message || "Transaksi telah diproses sistem"}
                        </p>
                    </div>

                    {finalResult && finalResult.status !== "failed" && (
                        <div className="bg-black/20 border border-white/10 rounded-xl p-4 text-left space-y-3">
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-white/50 text-sm">Product</span>
                                <span className="text-white font-medium text-sm text-right">{finalResult.product_name}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-white/50 text-sm">Customer No</span>
                                <span className="text-white font-medium text-sm font-mono">{finalResult.customer_no}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-white/50 text-sm">SN / Token</span>
                                <span className={`font-mono text-sm text-right ${finalResult.serial_number ? "text-emerald-400 font-bold" : "text-white/40 italic"}`}>
                                    {finalResult.serial_number || "-"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/50 text-sm">Ref ID</span>
                                <span className="text-white/30 text-xs font-mono">{finalResult.ref_id}</span>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={() => setResultModalOpen(false)}
                            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors border border-white/5"
                        >
                            Tutup
                        </button>

                        {finalResult?.status === "processing" && (
                            <button
                                onClick={handleRefreshStatus}
                                disabled={refreshing}
                                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                            >
                                {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                Refresh Status
                            </button>
                        )}

                        {finalResult?.order_id && (
                            <Link
                                href={`/member/orders/${finalResult.order_id}`}
                                className="flex-1 py-3 bg-(--primary) hover:bg-(--primary)/80 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                Lihat Detail
                            </Link>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default function MemberTopup() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[300px]">
                <Loader2 className="w-8 h-8 animate-spin text-(--primary)" />
            </div>
        }>
            <TopupContent />
        </Suspense>
    );
}
