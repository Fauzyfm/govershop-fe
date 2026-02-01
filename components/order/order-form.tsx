"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";
import {
    Product,
    PaymentMethod,
    APIResponse,
    ValidateAccountResponse,
    PriceCalculation
} from "@/types/api";
import ProductTabs from "./product-tabs";
import ProductGrid from "./product-grid";
import PaymentSelector from "./payment-selector";
import MobileOrderSummary from "./mobile-order-summary";
import { cn } from "@/lib/utils";

interface OrderFormProps {
    brand: string;
    initialProducts: Product[];
    paymentMethods: PaymentMethod[];
}

export default function OrderForm({ brand, initialProducts, paymentMethods }: OrderFormProps) {
    const router = useRouter();

    // State
    const [customerNo, setCustomerNo] = useState("");
    const [zoneId, setZoneId] = useState(""); // Only for some games like ML
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    const [isValidating, setIsValidating] = useState(false);
    const [validationResult, setValidationResult] = useState<ValidateAccountResponse | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [showValidationModal, setShowValidationModal] = useState(false);

    const [selectedSku, setSelectedSku] = useState<string | null>(null);
    const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

    const [calculating, setCalculating] = useState(false);
    const [priceDetails, setPriceDetails] = useState<PriceCalculation | null>(null);

    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState("Semua");

    // Derived Logic
    const isML = brand.toUpperCase() === "MOBILE LEGENDS";
    const fullCustomerNo = isML ? `${customerNo}${zoneId}` : customerNo;

    // 1. Get Unique Tags for Tabs
    const uniqueTags = Array.from(new Set(initialProducts.flatMap(p => p.tags || []))).sort();
    const tabs = uniqueTags;

    // 2. Best Sellers
    const bestSellers = initialProducts.filter(p => p.is_best_seller);

    // 3. Filtered Products for Grid
    const filteredProducts = initialProducts.filter(p => {
        if (activeTab === "Semua") return true;
        return p.tags?.includes(activeTab);
    }).sort((a, b) => {
        // Sort Logic
        if (activeTab === "Semua") {
            // "All" sort by SKU Ascending (as requested)
            return a.buyer_sku_code.localeCompare(b.buyer_sku_code, undefined, { numeric: true });
        }
        // For tags, sort by price (or default)
        return a.price - b.price;
    });

    // Effects
    useEffect(() => {
        // Calculate price when SKU or Payment changes
        if (selectedSku && selectedPayment) {
            calculatePrice();
        }
    }, [selectedSku, selectedPayment]);

    // Handlers
    const handleValidate = async () => {
        if (!customerNo) return;

        setIsValidating(true);
        setValidationError(null);
        setValidationResult(null);

        try {
            const res = await api.post<any, APIResponse<ValidateAccountResponse>>('/validate-account', {
                brand,
                customer_no: fullCustomerNo
            });

            if (res.success && res.data?.is_valid) {
                setValidationResult(res.data);
            } else {
                setValidationError("Akun tidak ditemukan atau salah.");
            }
        } catch (err: any) {
            setValidationError(err.message || "Gagal memvalidasi akun.");
        } finally {
            setIsValidating(false);
        }
    };

    const calculatePrice = async () => {
        setCalculating(true);
        try {
            const res = await api.post<any, APIResponse<PriceCalculation>>('/calculate-price', {
                buyer_sku_code: selectedSku,
                payment_method: selectedPayment,
                brand
            });
            if (res.success && res.data) {
                setPriceDetails(res.data);
            }
        } catch (err) {
            console.error("Price calc failed", err);
        } finally {
            setCalculating(false);
        }
    };

    const handlePreSubmit = () => {
        if (!selectedSku || !selectedPayment || !customerNo || !phone) {
            alert("Harap lengkapi formular (ID, Item, No HP, Pembayaran)");
            return;
        }

        // Show validation modal
        setShowValidationModal(true);
        if (!validationResult) {
            handleValidate(); // Auto validate if not yet done
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            // 1. Create Order
            const orderRes = await api.post<any, APIResponse<any>>('/orders', {
                buyer_sku_code: selectedSku,
                customer_no: fullCustomerNo,
                customer_name: validationResult?.account_name || "-",
                customer_email: email,
                customer_phone: phone
            });

            if (orderRes.success && orderRes.data) {
                const orderId = orderRes.data.id;

                // 2. Initiate Payment
                const payRes = await api.post<any, APIResponse<any>>(`/orders/${orderId}/pay`, {
                    payment_method: selectedPayment
                });

                if (payRes.success) {
                    // Redirect to status page
                    router.push(`/payment/${orderId}`);
                }
            }
        } catch (err: any) {
            alert(err.message || "Gagal membuat order");
            setShowValidationModal(false);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Form Steps */}
            <div className="lg:col-span-2 space-y-8">

                {/* Step 1: Select Product (Nominals) */}
                <section className="glass rounded-xl p-6 border border-white/5 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary text-black font-bold flex items-center justify-center">1</div>
                        <h2 className="text-xl font-bold">Pilih Nominal</h2>
                    </div>

                    {/* Best Seller Section */}
                    {bestSellers.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="animate-pulse relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                                </span>
                                <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-wider">🔥 Paling Laris</h3>
                            </div>
                            <ProductGrid
                                products={bestSellers}
                                selectedSku={selectedSku}
                                onSelect={setSelectedSku}
                            />
                            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-4" />
                        </div>
                    )}

                    {/* Tabs */}
                    {tabs.length > 0 && (
                        <ProductTabs
                            tabs={tabs}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                        />
                    )}

                    {/* Main Grid (Filtered) */}
                    <div>
                        <ProductGrid
                            products={filteredProducts}
                            selectedSku={selectedSku}
                            onSelect={setSelectedSku}
                        />
                    </div>
                </section>

                {/* Step 2: User Data */}
                <section className="glass rounded-xl p-6 border border-white/5 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary text-black font-bold flex items-center justify-center">2</div>
                        <h2 className="text-xl font-bold">Masukkan User ID</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className={cn("space-y-2", isML ? "col-span-1" : "col-span-2")}>
                            <label className="text-sm text-muted-foreground">User ID</label>
                            <input
                                type="text"
                                value={customerNo}
                                onChange={e => setCustomerNo(e.target.value)}
                                placeholder="Ketuk untuk memasukkan ID"
                                className="w-full bg-background border border-border p-3 rounded-lg focus:border-primary focus:outline-none"
                            />
                        </div>
                        {isML && (
                            <div className="space-y-2">
                                <label className="text-sm text-muted-foreground">Zone ID</label>
                                <input
                                    type="text"
                                    value={zoneId}
                                    onChange={e => setZoneId(e.target.value)}
                                    placeholder="(1234)"
                                    className="w-full bg-background border border-border p-3 rounded-lg focus:border-primary focus:outline-none"
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                            <label className="text-sm text-muted-foreground">Email (Opsional)</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="Alamat Email"
                                className="w-full bg-background border border-border p-3 rounded-lg focus:border-primary focus:outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-muted-foreground">No. Handphone (Wajib)</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                placeholder="08xxxxxxxxxx"
                                className="w-full bg-background border border-border p-3 rounded-lg focus:border-primary focus:outline-none"
                            />
                        </div>
                    </div>
                </section>

                {/* Step 3: Payment Method */}
                <section className="glass rounded-xl p-6 border border-white/5 space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-primary text-black font-bold flex items-center justify-center">3</div>
                        <h2 className="text-xl font-bold">Pilih Pembayaran</h2>
                    </div>

                    <PaymentSelector
                        methods={paymentMethods}
                        selectedMethod={selectedPayment}
                        onSelect={setSelectedPayment}
                    />
                </section>
            </div>

            {/* Right Column: Sticky Summary */}
            <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-4">
                    <div className="glass rounded-xl p-6 border border-white/5">
                        <h3 className="font-bold text-lg mb-4">Rincian Pembelian</h3>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-start">
                                <span className="text-muted-foreground">Item</span>
                                <span className="font-medium text-right w-32 break-words text-sm ml-2">
                                    {initialProducts.find(p => p.buyer_sku_code === selectedSku)?.product_name || "-"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Harga Produk</span>
                                <span>Rp {priceDetails?.product_price.toLocaleString() || "-"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Biaya Admin</span>
                                <span>Rp {priceDetails?.admin_fee.toLocaleString() || "-"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Biaya Transaksi</span>
                                <span>Rp {priceDetails?.payment_fee.toLocaleString() || "-"}</span>
                            </div>

                            <div className="flex justify-between text-primary font-bold text-lg pt-2 border-t border-white/10">
                                <span>Total</span>
                                <span>Rp {priceDetails?.total_price.toLocaleString() || "-"}</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePreSubmit}
                            disabled={submitting || !selectedSku || !selectedPayment || !customerNo || !phone}
                            className="w-full mt-6 py-3 bg-primary hover:bg-primary/90 text-black font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {submitting ? <Loader2 className="animate-spin" /> : "Pesan Sekarang"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Validation Modal */}
            {showValidationModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#1a1b26] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-6 relative">
                        <h3 className="text-xl font-bold text-center">Konfirmasi Pesanan</h3>

                        <div className="space-y-4">
                            <div className="flex justify-between border-b border-white/10 pb-2">
                                <span className="text-muted-foreground">User ID</span>
                                <span className="font-medium">{fullCustomerNo}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/10 pb-2">
                                <span className="text-muted-foreground">Username</span>
                                <span className="font-medium flex items-center gap-2">
                                    {isValidating ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : validationResult ? (
                                        <span className="text-green-500">{validationResult.account_name}</span>
                                    ) : validationError ? (
                                        <span className="text-red-500">Invalid ID</span>
                                    ) : "-"}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-white/10 pb-2">
                                <span className="text-muted-foreground">Item</span>
                                <span className="font-medium text-right w-40 truncate">
                                    {initialProducts.find(p => p.buyer_sku_code === selectedSku)?.product_name}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-white/10 pb-2">
                                <span className="text-muted-foreground">Metode Pembayaran</span>
                                <span className="font-medium">
                                    {paymentMethods.find(m => m.code === selectedPayment)?.name}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-lg font-bold text-primary pt-2">
                                <span>Total Bayar</span>
                                <span>Rp {priceDetails?.total_price.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                            <button
                                onClick={() => setShowValidationModal(false)}
                                className="py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors font-medium"
                                disabled={submitting}
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || isValidating || !!validationError}
                                className="py-3 rounded-xl bg-primary hover:bg-primary/90 text-black font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting ? <Loader2 className="animate-spin" /> : "Bayar Sekarang"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Bottom Sheet */}
            <MobileOrderSummary
                priceDetails={priceDetails}
                selectedProductName={initialProducts.find(p => p.buyer_sku_code === selectedSku)?.product_name || null}
                submitting={submitting}
                disabled={submitting || !selectedSku || !selectedPayment || !customerNo || !phone}
                onSubmit={handlePreSubmit}
            />
        </div>
    );
}
