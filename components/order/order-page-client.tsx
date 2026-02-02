"use client";

import { useState } from "react";
import { ChevronDown, Info } from "lucide-react";
import api from "@/lib/api";
import { APIResponse, Product, PaymentMethod } from "@/types/api";
import OrderForm from "@/components/order/order-form";
import { cn } from "@/lib/utils";

interface OrderPageClientProps {
    brand: string;
    products: Product[];
    paymentMethods: PaymentMethod[];
    brandImage?: string;
}

// Step-by-step guide data based on brand
const getTopUpSteps = (brand: string) => {
    const brandUpper = brand.toUpperCase();

    if (brandUpper === "MOBILE LEGENDS") {
        return [
            { step: 1, title: "Masukkan User ID dan Zone ID", desc: "Buka game, tap profil, dan salin User ID beserta Zone ID" },
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

export default function OrderPageClient({ brand, products, paymentMethods, brandImage }: OrderPageClientProps) {
    const [showSteps, setShowSteps] = useState(false);
    const steps = getTopUpSteps(brand);

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Game Banner Header */}
            <div className="relative overflow-hidden rounded-2xl">
                {/* Background Image/Gradient */}
                <div className="relative h-40 md:h-48 bg-gradient-to-r from-primary/20 via-secondary/30 to-primary/20">
                    {brandImage && (
                        <img
                            src={brandImage}
                            alt={brand}
                            className="absolute inset-0 w-full h-full object-cover opacity-30"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end gap-4">
                        {/* Game Logo */}
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-4xl font-bold shadow-2xl shadow-primary/30 flex-shrink-0">
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
            <div className="glass rounded-xl border border-white/5 overflow-hidden">
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                {steps.map((step) => (
                                    <div
                                        key={step.step}
                                        className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-primary text-black text-sm font-bold flex items-center justify-center flex-shrink-0">
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
                initialProducts={products}
                paymentMethods={paymentMethods}
            />
        </div>
    );
}
