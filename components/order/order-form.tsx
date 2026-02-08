"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { getGameConfig, sanitizeUserId, buildCustomerNo } from "@/lib/game-input-config";
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
import ServerTabs, { ServerTabInfo, buildServerTabs, filterProductsByTab, findTabByUrlKey } from "./server-tabs";
import ZoneIdInput from "./zone-id-input";
import { cn } from "@/lib/utils";

interface OrderFormProps {
    brand: string;
    initialProducts: Product[];
    paymentMethods: PaymentMethod[];
}

const INITIAL_PRODUCT_LIMIT = 15;

export default function OrderForm({ brand, initialProducts, paymentMethods }: OrderFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get server from URL (if exists) - now uses urlKey (lowercase)
    const serverFromUrl = searchParams.get("server");

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

    // Server selection state (now using ServerTabInfo)
    const [activeServerTab, setActiveServerTab] = useState<ServerTabInfo | null>(null);
    const [serverLoading, setServerLoading] = useState(false);

    // Collapsible and Show More states
    const [nominalExpanded, setNominalExpanded] = useState(true);
    const [showAllProducts, setShowAllProducts] = useState(false);

    // Game-specific config (flexible untuk game apapun)
    const gameConfig = useMemo(() => getGameConfig(brand), [brand]);

    // Build sanitized customer number
    const fullCustomerNo = useMemo(
        () => buildCustomerNo(brand, customerNo, zoneId),
        [brand, customerNo, zoneId]
    );

    // Build dynamic server tabs from products
    const serverTabs = useMemo(() => buildServerTabs(initialProducts), [initialProducts]);

    // Set default server tab on mount (or from URL)
    useEffect(() => {
        if (serverTabs.length > 0 && !activeServerTab) {
            // Check if there's a server in URL (using urlKey)
            if (serverFromUrl) {
                const matchingTab = findTabByUrlKey(serverTabs, serverFromUrl);
                if (matchingTab) {
                    setActiveServerTab(matchingTab);
                    return;
                }
            }
            // Default to first tab
            setActiveServerTab(serverTabs[0]);
        }
    }, [serverTabs, activeServerTab, serverFromUrl]);

    // Handle server tab change with loading animation and URL update
    const handleServerTabChange = (tab: ServerTabInfo) => {
        if (tab.urlKey === activeServerTab?.urlKey) return;

        setServerLoading(true);
        setActiveServerTab(tab);
        setActiveTab("Semua"); // Reset tag tab
        setShowAllProducts(false); // Reset pagination
        setSelectedSku(null); // Clear selection

        // Update URL with server query parameter (using urlKey for clean URL)
        const params = new URLSearchParams(searchParams.toString());
        params.set("server", tab.urlKey);
        router.replace(`?${params.toString()}`, { scroll: false });

        // Simulate loading for smoother transition
        setTimeout(() => setServerLoading(false), 300);
    };

    // Filter products by selected server tab
    const serverFilteredProducts = useMemo(() => {
        return filterProductsByTab(initialProducts, activeServerTab);
    }, [initialProducts, activeServerTab]);

    // 1. Get Unique Tags for Tabs (from server-filtered products)
    const uniqueTags = Array.from(new Set(serverFilteredProducts.flatMap(p => p.tags || []))).sort();
    const tabs = uniqueTags;

    // 2. Best Sellers (from server-filtered products)
    const bestSellers = serverFilteredProducts.filter(p => p.is_best_seller);

    // 3. Filtered Products for Grid (from server-filtered products)
    const allFilteredProducts = serverFilteredProducts.filter(p => {
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

    // Apply limit to filteredProducts
    const filteredProducts = showAllProducts
        ? allFilteredProducts
        : allFilteredProducts.slice(0, INITIAL_PRODUCT_LIMIT);

    const remainingCount = allFilteredProducts.length - INITIAL_PRODUCT_LIMIT;
    const hasMoreProducts = remainingCount > 0 && !showAllProducts;

    // Get price of selected product (for PayPal minimum check)
    const selectedProductPrice = useMemo(() => {
        if (!selectedSku) return undefined;
        const product = initialProducts.find(p => p.buyer_sku_code === selectedSku);
        return product?.price;
    }, [selectedSku, initialProducts]);

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Form Steps */}
            <div className="lg:col-span-2 space-y-6">

                {/* Step 1: Select Product (Nominals) - Collapsible */}
                <section className="glass rounded-xl border border-white/5 overflow-hidden">
                    {/* Collapsible Header */}
                    <button
                        onClick={() => setNominalExpanded(!nominalExpanded)}
                        className="w-full flex items-center justify-between p-5  hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-3 ">
                            <div className="w-8 h-8 rounded-full bg-primary text-black font-bold flex items-center justify-center text-sm">1</div>
                            <div className="text-left">
                                <h2 className="text-lg font-bold">Pilih Nominal</h2>
                                {selectedSku && !nominalExpanded && (
                                    <p className="text-xs text-primary mt-0.5">
                                        {initialProducts.find(p => p.buyer_sku_code === selectedSku)?.product_name}
                                    </p>
                                )}
                            </div>
                        </div>
                        <ChevronDown className={cn(
                            "w-5 h-5 text-muted-foreground transition-transform duration-200",
                            nominalExpanded && "rotate-180"
                        )} />
                    </button>

                    {/* Collapsible Content */}
                    <div className={cn(
                        "grid transition-all duration-300 ease-in-out",
                        nominalExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}>
                        <div className="overflow-hidden">
                            <div className="px-5 pb-5 pt-5 space-y-5">
                                {/* Server Selection Tabs */}
                                {serverTabs.length > 1 && activeServerTab && (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-primary animate-bounce" />
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pilih Server</span>
                                        </div>
                                        <ServerTabs
                                            tabs={serverTabs}
                                            activeTab={activeServerTab}
                                            onTabChange={handleServerTabChange}
                                            loading={serverLoading}
                                        />
                                    </div>
                                )}

                                {/* Animated Content Container */}
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeServerTab?.urlKey}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-5"
                                    >
                                        {/* Loading State */}
                                        {serverLoading ? (
                                            <div className="flex items-center justify-center py-12">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                                                    <span className="text-sm text-muted-foreground">Memuat produk...</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Best Seller Section */}
                                                {bestSellers.length > 0 && (
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="animate-pulse relative flex h-2.5 w-2.5">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
                                                            </span>
                                                            <h3 className="text-xs font-bold text-yellow-500 uppercase tracking-wider">🔥 Paling Laris</h3>
                                                        </div>
                                                        <ProductGrid
                                                            products={bestSellers}
                                                            selectedSku={selectedSku}
                                                            onSelect={setSelectedSku}
                                                        />
                                                        <div className="h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent my-3" />
                                                    </div>
                                                )}

                                                {/* Tabs */}
                                                {tabs.length > 0 && (
                                                    <ProductTabs
                                                        tabs={tabs}
                                                        activeTab={activeTab}
                                                        onTabChange={(tab) => {
                                                            setActiveTab(tab);
                                                            setShowAllProducts(false); // Reset when changing tab
                                                        }}
                                                    />
                                                )}

                                                {/* Main Grid (Filtered & Limited) */}
                                                <div className="space-y-5">
                                                    <ProductGrid
                                                        products={filteredProducts}
                                                        selectedSku={selectedSku}
                                                        onSelect={setSelectedSku}
                                                    />

                                                    {/* Show More Button */}
                                                    {hasMoreProducts && (
                                                        <button
                                                            onClick={() => setShowAllProducts(true)}
                                                            className="w-full py-3 border border-white/10 hover:border-primary/50 hover:bg-primary/5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 group"
                                                        >
                                                            <ChevronDown className="w-4 h-4 group-hover:animate-bounce" />
                                                            Tampilkan {remainingCount} Lainnya
                                                        </button>
                                                    )}

                                                    {/* Show Less Button */}
                                                    {showAllProducts && allFilteredProducts.length > INITIAL_PRODUCT_LIMIT && (
                                                        <button
                                                            onClick={() => setShowAllProducts(false)}
                                                            className="w-full py-3 border border-white/10 hover:border-white/20 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <ChevronUp className="w-4 h-4" />
                                                            Tampilkan Lebih Sedikit
                                                        </button>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Step 2: User Data */}
                <section className="glass rounded-xl p-5 border border-white/5 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-black font-bold flex items-center justify-center text-sm">2</div>
                        <h2 className="text-lg font-bold">Masukkan Data</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={cn("space-y-2", gameConfig.hasZoneId ? "md:col-span-1" : "md:col-span-2")}>
                            <label className="text-xs text-muted-foreground font-medium">
                                {gameConfig.userIdLabel || "User ID"}
                            </label>
                            <input
                                type="text"
                                value={customerNo}
                                onChange={e => setCustomerNo(sanitizeUserId(e.target.value))}
                                onPaste={e => {
                                    e.preventDefault();
                                    const pastedText = e.clipboardData.getData('text');
                                    setCustomerNo(sanitizeUserId(pastedText));
                                }}
                                placeholder={gameConfig.userIdPlaceholder || "Masukkan User ID"}
                                className="w-full bg-background border border-border p-3 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all text-sm"
                            />
                        </div>
                        {gameConfig.hasZoneId && (
                            <ZoneIdInput
                                value={zoneId}
                                onChange={setZoneId}
                                label={gameConfig.zoneIdLabel}
                                placeholder={gameConfig.zoneIdPlaceholder}
                            />
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs text-muted-foreground font-medium">Email (Opsional)</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="email@contoh.com"
                                className="w-full bg-background border border-border p-3 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-muted-foreground font-medium">No. WhatsApp <span className="text-red-400">*</span></label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                placeholder="08xxxxxxxxxx"
                                className="w-full bg-background border border-border p-3 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all text-sm"
                            />
                        </div>
                    </div>
                </section>

                {/* Step 3: Payment Method */}
                <section className="glass rounded-xl p-5 border border-white/5 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-black font-bold flex items-center justify-center text-sm">3</div>
                        <h2 className="text-lg font-bold">Pilih Pembayaran</h2>
                    </div>

                    <PaymentSelector
                        methods={paymentMethods}
                        selectedMethod={selectedPayment}
                        onSelect={setSelectedPayment}
                        productPrice={selectedProductPrice}
                    />
                </section>
            </div>

            {/* Right Column: Sticky Summary */}
            <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-4">
                    <div className="glass rounded-xl p-5 border border-white/5">
                        <h3 className="font-bold text-base mb-4">Rincian Pembelian</h3>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-start">
                                <span className="text-muted-foreground text-xs">Item</span>
                                <span className="font-medium text-right w-40 wrap-break-word text-xs ml-2">
                                    {initialProducts.find(p => p.buyer_sku_code === selectedSku)?.product_name || "-"}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Harga Produk</span>
                                <span>Rp {priceDetails?.product_price.toLocaleString() || "-"}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Biaya Admin</span>
                                <span>Rp {priceDetails?.admin_fee.toLocaleString() || "-"}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Biaya Transaksi</span>
                                <span>Rp {priceDetails?.payment_fee.toLocaleString() || "-"}</span>
                            </div>

                            <div className="flex justify-between text-primary font-bold text-base pt-3 border-t border-white/10">
                                <span>Total</span>
                                <span>Rp {priceDetails?.total_price.toLocaleString() || "-"}</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePreSubmit}
                            disabled={submitting || !selectedSku || !selectedPayment || !customerNo || !phone}
                            className="w-full mt-5 py-3 bg-primary hover:bg-primary/90 text-black font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                        >
                            {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : "Beli Sekarang"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Validation Modal */}
            {showValidationModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#1a1b26] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-5 relative">
                        <h3 className="text-lg font-bold text-center">Konfirmasi Pesanan</h3>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between border-b border-white/10 pb-2">
                                <span className="text-muted-foreground">User ID</span>
                                <span className="font-medium">{fullCustomerNo}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/10 pb-2">
                                <span className="text-muted-foreground">Username</span>
                                <span className="font-medium flex items-center gap-2">
                                    {isValidating ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : validationResult?.account_name ? (
                                        <span className="text-green-500">{validationResult.account_name}</span>
                                    ) : validationResult?.message ? (
                                        <div className="flex flex-col">
                                            <span className="text-yellow-500 text-xs font-medium">Validasi Manual</span>
                                            <span className="text-xs text-muted-foreground mt-1">{validationResult.message}</span>
                                        </div>
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
                                <span className="text-muted-foreground">Pembayaran</span>
                                <span className="font-medium">
                                    {paymentMethods.find(m => m.code === selectedPayment)?.name}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-base font-bold text-primary pt-2">
                                <span>Total Bayar</span>
                                <span>Rp {priceDetails?.total_price.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                            <button
                                onClick={() => setShowValidationModal(false)}
                                className="py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors font-medium text-sm"
                                disabled={submitting}
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || isValidating || !!validationError}
                                className="py-3 rounded-xl bg-primary hover:bg-primary/90 text-black font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                            >
                                {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : "Bayar Sekarang"}
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
