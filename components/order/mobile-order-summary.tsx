import { PriceCalculation } from "@/types/api";
import { Loader2, ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface MobileOrderSummaryProps {
    priceDetails: PriceCalculation | null;
    selectedProductName: string | null;
    submitting: boolean;
    disabled: boolean;
    onSubmit: () => void;
}

export default function MobileOrderSummary({
    priceDetails,
    selectedProductName,
    submitting,
    disabled,
    onSubmit
}: MobileOrderSummaryProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!priceDetails) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
            {/* Backdrop for expanded state */}
            {isExpanded && (
                <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm -top-[100vh] h-screen"
                    onClick={() => setIsExpanded(false)}
                />
            )}

            <div className="bg-[#1a1b26] border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] p-4 rounded-t-2xl">

                {/* Expand Toggle & Basic Info */}
                <div className="flex items-center justify-between mb-4" onClick={() => setIsExpanded(!isExpanded)}>
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Total Pembayaran</span>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-primary">
                                Rp {priceDetails.total_price.toLocaleString()}
                            </span>
                            {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
                        </div>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSubmit();
                        }}
                        disabled={disabled}
                        className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-black font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-primary/20"
                    >
                        {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : "Bayar"}
                    </button>
                </div>

                {/* Expanded Details */}
                <div className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out space-y-3",
                    isExpanded ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"
                )}>
                    <div className="pt-2 border-t border-white/10 text-sm space-y-2 pb-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Item</span>
                            <span className="font-medium text-right line-clamp-1">{selectedProductName || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Harga Produk</span>
                            <span>Rp {priceDetails.product_price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Biaya Admin</span>
                            <span>Rp {priceDetails.admin_fee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Biaya Transaksi</span>
                            <span>Rp {priceDetails.payment_fee.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
