"use client";

import { useState } from "react";
import Image from "next/image";
import { PaymentMethod } from "@/types/api";
import { cn } from "@/lib/utils";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PaymentSelectorProps {
    methods: PaymentMethod[];
    selectedMethod: string | null;
    onSelect: (code: string) => void;
    productPrice?: number; // Price of selected product (for PayPal minimum check)
}

// Minimum price for PayPal (Rp 3.000)
const PAYPAL_MIN_PRICE = 3000;

// Payment method logos mapping
const PAYMENT_LOGOS: Record<string, string> = {
    // QRIS
    "qris": "https://upld.zone.id/uploads/exi8kviq/qris-logo.webp",
    // Virtual Account - Bank Besar
    "bni_va": "https://upld.zone.id/uploads/exi8kviq/bank-bni-seeklogo.webp",
    "bri_va": "https://upld.zone.id/uploads/exi8kviq/bank-bri-seeklogo.webp",
    "permata_va": "https://upld.zone.id/uploads/exi8kviq/permata.webp",
    "cimb_niaga_va": "https://upld.zone.id/uploads/exi8kviq/cimb-niaga.webp",
    // Virtual Account - Bank Lainnya
    "maybank_va": "https://upld.zone.id/uploads/exi8kviq/maybank-goversho.webp",
    "bnc_va": "https://upld.zone.id/uploads/exi8kviq/bnc-ggovershop.webp",
    "sampoerna_va": "https://upld.zone.id/uploads/exi8kviq/bank-sahabat-sampoerna.webp",
    "artha_graha_va": "https://upld.zone.id/uploads/exi8kviq/bank-artha-graha-internasional.webp",
    "atm_bersama_va": "https://upld.zone.id/uploads/exi8kviq/atm-bersama-kita.webp",
    // PayPal
    "paypal": "https://upld.zone.id/uploads/exi8kviq/paypal-govershop.webp",
    // Fallback
    "default": "https://upld.zone.id/uploads/exi8kviq/virtual-account.webp",
};

// Get logo for payment method
function getPaymentLogo(code: string): string {
    // Check exact match first
    if (PAYMENT_LOGOS[code]) {
        return PAYMENT_LOGOS[code];
    }
    // Check partial match
    for (const [key, value] of Object.entries(PAYMENT_LOGOS)) {
        if (code.toLowerCase().includes(key.toLowerCase())) {
            return value;
        }
    }
    return PAYMENT_LOGOS.default;
}

// Category configuration
interface PaymentCategory {
    id: string;
    name: string;
    icon: string;
    description: string;
}

const PAYMENT_CATEGORIES: PaymentCategory[] = [
    {
        id: "qris",
        name: "QRIS",
        icon: "https://upld.zone.id/uploads/exi8kviq/qris-logo.webp",
        description: "Scan & bayar dengan aplikasi e-wallet"
    },
    {
        id: "va",
        name: "Virtual Account",
        icon: "https://upld.zone.id/uploads/exi8kviq/virtual-account.webp",
        description: "Transfer via ATM atau Mobile Banking"
    },
    {
        id: "paypal",
        name: "PayPal",
        icon: "https://upld.zone.id/uploads/exi8kviq/paypal-govershop.webp",
        description: "Bayar dengan akun PayPal"
    },
];

// Get fee display based on Pakasir pricing
function getFeeDisplay(code: string): string {
    if (code.includes('qris')) return "0.7% + Rp 310";
    if (code.includes('paypal')) return "1% (min Rp 3.000)";
    if (code.includes('artha') || code.includes('sampoerna')) return "Rp 2.000";
    if (code.includes('_va')) return "Rp 3.500";
    return "";
}

// Group methods by type
function groupMethodsByType(methods: PaymentMethod[]): Record<string, PaymentMethod[]> {
    return methods.reduce((acc, method) => {
        const type = method.type || 'other';
        if (!acc[type]) {
            acc[type] = [];
        }
        acc[type].push(method);
        return acc;
    }, {} as Record<string, PaymentMethod[]>);
}

