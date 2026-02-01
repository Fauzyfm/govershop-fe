"use client";

import { useState } from "react";
import GameCard from "@/components/game-card";
import SearchInput from "@/components/ui/search-input";
import { Brand } from "@/types/api";

interface HomeContentProps {
    brands: Brand[];
}

export default function HomeContent({ brands }: HomeContentProps) {
    const [search, setSearch] = useState("");

    const getBrandName = (brand: Brand | string) => {
        if (typeof brand === 'string') return brand;
        return brand.name;
    };

    const getBrandImage = (brand: Brand | string) => {
        if (typeof brand === 'string') return undefined;
        return brand.image_url;
    };

    const filteredBrands = brands.filter((brand) => {
        const name = getBrandName(brand);
        return name?.toLowerCase().includes(search.toLowerCase());
    });

    return (
        <div className="space-y-8">
            {/* Hero / Search Section */}
            <section className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
                <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">
                        Govershop
                    </h1>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                        Top up games favoritmu dengan harga termurah, proses instan, dan terpercaya 100%.
                    </p>
                </div>

                <SearchInput value={search} onChange={setSearch} />
            </section>

            {/* Grid Section */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold border-l-4 border-primary pl-3">Daftar Game</h2>
                </div>

                {filteredBrands.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {filteredBrands.map((brand, idx) => {
                            const name = getBrandName(brand);
                            const image = getBrandImage(brand);
                            // Use idx as fallback key if name duplicates or string mode
                            return (
                                <GameCard
                                    key={`${name}-${idx}`}
                                    name={name}
                                    href={`/order/${encodeURIComponent(name)}`}
                                    image={image || `https://placehold.co/400x500/1e293b/ffffff?text=${encodeURIComponent(name)}`}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-20 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                        <p>Game "{search}" tidak ditemukan.</p>
                    </div>
                )}
            </section>
        </div>
    );
}
