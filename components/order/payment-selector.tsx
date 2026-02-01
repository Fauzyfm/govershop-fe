import { PaymentMethod } from "@/types/api";
import { cn } from "@/lib/utils";
import { LayoutGrid, Smartphone, Wallet } from "lucide-react";

interface PaymentSelectorProps {
    methods: PaymentMethod[];
    selectedMethod: string | null;
    onSelect: (code: string) => void;
}

export default function PaymentSelector({ methods, selectedMethod, onSelect }: PaymentSelectorProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case 'qris': return <LayoutGrid className="w-6 h-6" />;
            case 'va': return <Wallet className="w-6 h-6" />;
            default: return <Smartphone className="w-6 h-6" />;
        }
    };

    const getFeeDisplay = (code: string) => {
        if (code.includes('qris')) return "0.7% + Rp 310";
        if (code.includes('paypal')) return "1%";
        if (code.includes('artha') || code.includes('sampoerna')) return "Rp 2.000";
        if (code.includes('_va')) return "Rp 3.500"; // All other VAs
        return "";
    };

    return (
        <div className="space-y-3">
            {methods.map((method) => (
                <button
                    key={method.code}
                    onClick={() => onSelect(method.code)}
                    className={cn(
                        "w-full flex items-center p-4 rounded-xl border transition-all",
                        selectedMethod === method.code
                            ? "bg-primary/20 border-primary"
                            : "bg-secondary/40 border-white/5 hover:bg-secondary/60"
                    )}
                >
                    <div className="p-2 rounded-md bg-background/50 text-foreground mr-4">
                        {getIcon(method.type)}
                    </div>
                    <div className="flex-1 text-left">
                        <h4 className="font-semibold">{method.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase">
                            <span>{method.type}</span>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <span className="text-primary/80 lowercase">{getFeeDisplay(method.code)}</span>
                        </div>
                    </div>
                    {selectedMethod === method.code && (
                        <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary flex items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        </div>
                    )}
                </button>
            ))}
        </div>
    );
}
