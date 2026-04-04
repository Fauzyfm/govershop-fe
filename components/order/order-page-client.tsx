"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Info, X, Megaphone, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { APIResponse, Product, PaymentMethod } from "@/types/api";
import OrderForm from "@/components/order/order-form";
import { cn } from "@/lib/utils";

interface TopupStep {
    step: number;
    title: string;
    desc: string;
}

interface BrandPopup {
    id: number;
    image_url: string;
    title?: string;
    description?: string;
    link_url?: string;
}

interface InputFieldConfig {
    key: string;
    type: string;
    label: string;
    placeholder: string;
    required: boolean;
    options?: string[];
}

interface OrderPageClientProps {
    brand: string;
    products: Product[];
    paymentMethods: PaymentMethod[];
    brandImage?: string;
    dynamicSteps?: TopupStep[];
    description?: string;
    brandPopup?: BrandPopup | null;
    inputFields?: InputFieldConfig[];
    inputSeparator?: string;
}

// Default fallback logic using hardcoded data
const getDefaultTopUpSteps = (brand: string): TopupStep[] => {
    const brandUpper = brand.toUpperCase();

    if (brandUpper === "MOBILE LEGENDS") {
        return [
            { step: 1, title: "Masukkan User ID & Zone ID", desc: "Buka game, tap profil, salin User ID dan Zone ID" },
            { step: 2, title: "Pilih Nominal Diamond", desc: "Pilih jumlah diamond yang ingin dibeli" },
            { step: 3, title: "Pilih Pembayaran", desc: "Pilih metode pembayaran (QRIS, Bank Transfer, dll)" },
            { step: 4, title: "Selesaikan Pembayaran", desc: "Bayar sesuai nominal dan diamond masuk otomatis" },
        ];
    }
    
    if (brandUpper === "FREE FIRE" || brandUpper === "FREE FIRE MAX") {
        return [
            { step: 1, title: "Masukkan Player ID", desc: "Buka game, tap profil, dan salin Player ID" },
            { step: 2, title: "Pilih Nominal Diamond", desc: "Pilih jumlah diamond yang ingin dibeli" },
            { step: 3, title: "Pilih Pembayaran", desc: "Pilih metode pembayaran yang tersedia" },
            { step: 4, title: "Selesaikan Pembayaran", desc: "Bayar dan diamond masuk ke akun kamu" },
        ];
    }

    // Default for other games/pulsa
    return [
        { step: 1, title: "Masukkan ID/Nomor Tujuan", desc: "Masukkan User ID game atau nomor HP" },
        { step: 2, title: "Pilih Item/Nominal", desc: "Pilih item atau nominal yang ingin dibeli" },
        { step: 3, title: "Pilih Pembayaran", desc: "Pilih metode pembayaran yang tersedia" },
        { step: 4, title: "Selesaikan Pembayaran", desc: "Bayar dan item masuk ke akun kamu" },
    ];
};

