"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Tag, Globe, Sparkles, ShoppingBag, Gamepad2 } from "lucide-react";

// Server configuration with urlKey for clean URLs
// urlKey: used in URL query param (lowercase, no special chars)
// displayName: shown in chip
// priority: sort order (lower = first)
// icon: optional icon hint

interface ServerConfig {
    urlKey: string;
    displayName: string;
    flagImage: string;  // kept for backwards compatibility
    priority: number;
    iconHint?: "region" | "promo" | "product" | "platform" | "generic";
}

// Known servers with their configurations
export const KNOWN_SERVERS: Record<string, ServerConfig> = {
    // Indonesia group (Umum, Indonesia, Membership, ID all map here)
    "Umum": {
        urlKey: "indonesia",
        displayName: "Indonesia",
        flagImage: "/flag-logos/indonesia-flag.png",
        priority: 1,
        iconHint: "region",
    },
    "Indonesia": {
        urlKey: "indonesia",
        displayName: "Indonesia",
        flagImage: "/flag-logos/indonesia-flag.png",
        priority: 1,
        iconHint: "region",
    },
    "Membership": {
        urlKey: "indonesia",
        displayName: "Indonesia",
        flagImage: "/flag-logos/indonesia-flag.png",
        priority: 1,
        iconHint: "region",
    },
    "ID": {
        urlKey: "indonesia",
        displayName: "Indonesia",
        flagImage: "/flag-logos/indonesia-flag.png",
        priority: 1,
        iconHint: "region",
    },
    // Malaysia
    "MY": {
        urlKey: "malaysia",
        displayName: "Malaysia",
        flagImage: "/flag-logos/malaysia-flag.png",
        priority: 2,
        iconHint: "region",
    },
    "Malaysia": {
        urlKey: "malaysia",
        displayName: "Malaysia",
        flagImage: "/flag-logos/malaysia-flag.png",
        priority: 2,
        iconHint: "region",
    },
    // Philippines
    "PH": {
        urlKey: "philippines",
        displayName: "Philippines",
        flagImage: "/flag-logos/philippines-flag.png",
        priority: 3,
        iconHint: "region",
    },
    "Philippines": {
        urlKey: "philippines",
        displayName: "Philippines",
        flagImage: "/flag-logos/philippines-flag.png",
        priority: 3,
        iconHint: "region",
    },
    // Thailand
    "TH": {
        urlKey: "thailand",
        displayName: "Thailand",
        flagImage: "/flag-logos/thailand-flag.png",
        priority: 4,
        iconHint: "region",
    },
    "Thailand": {
        urlKey: "thailand",
        displayName: "Thailand",
        flagImage: "/flag-logos/thailand-flag.png",
        priority: 4,
        iconHint: "region",
    },
    // Brazil
    "BR": {
        urlKey: "brazil",
        displayName: "Brazil",
        flagImage: "/flag-logos/brazil-flag.png",
        priority: 5,
        iconHint: "region",
    },
    "Brazil": {
        urlKey: "brazil",
        displayName: "Brazil",
        flagImage: "/flag-logos/brazil-flag.png",
        priority: 5,
        iconHint: "region",
    },
    // Singapore
    "SG": {
        urlKey: "singapore",
        displayName: "Singapore",
        flagImage: "/flag-logos/singapore-flag.png",
        priority: 6,
        iconHint: "region",
    },
    "Singapore": {
        urlKey: "singapore",
        displayName: "Singapore",
        flagImage: "/flag-logos/singapore-flag.png",
        priority: 6,
        iconHint: "region",
    },
    // Global
    "Global": {
        urlKey: "global",
        displayName: "Global",
        flagImage: "/flag-logos/global-flag.png",
        priority: 7,
        iconHint: "region",
    },
    // Vietnam
    "VN": {
        urlKey: "vietnam",
        displayName: "Vietnam",
        flagImage: "/flag-logos/vietnam-flag.png",
        priority: 8,
        iconHint: "region",
    },
    "Vietnam": {
        urlKey: "vietnam",
        displayName: "Vietnam",
        flagImage: "/flag-logos/vietnam-flag.png",
        priority: 8,
        iconHint: "region",
    },
    // Taiwan
    "TW": {
        urlKey: "taiwan",
        displayName: "Taiwan",
        flagImage: "/flag-logos/taiwan-flag.png",
        priority: 9,
        iconHint: "region",
    },
    "Taiwan": {
        urlKey: "taiwan",
        displayName: "Taiwan",
        flagImage: "/flag-logos/taiwan-flag.png",
        priority: 9,
        iconHint: "region",
    },
};

