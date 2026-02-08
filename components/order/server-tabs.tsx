"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Server configuration with urlKey for clean URLs
// urlKey: used in URL query param (lowercase, no special chars)
// displayName: shown in tab
// flagImage: path to flag PNG
// types: product.type values that belong to this server
// priority: sort order (lower = first)

interface ServerConfig {
    urlKey: string;
    displayName: string;
    flagImage: string;
    priority: number;
}

// Known servers with their configurations
export const KNOWN_SERVERS: Record<string, ServerConfig> = {
    // Indonesia group (Umum, Indonesia, Membership, ID all map here)
    "Umum": {
        urlKey: "indonesia",
        displayName: "Indonesia",
        flagImage: "/flag-logos/indonesia-flag.png",
        priority: 1,
    },
    "Indonesia": {
        urlKey: "indonesia",
        displayName: "Indonesia",
        flagImage: "/flag-logos/indonesia-flag.png",
        priority: 1,
    },
    "Membership": {
        urlKey: "indonesia",
        displayName: "Indonesia",
        flagImage: "/flag-logos/indonesia-flag.png",
        priority: 1,
    },
    "ID": {
        urlKey: "indonesia",
        displayName: "Indonesia",
        flagImage: "/flag-logos/indonesia-flag.png",
        priority: 1,
    },
    // Malaysia
    "MY": {
        urlKey: "malaysia",
        displayName: "Malaysia",
        flagImage: "/flag-logos/malaysia-flag.png",
        priority: 2,
    },
    "Malaysia": {
        urlKey: "malaysia",
        displayName: "Malaysia",
        flagImage: "/flag-logos/malaysia-flag.png",
        priority: 2,
    },
    // Philippines
    "PH": {
        urlKey: "philippines",
        displayName: "Philippines",
        flagImage: "/flag-logos/philippines-flag.png",
        priority: 3,
    },
    "Philippines": {
        urlKey: "philippines",
        displayName: "Philippines",
        flagImage: "/flag-logos/philippines-flag.png",
        priority: 3,
    },
    // Thailand
    "TH": {
        urlKey: "thailand",
        displayName: "Thailand",
        flagImage: "/flag-logos/thailand-flag.png",
        priority: 4,
    },
    "Thailand": {
        urlKey: "thailand",
        displayName: "Thailand",
        flagImage: "/flag-logos/thailand-flag.png",
        priority: 4,
    },
    // Brazil
    "BR": {
        urlKey: "brazil",
        displayName: "Brazil",
        flagImage: "/flag-logos/brazil-flag.png",
        priority: 5,
    },
    "Brazil": {
        urlKey: "brazil",
        displayName: "Brazil",
        flagImage: "/flag-logos/brazil-flag.png",
        priority: 5,
    },
    // Singapore
    "SG": {
        urlKey: "singapore",
        displayName: "Singapore",
        flagImage: "/flag-logos/singapore-flag.png",
        priority: 6,
    },
    "Singapore": {
        urlKey: "singapore",
        displayName: "Singapore",
        flagImage: "/flag-logos/singapore-flag.png",
        priority: 6,
    },
    // Global
    "Global": {
        urlKey: "global",
        displayName: "Global",
        flagImage: "/flag-logos/global-flag.png",
        priority: 7,
    },
    // Vietnam
    "VN": {
        urlKey: "vietnam",
        displayName: "Vietnam",
        flagImage: "/flag-logos/vietnam-flag.png",
        priority: 8,
    },
    "Vietnam": {
        urlKey: "vietnam",
        displayName: "Vietnam",
        flagImage: "/flag-logos/vietnam-flag.png",
        priority: 8,
    },
    // Taiwan
    "TW": {
        urlKey: "taiwan",
        displayName: "Taiwan",
        flagImage: "/flag-logos/taiwan-flag.png",
        priority: 9,
    },
    "Taiwan": {
        urlKey: "taiwan",
        displayName: "Taiwan",
        flagImage: "/flag-logos/taiwan-flag.png",
        priority: 9,
    },
};

// Server tab info type
export type ServerTabInfo = {
    urlKey: string;          // For URL: ?server=indonesia
    displayName: string;     // For display: "Indonesia"
    flagImage: string;       // For flag: /flag-logos/indonesia-flag.png
    types: string[];         // Product types that belong to this tab
    priority: number;
};

// Get server config for a product type
function getServerConfigForType(productType: string): ServerConfig {
    if (KNOWN_SERVERS[productType]) {
        return KNOWN_SERVERS[productType];
    }
    // Unknown type - use type name as display, global flag
    return {
        urlKey: productType.toLowerCase().replace(/\s+/g, '-'),
        displayName: productType,
        flagImage: "/flag-logos/global-flag.png",
        priority: 100,
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

            {/* Tabs Container */}
            <div className="flex gap-2 p-1 bg-secondary/30 rounded-xl overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => {
                    const isActive = activeTab?.urlKey === tab.urlKey;

                    return (
                        <button
                            key={tab.urlKey}
                            onClick={() => onTabChange(tab)}
                            disabled={loading}
                            className={cn(
                                "relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap",
                                "hover:text-white focus:outline-none focus:ring-2 focus:ring-primary/30",
                                "disabled:opacity-50 disabled:cursor-not-allowed",
                                isActive ? "text-black" : "text-muted-foreground hover:bg-white/5"
                            )}
                        >
                            {/* Active indicator with animation */}
                            {isActive && (
                                <motion.div
                                    layoutId="serverTabIndicator"
                                    className="absolute inset-0 bg-primary rounded-lg shadow-lg shadow-primary/30"
                                    transition={{
                                        type: "spring",
                                        stiffness: 500,
                                        damping: 30,
                                    }}
                                />
                            )}

                            {/* Flag Image */}
                            <Image
                                src={tab.flagImage}
                                alt={tab.displayName}
                                width={20}
                                height={14}
                                className="relative z-10 rounded-sm object-cover"
                            />

                            {/* Tab Label - Hidden on mobile, visible on desktop */}
                            <span className="relative z-10 hidden md:inline">{tab.displayName}</span>
                        </button>
                    );
                })}
            </div>

            {/* Subtle border effect */}
            <div className="absolute inset-0 rounded-xl border border-white/5 pointer-events-none" />
        </div>
    );
}
