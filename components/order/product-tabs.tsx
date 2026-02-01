"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProductTabsProps {
    tabs: string[];
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export default function ProductTabs({ tabs, activeTab, onTabChange }: ProductTabsProps) {
    return (
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button
                onClick={() => onTabChange("Semua")}
                className={cn(
                    "relative px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                    activeTab === "Semua"
                        ? "text-black bg-primary"
                        : "text-slate-400 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-700"
                )}
            >
                Semua
                {activeTab === "Semua" && (
                    <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-primary rounded-full -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                )}
            </button>

            {tabs.map((tab) => (
                <button
                    key={tab}
                    onClick={() => onTabChange(tab)}
                    className={cn(
                        "relative px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap capitalize",
                        activeTab === tab
                            ? "text-black bg-primary"
                            : "text-slate-400 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-700"
                    )}
                >
                    {tab}
                    {activeTab === tab && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-primary rounded-full -z-10"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                </button>
            ))}
        </div>
    );
}
