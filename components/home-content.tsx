"use client";

import { useState, useEffect } from "react";
import GameCard from "@/components/game-card";
import SearchInput from "@/components/ui/search-input";
import { Brand } from "@/types/api";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Types
export interface CategoryWithBrands {
    category: string;
    brands: Brand[];
}

interface CarouselItem {
    id: number;
    image_url: string;
    title?: string;
    link_url?: string;
}

interface PopupItem {
    id: number;
    image_url: string;
    title?: string;
    description?: string;
    link_url?: string;
}

interface BrandPublicData {
    brand_name: string;
    image_url: string;
    is_best_seller: boolean;
    is_visible: boolean;
    status: string;
}

interface HomeContentProps {
    categoryData: CategoryWithBrands[];
    carousel?: CarouselItem[];
    brandImages?: Record<string, BrandPublicData>;
    popup?: PopupItem | null;
}

export default function HomeContent({ categoryData, carousel = [], brandImages = {}, popup }: HomeContentProps) {
    const [search, setSearch] = useState("");
    const [categoryLimits, setCategoryLimits] = useState<Record<string, number>>({});
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showPopup, setShowPopup] = useState(false);
    const [isPopupClosing, setIsPopupClosing] = useState(false);

    const INITIAL_LIMIT = 5; // Desktop: 1 row, Mobile: 2.5 rows (trigger Load More for 7 items)
    const LOAD_MORE_STEP = 10; // Divisible by 2, 5. Good balance.

    // ... (useEffect for popup and carousel remain same)

    // Check if popup should be shown (once per session)
    useEffect(() => {
        if (popup) {
            const popupShown = sessionStorage.getItem(`popup_shown_${popup.id}`);
            if (!popupShown) {
                setShowPopup(true);
            }
        }
    }, [popup]);

    // Auto-slide carousel
    useEffect(() => {
        if (carousel.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % carousel.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [carousel.length]);

    const closePopup = () => {
        // ... (remains same)
        setIsPopupClosing(true);
        setTimeout(() => {
            if (popup) {
                sessionStorage.setItem(`popup_shown_${popup.id}`, "true");
            }
            setShowPopup(false);
            setIsPopupClosing(false);
        }, 300);
    };

    const getBrandName = (brand: Brand | string) => {
        if (typeof brand === 'string') return brand;
        return brand.name;
    };

    const getBrandMeta = (brand: Brand | string) => {
        const name = getBrandName(brand);
        if (brandImages[name]) {
            return brandImages[name];
        }
        return undefined;
    };

    const getBrandImage = (brand: Brand | string) => {
        return getBrandMeta(brand)?.image_url;
    };

    const getBrandStatus = (brand: Brand | string) => {
        return getBrandMeta(brand)?.status || 'active';
    };

    // Check if brand is visible (default to true if not in brandImages)
    const isBrandVisible = (brand: Brand | string) => {
        const meta = getBrandMeta(brand);
        // If brand has meta data, check is_visible; otherwise default to true
        return meta?.is_visible !== false;
    };

    // ... (loadMore, showLess remain same)

    const loadMore = (category: string) => {
        setCategoryLimits(prev => ({
            ...prev,
            [category]: (prev[category] || INITIAL_LIMIT) + LOAD_MORE_STEP
        }));
    };

    const showLess = (category: string) => {
        setCategoryLimits(prev => ({
            ...prev,
            [category]: INITIAL_LIMIT
        }));
    };

    // Filter brands across all categories based on search AND visibility
    const filteredCategoryData = categoryData.map(catData => ({
        ...catData,
        brands: catData.brands.filter((brand) => {
            const name = getBrandName(brand);
            // Check visibility first
            if (!isBrandVisible(brand)) return false;
            // Then check search
            return name?.toLowerCase().includes(search.toLowerCase());
        })
    })).filter(catData => catData.brands.length > 0);

    // Flatten all brands for "all" view when searching
    const allFilteredBrands = filteredCategoryData.flatMap(c => c.brands);

    // Get Best Sellers (Unique list) - also filter by visibility
    const bestSellerBrands = Array.from(new Set(
        categoryData.flatMap(c => c.brands)
            .filter(b => isBrandVisible(b) && getBrandMeta(b)?.is_best_seller)
            .map(b => getBrandName(b))
    ));

    // Convert back to Brand objects (finding first occurrence)
    const bestSellerItems = bestSellerBrands.map(name => {
        return categoryData.flatMap(c => c.brands).find(b => getBrandName(b) === name)!;
    });

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % carousel.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + carousel.length) % carousel.length);

    return (
        <div className="space-y-8 max-w-6xl mx-auto text-left">
            {/* ... (Popup and Carousel remain same) */}
            {/* Popup */}
            {showPopup && popup && (
                <div
                    className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isPopupClosing ? "bg-black/0" : "bg-black/70"
                        }`}
                    onClick={closePopup}
                >
                    <div
                        className={`relative max-w-md w-full glass-card rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(195,17,12,0.3)] border border-primary/40 transition-all duration-300 ${isPopupClosing
                            ? "opacity-0 scale-95 translate-y-4"
                            : "opacity-100 scale-100 translate-y-0 animate-in fade-in zoom-in-95"
                            }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* ... popup content */}
                        <button
                            onClick={closePopup}
                            className="absolute top-3 right-3 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        {popup.link_url ? (
                            <a href={popup.link_url} onClick={closePopup}>
                                <img
                                    src={popup.image_url}
                                    alt={popup.title || "Promo"}
                                    className="w-full"
                                />
                            </a>
                        ) : (
                            <img
                                src={popup.image_url}
                                alt={popup.title || "Promo"}
                                className="w-full"
                            />
                        )}
                        {(popup.title || popup.description) && (
                            <div className="p-4 bg-card">
                                {popup.title && <h3 className="text-lg font-bold text-foreground">{popup.title}</h3>}
                                {popup.description && <p className="text-sm text-muted-foreground mt-1">{popup.description}</p>}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Carousel logic ... */}
            {carousel.length > 0 && (
                <section className="relative rounded-2xl overflow-hidden arcade-card">
                    <div className="relative aspect-[21/9] md:aspect-[3/1]">
                        {carousel.map((item, index) => (
                            <div
                                key={item.id}
                                className={`absolute inset-0 transition-opacity duration-500 ${index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
                                    }`}
                            >
                                {item.link_url ? (
                                    <a href={item.link_url} className="block w-full h-full">
                                        <img
                                            src={item.image_url}
                                            alt={item.title || `Slide ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </a>
                                ) : (
                                    <img
                                        src={item.image_url}
                                        alt={item.title || `Slide ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                                {item.title && (
                                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-background/90 to-transparent">
                                        <h3 className="text-lg md:text-xl font-bold text-foreground">{item.title}</h3>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Carousel Controls */}
                    {carousel.length > 1 && (
                        <>
                            <button
                                onClick={prevSlide}
                                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={nextSlide}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>

                            {/* Dots */}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                                {carousel.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentSlide(index)}
                                        className={`w-2 h-2 rounded-full transition-colors ${index === currentSlide ? "bg-white" : "bg-white/40"
                                            }`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </section>
            )}

            {/* Hero / Search Section */}
            <section className="flex flex-col items-center justify-center py-8 space-y-6 text-center">
                <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-linear-to-br from-white via-primary to-accent bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(230,80,27,0.5)]">
                        Govershop
                    </h1>
                    <p className="text-muted-foreground/80 max-w-lg mx-auto font-medium">
                        Top up games favoritmu dengan harga termurah, proses instan, dan terpercaya 100%.
                    </p>
                </div>

                <SearchInput value={search} onChange={setSearch} />
            </section>

            {/* Best Seller Section (Only when not searching) */}
            {!search && bestSellerItems.length > 0 && (
                <section className="w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-backwards">
                    <div className="flex items-center gap-3 mb-8 px-1">
                        <div className="w-1.5 h-8 bg-linear-to-b from-primary to-accent rounded-full glow-pulse shadow-[0_0_20px_rgba(230,80,27,0.8)]" />
                        <h2 className="text-2xl font-bold text-white tracking-tight neon-glow">
                            Paling Laris
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
                        {bestSellerItems.map((brand, idx) => {
                            const name = getBrandName(brand);
                            const image = getBrandImage(brand);
                            const status = getBrandStatus(brand);
                            return (
                                <motion.div
                                    key={`bestseller-${name}`}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <GameCard
                                        name={name}
                                        href={`/order/${encodeURIComponent(name)}`}
                                        image={image || `https://placehold.co/400x500/1e293b/ffffff?text=${encodeURIComponent(name)}`}
                                        status={status}
                                    />
                                </motion.div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Category Sections */}
            {search ? (
                // When searching, show flat results
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold border-l-4 border-primary pl-3">
                            Hasil Pencarian ({allFilteredBrands.length})
                        </h2>
                    </div>

                    {allFilteredBrands.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {allFilteredBrands.map((brand, idx) => {
                                const name = getBrandName(brand);
                                const image = getBrandImage(brand);
                                const status = getBrandStatus(brand);
                                return (
                                    <div
                                        key={`${name}-${idx}`}
                                        className="animate-in fade-in zoom-in-95 duration-500 fill-mode-backwards"
                                        style={{ animationDelay: `${(idx % 10) * 50}ms` }}
                                    >
                                        <GameCard
                                            name={name}
                                            href={`/order/${encodeURIComponent(name)}`}
                                            image={image || `https://placehold.co/400x500/1e293b/ffffff?text=${encodeURIComponent(name)}`}
                                            status={status}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-20 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                            <p>Tidak ada hasil untuk &ldquo;{search}&rdquo;</p>
                        </div>
                    )}
                </section>
            ) : (
                // Normal view: show by category
                filteredCategoryData.map((catData, categoryIdx) => {
                    const limit = categoryLimits[catData.category] || INITIAL_LIMIT;
                    const visibleBrands = catData.brands.slice(0, limit);
                    const hasMore = catData.brands.length > limit;
                    const isExpanded = limit > INITIAL_LIMIT;

                    return (
                        <section
                            key={catData.category}
                            className={`w-full`}
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: categoryIdx * 0.1, duration: 0.5 }}
                                className="flex items-center justify-between mb-8 px-1"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-8 bg-linear-to-b from-primary to-accent rounded-full glow-pulse shadow-[0_0_15px_rgba(195,17,12,0.6)]" />
                                    <h2 className="text-2xl font-bold text-white tracking-tight neon-glow">
                                        {catData.category}
                                    </h2>
                                </div>
                                <span className="text-xs md:text-sm font-medium px-3 py-1 rounded-full bg-secondary/50 border border-white/5 text-muted-foreground backdrop-blur-sm">
                                    {catData.brands.length} Produk
                                </span>
                            </motion.div>

                            <motion.div
                                layout
                                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6"
                            >
                                <AnimatePresence mode="popLayout">
                                    {visibleBrands.map((brand, idx) => {
                                        const name = getBrandName(brand);
                                        const image = getBrandImage(brand);
                                        const status = getBrandStatus(brand);
                                        return (
                                            <motion.div
                                                layout
                                                key={`${catData.category}-${name}`}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <GameCard
                                                    name={name}
                                                    href={`/order/${encodeURIComponent(name)}`}
                                                    image={image || `https://placehold.co/400x500/1e293b/ffffff?text=${encodeURIComponent(name)}`}
                                                    status={status}
                                                />
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </motion.div>

                            <div className="mt-10 flex justify-center gap-6">
                                <AnimatePresence>
                                    {hasMore && (
                                        <motion.button
                                            layout
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => loadMore(catData.category)}
                                            className="relative flex items-center justify-center w-12 h-12 rounded-full bg-secondary/50 border border-white/10 shadow-lg hover:shadow-primary/20 group overflow-hidden"
                                            title="Load More"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-emerald-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <ChevronDown className="w-6 h-6 text-primary group-hover:translate-y-0.5 transition-transform" />
                                        </motion.button>
                                    )}

                                    {isExpanded && (
                                        <motion.button
                                            layout
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => showLess(catData.category)}
                                            className="relative flex items-center justify-center w-12 h-12 rounded-full bg-secondary/50 border border-white/10 shadow-lg hover:bg-white/5 group"
                                            title="Show Less"
                                        >
                                            <ChevronUp className="w-6 h-6 text-muted-foreground group-hover:text-white transition-colors" />
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                            </div>
                        </section>
                    );
                })
            )}

            {/* Empty State */}
            {!search && filteredCategoryData.length === 0 && (
                <div className="py-20 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                    <p>Belum ada produk tersedia.</p>
                </div>
            )}
        </div>
    );
}
