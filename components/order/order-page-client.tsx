"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Info, X } from "lucide-react";
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

interface OrderPageClientProps {
    brand: string;
    products: Product[];
    paymentMethods: PaymentMethod[];
    brandImage?: string;
    dynamicSteps?: TopupStep[];
    description?: string;
    brandPopup?: BrandPopup | null;
}

// Default fallback logic using hardcoded data
const getDefaultTopUpSteps = (brand: string): TopupStep[] => {
    const brandUpper = brand.toUpperCase();

    if (brandUpper === "MOBILE LEGENDS") {
        return [
            { step: 1, title: "Masukkan User ID dan Zone ID", desc: "Buka game, tap profil, dan salin User ID beserta Zone ID" },
            { step: 2, title: "Pilih Nominal Diamond", desc: "Pilih jumlah diamond yang ingin dibeli" },
            { step: 3, title: "Pilih Pembayaran", desc: "Pilih metode pembayaran (QRIS, Bank Transfer, dll)" },
            { step: 4, title: "Selesaikan Pembayaran", desc: "Bayar sesuai nominal dan diamond masuk otomatis" },
        ];
    }
    // ... (rest of logic can be same or simplified)
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

export default function OrderPageClient({ brand, products, paymentMethods, brandImage, dynamicSteps, description, brandPopup }: OrderPageClientProps) {
    const [showSteps, setShowSteps] = useState(description ? true : false);
    const [showPopup, setShowPopup] = useState(false);

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
            {/* Brand Popup Dialog - outside main container for full-screen overlay */}
            {showPopup && brandPopup && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 pt-20 pb-4 animate-in fade-in duration-200" onClick={() => setShowPopup(false)}>
                    <div className="relative bg-secondary border border-primary/20 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl shadow-primary/10 max-h-[75vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        {/* Close Button */}
                        <button
                            onClick={() => setShowPopup(false)}
                            className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white/70 hover:text-white transition-colors backdrop-blur-sm"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Popup Image */}
                        {brandPopup.image_url && (
                            <div className="w-full shrink-0">
                                <img
                                    src={brandPopup.image_url}
                                    alt={brandPopup.title || "Promo"}
                                    className="w-full object-cover max-h-[250px]"
                                />
                            </div>
                        )}

                        {/* Popup Content - Scrollable */}
                        <div className="p-5 space-y-3 overflow-y-auto flex-1">
                            {brandPopup.title && (
                                <h3 className="text-lg font-bold text-white text-center">{brandPopup.title}</h3>
                            )}
                            {brandPopup.description && (
                                <div
                                    className="text-sm text-white/60 leading-relaxed prose prose-invert prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5"
                                    dangerouslySetInnerHTML={{ __html: brandPopup.description }}
                                />
                            )}
                            <div className="flex gap-3 pt-2 justify-center">
                                {brandPopup.link_url && (
                                    <a
                                        href={brandPopup.link_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 py-2.5 text-center text-sm font-medium bg-primary hover:bg-primary/80 text-white rounded-xl transition-colors shadow-lg shadow-primary/20"
                                    >
                                        Lihat Selengkapnya
                                    </a>
                                )}
                                <button
                                    onClick={() => setShowPopup(false)}
                                    className={`${brandPopup.link_url ? '' : 'flex-1'} py-2.5 px-6 text-center text-sm font-medium bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors`}
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto space-y-6">
                {/* Game Banner Header */}
                <div className="relative overflow-hidden rounded-2xl">
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
                <OrderForm
                    brand={brand}
                    initialProducts={sortedProducts}
                    paymentMethods={paymentMethods}
                />
            </div>
        </>
    );
}