export default function OrderPageClient({ brand, products: ssrProducts, paymentMethods: ssrPaymentMethods, brandImage, dynamicSteps, description, brandPopup, inputFields, inputSeparator }: OrderPageClientProps) {
    const [showSteps, setShowSteps] = useState(description ? true : false);
    const [showPopup, setShowPopup] = useState(false);

    // Client-side fallback states (for when SSR data is empty due to API issues)
    const [products, setProducts] = useState<Product[]>(ssrProducts);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(ssrPaymentMethods);
    const [isClientLoading, setIsClientLoading] = useState(false);

    // Client-side fallback: fetch data from browser if SSR returned empty
    useEffect(() => {
        const needsProducts = !ssrProducts || ssrProducts.length === 0;
        const needsPayments = !ssrPaymentMethods || ssrPaymentMethods.length === 0;

        if (needsProducts || needsPayments) {
            setIsClientLoading(true);
            const fetches: Promise<void>[] = [];

            if (needsProducts) {
                fetches.push(
                    api.get<any, APIResponse<{ products: Product[] }>>(`/products?brand=${encodeURIComponent(brand)}`)
                        .then(res => {
                            const allProducts = res.data?.products || [];
                            const filtered = allProducts.filter(p =>
                                p.brand.toLowerCase() === brand.toLowerCase() &&
                                !p.product_name.toLowerCase().includes("cek username") &&
                                !p.buyer_sku_code.toLowerCase().startsWith("checkuser")
                            );
                            if (filtered.length > 0) setProducts(filtered);
                        })
                        .catch(() => {})
                );
            }

            if (needsPayments) {
                fetches.push(
                    api.get<any, APIResponse<{ payment_methods: PaymentMethod[] }>>('/payment-methods')
                        .then(res => {
                            const methods = res.data?.payment_methods || [];
                            if (methods.length > 0) setPaymentMethods(methods);
                        })
                        .catch(() => {})
                );
            }

            Promise.all(fetches).finally(() => setIsClientLoading(false));
        }
    }, [brand, ssrProducts, ssrPaymentMethods]);

    // Show popup on mount if there's an active brand popup
    useEffect(() => {
        if (brandPopup) {
            setShowPopup(true);
        }
    }, [brandPopup]);

    // Use dynamic steps if available and not empty, otherwise fallback
    const steps = (dynamicSteps && dynamicSteps.length > 0) ? dynamicSteps : getDefaultTopUpSteps(brand);

    // Sort products by buyer_sku_code ASC (Smallest to Largest) - Client Side
    const sortedProducts = [...products].sort((a, b) => {
        // Natural sort for mixed alphanumeric strings (pre2 < pre10)
        return a.buyer_sku_code.localeCompare(b.buyer_sku_code, undefined, { numeric: true, sensitivity: 'base' });
    });

    return (
        <>
            {/* Brand Popup Dialog - Premium Redesign */}
            <AnimatePresence>
                {showPopup && brandPopup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-md px-4 pt-20 pb-4"
                        onClick={() => setShowPopup(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-primary/20 max-h-[80vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Decorative Background */}
                            <div className="absolute inset-0 bg-[#111218]" />
                            <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-primary/8 blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-primary/5 blur-3xl" />

                            {/* Animated Gradient Top Strip */}
                            <div className="relative h-1 w-full overflow-hidden shrink-0">
                                <div className="absolute inset-0 bg-linear-to-r from-primary via-orange-400 to-primary animate-[shimmer_3s_ease-in-out_infinite] bg-size-[200%_100%]" />
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={() => setShowPopup(false)}
                                className="absolute top-3.5 right-3.5 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/50 hover:text-white transition-all duration-200 hover:rotate-90"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            {/* Popup Image (if exists) */}
                            {brandPopup.image_url && (
                                <div className="relative w-full shrink-0 overflow-hidden">
                                    <img
                                        src={brandPopup.image_url}
                                        alt={brandPopup.title || "Info"}
                                        className="w-full object-cover max-h-[220px]"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-[#111218] to-transparent" />
                                </div>
                            )}

                            {/* Header Section (for text-only popups without image) */}
                            {!brandPopup.image_url && (
                                <div className="relative px-6 pt-6 pb-2 shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shrink-0">
                                            <Megaphone className="w-5 h-5 text-primary" />
                                        </div>
                                        {brandPopup.title && (
                                            <h3 className="text-lg font-bold bg-linear-to-r from-white to-white/70 bg-clip-text text-transparent leading-snug pr-8">
                                                {brandPopup.title}
                                            </h3>
                                        )}
                                    </div>
                                    <div className="mt-3 h-px w-full bg-linear-to-r from-primary/30 via-white/10 to-transparent" />
                                </div>
                            )}

                            {/* Title (when there IS an image — show below image) */}
                            {brandPopup.image_url && brandPopup.title && (
                                <div className="relative px-6 pt-4 pb-1 shrink-0">
                                    <h3 className="text-lg font-bold bg-linear-to-r from-white to-white/70 bg-clip-text text-transparent text-center">
                                        {brandPopup.title}
                                    </h3>
                                </div>
                            )}

                            {/* Scrollable Content */}
                            <div className="relative px-6 py-4 overflow-y-auto flex-1 custom-scrollbar">
                                {brandPopup.description && (
                                    <div
                                        className="text-sm text-white/55 leading-relaxed prose prose-invert prose-sm max-w-none
                                            [&_strong]:text-white/90 [&_strong]:font-semibold
                                            [&_b]:text-white/90 [&_b]:font-semibold
                                            [&_h1]:text-white/90 [&_h1]:text-base [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2
                                            [&_h2]:text-white/90 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-1.5
                                            [&_h3]:text-white/90 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1.5
                                            [&_ul]:list-none [&_ul]:pl-0 [&_ul]:space-y-2 [&_ul]:my-3
                                            [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-2 [&_ol]:my-3
                                            [&_li]:relative [&_li]:pl-5 [&_li]:text-white/55
                                            [&_ul>li]:before:content-[''] [&_ul>li]:before:absolute [&_ul>li]:before:left-0 [&_ul>li]:before:top-[9px] [&_ul>li]:before:w-1.5 [&_ul>li]:before:h-1.5 [&_ul>li]:before:rounded-full [&_ul>li]:before:bg-primary/60
                                            [&_p]:my-2 [&_p]:text-white/55
                                            [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2"
                                        dangerouslySetInnerHTML={{ __html: brandPopup.description }}
                                    />
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="relative px-6 pb-5 pt-2 shrink-0">
                                <div className="h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent mb-4" />
                                <div className="flex gap-3">
                                    {brandPopup.link_url && (
                                        <a
                                            href={brandPopup.link_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 py-2.5 text-center text-sm font-semibold bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white rounded-xl transition-all duration-200 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                        >
                                            Lihat Selengkapnya
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    )}
                                    <button
                                        onClick={() => setShowPopup(false)}
                                        className={cn(
                                            "py-2.5 px-6 text-center text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white rounded-xl transition-all duration-200",
                                            !brandPopup.link_url && "flex-1"
                                        )}
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edge-to-Edge Wave Background Header Section */}
            <section
                className="w-screen relative left-1/2 -translate-x-1/2 overflow-hidden -mt-8 pt-8 pb-10"
                style={{
                    backgroundImage: 'url(/wave-bg.png)',
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12">
                    {/* Game Banner Header */}
                    <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-primary/5">
                        {/* Background Image/Gradient */}
                        <div className="relative h-40 md:h-48 bg-linear-to-r from-background via-secondary to-background border-b border-primary/20">
                            {brandImage && (
                                <img
                                    src={brandImage}
                                    alt={brand}
                                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                                />
                            )}
                            <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />

                            {/* Content Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end gap-4">
                                {/* Game Logo */}
                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-linear-to-br from-primary via-secondary to-background backdrop-blur-sm border border-primary/40 flex items-center justify-center text-4xl font-bold shadow-[0_0_30px_rgba(195,17,12,0.4)] shrink-0">
                                    {brandImage ? (
                                        <img
                                            src={brandImage}
                                            alt={brand}
                                            className="w-full h-full object-cover rounded-xl"
                                        />
                                    ) : (
                                        brand.substring(0, 2).toUpperCase()
                                    )}
                                </div>

                                {/* Game Info */}
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-2xl md:text-3xl font-bold truncate">{brand}</h1>
                                    <p className="text-sm text-muted-foreground">Top Up Cepat, Aman & Terpercaya</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-6xl mx-auto space-y-6 mt-6">
                {/* Step-by-Step Dropdown */}
                <div className="glass rounded-xl border border-primary/10 overflow-hidden">
                    <button
                        onClick={() => setShowSteps(!showSteps)}
                        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                <Info className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-semibold">Cara Top Up {brand}</span>
                        </div>
                        <ChevronDown className={cn(
                            "w-5 h-5 text-muted-foreground transition-transform duration-200",
                            showSteps && "rotate-180"
                        )} />
                    </button>

                    {/* Collapsible Content */}
                    <div className={cn(
                        "grid transition-all duration-300 ease-in-out",
                        showSteps ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}>
                        <div className="overflow-hidden">
                            <div className="px-4 pb-4 pt-0">
                                {description && (
                                    <div
                                        className="mb-4 text-sm text-muted-foreground bg-white/5 p-3 rounded-lg border border-white/5 prose prose-invert prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5"
                                        dangerouslySetInnerHTML={{ __html: description }}
                                    />
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                    {steps.map((step) => (
                                        <div
                                            key={step.step}
                                            className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5"
                                        >
                                            <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shrink-0">
                                                {step.step}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-sm">{step.title}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Order Form */}
                {isClientLoading && products.length === 0 ? (
                    <div className="glass rounded-xl border border-white/5 p-8">
                        <div className="flex flex-col items-center justify-center gap-4">
                            <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm text-muted-foreground">Memuat produk...</p>
                        </div>
                    </div>
                ) : (
                    <OrderForm
                        brand={brand}
                        initialProducts={sortedProducts}
                        paymentMethods={paymentMethods}
                        inputFields={inputFields}
                        inputSeparator={inputSeparator}
                    />
                )}
            </div>
        </>
    );
}