export default function PaymentSelector({ methods, selectedMethod, onSelect, productPrice }: PaymentSelectorProps) {
    // Track which categories are expanded (default: all closed)
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

    // Check if PayPal is available (only for products >= Rp 3.000)
    const isPaypalAvailable = !productPrice || productPrice >= PAYPAL_MIN_PRICE;

    // Group methods by type
    const groupedMethods = groupMethodsByType(methods);

    // Toggle category expansion
    const toggleCategory = (categoryId: string) => {
        setExpandedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    // Check if any method in category is selected
    const isCategorySelected = (categoryId: string): boolean => {
        const categoryMethods = groupedMethods[categoryId] || [];
        return categoryMethods.some(m => m.code === selectedMethod);
    };

    // Get selected method name in category
    const getSelectedMethodName = (categoryId: string): string | null => {
        const categoryMethods = groupedMethods[categoryId] || [];
        const selected = categoryMethods.find(m => m.code === selectedMethod);
        return selected?.name || null;
    };

    return (
        <div className="space-y-3">
            {PAYMENT_CATEGORIES.map((category) => {
                const categoryMethods = groupedMethods[category.id] || [];
                if (categoryMethods.length === 0) return null;

                const isExpanded = expandedCategories.includes(category.id);
                const hasSelection = isCategorySelected(category.id);
                const selectedName = getSelectedMethodName(category.id);

                // Disable PayPal if product price is below minimum
                const isDisabled = category.id === 'paypal' && !isPaypalAvailable;

                return (
                    <div
                        key={category.id}
                        className={cn(
                            "rounded-xl border overflow-hidden transition-all",
                            isDisabled
                                ? "border-white/5 bg-secondary/20 opacity-60"
                                : hasSelection
                                    ? "border-primary/50 bg-primary/5"
                                    : "border-white/10 bg-secondary/30"
                        )}
                    >
                        {/* Category Header (Dropdown Toggle) */}
                        <button
                            onClick={() => !isDisabled && toggleCategory(category.id)}
                            disabled={isDisabled}
                            className={cn(
                                "w-full flex items-center justify-between p-4 transition-colors",
                                isDisabled
                                    ? "cursor-not-allowed"
                                    : "hover:bg-white/5"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                {/* Category Icon/Logo */}
                                <div className="w-10 h-10 rounded-lg bg-white p-1.5 flex items-center justify-center overflow-hidden">
                                    <img
                                        src={category.icon}
                                        alt={category.name}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div className="text-left">
                                    <h4 className="font-semibold flex items-center gap-2">
                                        {category.name}
                                        {hasSelection && (
                                            <span className="text-xs font-normal text-primary bg-primary/20 px-2 py-0.5 rounded-full">
                                                {selectedName}
                                            </span>
                                        )}
                                        {isDisabled && (
                                            <span className="text-xs font-normal text-red-400 bg-red-400/20 px-2 py-0.5 rounded-full">
                                                Min. Rp 3.000
                                            </span>
                                        )}
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                        {isDisabled
                                            ? "Harga produk harus minimal Rp 3.000 untuk PayPal"
                                            : category.description}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {!isDisabled && (
                                    <>
                                        <span className="text-xs text-muted-foreground">
                                            {categoryMethods.length} opsi
                                        </span>
                                        <ChevronDown
                                            className={cn(
                                                "w-5 h-5 text-muted-foreground transition-transform duration-200",
                                                isExpanded && "rotate-180"
                                            )}
                                        />
                                    </>
                                )}
                            </div>
                        </button>

                        {/* Category Content (Collapsible) */}
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-4 pb-4 pt-1 space-y-2">
                                        {categoryMethods.map((method) => {
                                            const isSelected = selectedMethod === method.code;
                                            const logo = getPaymentLogo(method.code);

                                            return (
                                                <button
                                                    key={method.code}
                                                    onClick={() => onSelect(method.code)}
                                                    className={cn(
                                                        "w-full flex items-center p-3 rounded-lg border transition-all",
                                                        isSelected
                                                            ? "bg-primary/20 border-primary shadow-lg shadow-primary/10"
                                                            : "bg-background/30 border-white/5 hover:bg-background/50 hover:border-white/10"
                                                    )}
                                                >
                                                    {/* Payment Logo */}
                                                    <div className="w-12 h-8 rounded bg-white p-1 mr-3 flex items-center justify-center overflow-hidden">
                                                        <img
                                                            src={logo}
                                                            alt={method.name}
                                                            className="w-full h-full object-contain"
                                                        />
                                                    </div>

                                                    {/* Payment Info */}
                                                    <div className="flex-1 text-left">
                                                        <h5 className="font-medium text-sm">{method.name}</h5>
                                                        {getFeeDisplay(method.code) && (
                                                            <span className="text-xs text-muted-foreground">
                                                                Fee: <span className="text-primary/80">{getFeeDisplay(method.code)}</span>
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Selection Indicator */}
                                                    <div className={cn(
                                                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                                        isSelected
                                                            ? "bg-primary border-primary"
                                                            : "border-white/20"
                                                    )}>
                                                        {isSelected && (
                                                            <Check className="w-3 h-3 text-black" />
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}

            {/* Other payment methods (if any) */}
            {Object.entries(groupedMethods).map(([type, typeMethods]) => {
                // Skip if already shown in categories
                if (PAYMENT_CATEGORIES.some(c => c.id === type)) return null;
                if (typeMethods.length === 0) return null;

                return (
                    <div key={type} className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider px-1">
                            {type}
                        </h4>
                        {typeMethods.map((method) => {
                            const isSelected = selectedMethod === method.code;
                            const logo = getPaymentLogo(method.code);

                            return (
                                <button
                                    key={method.code}
                                    onClick={() => onSelect(method.code)}
                                    className={cn(
                                        "w-full flex items-center p-4 rounded-xl border transition-all",
                                        isSelected
                                            ? "bg-primary/20 border-primary"
                                            : "bg-secondary/40 border-white/5 hover:bg-secondary/60"
                                    )}
                                >
                                    <div className="w-12 h-8 rounded bg-white p-1 mr-4 flex items-center justify-center overflow-hidden">
                                        <img
                                            src={logo}
                                            alt={method.name}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h4 className="font-semibold">{method.name}</h4>
                                        {getFeeDisplay(method.code) && (
                                            <span className="text-xs text-muted-foreground">
                                                Fee: {getFeeDisplay(method.code)}
                                            </span>
                                        )}
                                    </div>
                                    {isSelected && (
                                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                            <Check className="w-4 h-4 text-black" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
}
