"use client";

import { useState, useEffect } from "react";
import GameCard from "@/components/game-card";
import SearchInput from "@/components/ui/search-input";
import { Brand } from "@/types/api";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, X } from "lucide-react";

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

interface HomeContentProps {
    categoryData: CategoryWithBrands[];
    carousel?: CarouselItem[];
    brandImages?: Record<string, string>;
    popup?: PopupItem | null;
}

export default function HomeContent({ categoryData, carousel = [], brandImages = {}, popup }: HomeContentProps) {
    const [search, setSearch] = useState("");
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showPopup, setShowPopup] = useState(false);
    const [isPopupClosing, setIsPopupClosing] = useState(false);

    const MAX_VISIBLE = 6;

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
        setIsPopupClosing(true);
        setTimeout(() => {
            if (popup) {
                sessionStorage.setItem(`popup_shown_${popup.id}`, "true");
            }
            setShowPopup(false);
            setIsPopupClosing(false);
        }, 300); // Match animation duration
    };

    const getBrandName = (brand: Brand | string) => {
        if (typeof brand === 'string') return brand;
        return brand.name;
    };

    const getBrandImage = (brand: Brand | string) => {
        const name = getBrandName(brand);
        // Only use custom image from Kelola Content
        // Do NOT use brand.image_url from products (that's for product items, not game cards)
        if (brandImages[name]) {
            return brandImages[name];
        }
        return undefined; // Will use placeholder
    };

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    // Filter brands across all categories based on search
    const filteredCategoryData = categoryData.map(catData => ({
        ...catData,
        brands: catData.brands.filter((brand) => {
            const name = getBrandName(brand);
            return name?.toLowerCase().includes(search.toLowerCase());
        })
    })).filter(catData => catData.brands.length > 0);

    // Flatten all brands for "all" view when searching
    const allFilteredBrands = filteredCategoryData.flatMap(c => c.brands);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % carousel.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + carousel.length) % carousel.length);

    return (
        <div className="space-y-8">
            {/* Popup */}
            {showPopup && popup && (
                <div
                    className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isPopupClosing ? "bg-black/0" : "bg-black/70"
                        }`}
                    onClick={closePopup}
                >
                    <div
                        className={`relative max-w-md w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${isPopupClosing
                                ? "opacity-0 scale-95 translate-y-4"
                                : "opacity-100 scale-100 translate-y-0 animate-in fade-in zoom-in-95"
                            }`}
                        onClick={(e) => e.stopPropagation()}
                    >
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
                            <div className="p-4">
                                {popup.title && <h3 className="text-lg font-bold text-white">{popup.title}</h3>}
                                {popup.description && <p className="text-sm text-slate-400 mt-1">{popup.description}</p>}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Carousel */}
            {carousel.length > 0 && (
                <section className="relative rounded-2xl overflow-hidden">
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
                                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                        <h3 className="text-lg md:text-xl font-bold text-white">{item.title}</h3>
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
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">
                        Govershop
                    </h1>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                        Top up games favoritmu dengan harga termurah, proses instan, dan terpercaya 100%.
                    </p>
                </div>

                <SearchInput value={search} onChange={setSearch} />
            </section>

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
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {allFilteredBrands.map((brand, idx) => {
                                const name = getBrandName(brand);
                                const image = getBrandImage(brand);
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
                            <p>Tidak ada hasil untuk &ldquo;{search}&rdquo;</p>
                        </div>
                    )}
                </section>
            ) : (
                // Normal view: show by category
                filteredCategoryData.map((catData) => {
                    const isExpanded = expandedCategories[catData.category] || false;
                    const visibleBrands = isExpanded ? catData.brands : catData.brands.slice(0, MAX_VISIBLE);
                    const hasMore = catData.brands.length > MAX_VISIBLE;

                    return (
                        <section key={catData.category}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold border-l-4 border-primary pl-3">
                                    {catData.category}
                                </h2>
                                {hasMore && (
                                    <span className="text-sm text-muted-foreground">
                                        {catData.brands.length} item
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {visibleBrands.map((brand, idx) => {
                                    const name = getBrandName(brand);
                                    const image = getBrandImage(brand);
                                    return (
                                        <GameCard
                                            key={`${catData.category}-${name}-${idx}`}
                                            name={name}
                                            href={`/order/${encodeURIComponent(name)}`}
                                            image={image || `https://placehold.co/400x500/1e293b/ffffff?text=${encodeURIComponent(name)}`}
                                        />
                                    );
                                })}
                            </div>

                            {hasMore && (
                                <div className="mt-4 text-center">
                                    <button
                                        onClick={() => toggleCategory(catData.category)}
                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                    >
                                        {isExpanded ? (
                                            <>
                                                <ChevronUp className="w-4 h-4" />
                                                Tampilkan Lebih Sedikit
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="w-4 h-4" />
                                                Tampilkan Lebih Banyak ({catData.brands.length - MAX_VISIBLE} lainnya)
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
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