// Server tab info type
export type ServerTabInfo = {
    urlKey: string;          // For URL: ?server=indonesia
    displayName: string;     // For display: "Indonesia"
    flagImage: string;       // For flag (kept for backwards compatibility)
    types: string[];         // Product types that belong to this tab
    priority: number;
    iconHint?: "region" | "promo" | "product" | "platform" | "generic";
};

// Get server config for a product type
function getServerConfigForType(productType: string): ServerConfig {
    if (KNOWN_SERVERS[productType]) {
        return KNOWN_SERVERS[productType];
    }
    // Unknown type - determine icon hint from name
    const lower = productType.toLowerCase();
    let iconHint: ServerConfig["iconHint"] = "generic";
    if (lower.includes("promo") || lower.includes("diskon") || lower.includes("special")) {
        iconHint = "promo";
    } else if (lower.includes("google") || lower.includes("play") || lower.includes("apple") || lower.includes("steam")) {
        iconHint = "platform";
    } else if (lower.includes("product") || lower.includes("item")) {
        iconHint = "product";
    }

    return {
        urlKey: productType.toLowerCase().replace(/\s+/g, '-'),
        displayName: productType,
        flagImage: "/flag-logos/global-flag.png",
        priority: 100,
        iconHint,
    };
}

// Build dynamic server tabs from products
export function buildServerTabs<T extends { type: string }>(products: T[]): ServerTabInfo[] {
    // Get all unique types from products
    const uniqueTypes = Array.from(new Set(products.map(p => p.type).filter(Boolean)));

    // Group by urlKey (this handles merging Indonesia types, etc.)
    const tabMap = new Map<string, ServerTabInfo>();

    uniqueTypes.forEach(type => {
        const config = getServerConfigForType(type);

        if (tabMap.has(config.urlKey)) {
            // Add this type to existing tab
            const existing = tabMap.get(config.urlKey)!;
            if (!existing.types.includes(type)) {
                existing.types.push(type);
            }
        } else {
            // Create new tab
            tabMap.set(config.urlKey, {
                urlKey: config.urlKey,
                displayName: config.displayName,
                flagImage: config.flagImage,
                types: [type],
                priority: config.priority,
                iconHint: config.iconHint,
            });
        }
    });

    // Convert to array and sort by priority
    const tabs = Array.from(tabMap.values());
    tabs.sort((a, b) => a.priority - b.priority);

    return tabs;
}

// Find tab by URL key
export function findTabByUrlKey(tabs: ServerTabInfo[], urlKey: string): ServerTabInfo | null {
    return tabs.find(t => t.urlKey === urlKey) || null;
}

// Filter products by selected tab
export function filterProductsByTab<T extends { type: string }>(
    products: T[],
    selectedTab: ServerTabInfo | null
): T[] {
    if (!selectedTab) return products;
    return products.filter(p => selectedTab.types.includes(p.type));
}

// Get icon component based on hint
function getChipIcon(hint?: string) {
    switch (hint) {
        case "region":
            return Globe;
        case "promo":
            return Sparkles;
        case "product":
            return ShoppingBag;
        case "platform":
            return Gamepad2;
        default:
            return Tag;
    }
}

interface ServerTabsProps {
    tabs: ServerTabInfo[];
    activeTab: ServerTabInfo | null;
    onTabChange: (tab: ServerTabInfo) => void;
    loading?: boolean;
}

export default function ServerTabs({ tabs, activeTab, onTabChange, loading }: ServerTabsProps) {
    if (tabs.length <= 1) {
        // Don't show tabs if only one server
        return null;
    }

    return (
        <div className="relative">
            {/* Loading overlay */}
            {loading && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span>Memuat...</span>
                    </div>
                </div>
            )}

            {/* Chips Container */}
            <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => {
                    const isActive = activeTab?.urlKey === tab.urlKey;
                    const IconComponent = getChipIcon(tab.iconHint);

                    return (
                        <motion.button
                            key={tab.urlKey}
                            onClick={() => onTabChange(tab)}
                            disabled={loading}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className={cn(
                                "relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-200",
                                "border focus:outline-none focus:ring-2 focus:ring-primary/30",
                                "disabled:opacity-50 disabled:cursor-not-allowed",
                                isActive
                                    ? "bg-primary text-black border-primary shadow-lg shadow-primary/20"
                                    : "bg-white/4 text-muted-foreground border-white/10 hover:border-white/20 hover:bg-white/8 hover:text-white"
                            )}
                        >
                            <IconComponent className={cn(
                                "w-3.5 h-3.5 shrink-0",
                                isActive ? "text-black/70" : "text-muted-foreground"
                            )} />
                            <span>{tab.displayName}</span>

                            {/* Active dot indicator */}
                            {isActive && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-1.5 h-1.5 rounded-full bg-black/30 ml-0.5"
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
