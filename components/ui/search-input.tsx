"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function SearchInput({ value, onChange, placeholder = "Cari game..." }: SearchInputProps) {
    return (
        <div className="relative w-full max-w-md group">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors duration-300">
                <Search className="w-4.5 h-4.5" />
            </div>
            <Input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-12 w-full pl-11 pr-4 bg-white/4 border-white/8 rounded-full text-sm placeholder:text-muted-foreground/50 focus-visible:border-primary/50 focus-visible:ring-primary/20 focus-visible:bg-white/6 transition-all duration-300"
                placeholder={placeholder}
            />
        </div>
    );
}
