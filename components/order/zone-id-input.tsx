"use client";

import { sanitizeZoneId } from "@/lib/game-input-config";

interface ZoneIdInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
}

/**
 * Zone ID Input dengan visual kurung built-in.
 * 
 * Tampilan:
 * ┌────────────────────────────┐
 * │  (  │  [input field]  │ ) │
 * └────────────────────────────┘
 * 
 * - Kurung ( dan ) adalah dekorasi visual, bukan bagian dari input
 * - Auto-sanitize saat user paste "(1234)" → hanya "1234" yang masuk
 */
export default function ZoneIdInput({
    value,
    onChange,
    placeholder = "1234",
    label = "Zone ID"
}: ZoneIdInputProps) {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        // Auto-sanitize: hapus kurung dan spasi
        const cleanValue = sanitizeZoneId(rawValue);
        onChange(cleanValue);
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text');
        // Sanitize pasted content
        const cleanValue = sanitizeZoneId(pastedText);
        onChange(cleanValue);
    };

    return (
        <div className="space-y-2">
            <label className="text-xs text-muted-foreground font-medium">{label}</label>
            <div className="flex items-center bg-background border border-border rounded-lg focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30 transition-all overflow-hidden">
                {/* Left parenthesis - visual only */}
                <span className="px-3 py-3 text-muted-foreground font-medium select-none bg-muted/30 border-r border-border">
                    (
                </span>

                {/* Input field */}
                <input
                    type="text"
                    inputMode="numeric"
                    value={value}
                    onChange={handleChange}
                    onPaste={handlePaste}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent p-3 focus:outline-none text-sm text-center"
                />

                {/* Right parenthesis - visual only */}
                <span className="px-3 py-3 text-muted-foreground font-medium select-none bg-muted/30 border-l border-border">
                    )
                </span>
            </div>
        </div>
    );
}
