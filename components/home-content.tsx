"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import GameCard from "@/components/game-card";
import SearchInput from "@/components/ui/search-input";
import LayeredCarousel from "@/components/ui/layered-carousel";
import { toSlug } from "@/lib/slug";

import { Brand, BrandPublicData, CarouselItem, PopupItem } from "@/types/api";
import { ChevronDown, ChevronUp, X, Flame, Zap, Shield, Gamepad2, Headset, Search, Sparkles, Star, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

// Types
const faqs = [
    {
        question: "Apa itu Restopup?",
        answer: "Restopup adalah platform top up game dan voucher digital terpercaya di Indonesia yang menawarkan harga termurah dan proses otomatis 24 jam nonstop.",
        icon: Gamepad2,
    },
    {
        question: "Bagaimana cara melakukan transaksi?",
        answer: "Cara transaksi sangat mudah: 1. Pilih game atau layanan yang diinginkan. 2. Pilih nominal produk. 3. Masukkan ID/Username game Anda. 4. Pilih metode pembayaran. 5. Lakukan pembayaran dan pesanan Anda akan diproses otomatis.",
        icon: Zap,
    },
    {
        question: "Metode pembayaran apa saja yang tersedia?",
        answer: "Kami menerima berbagai metode pembayaran seperti E-Wallet (OVO, DANA, GoPay, ShopeePay, LinkAja), Transfer Bank (BCA, Mandiri, BNI, BRI), QRIS, serta pembayaran melalui Alfamart dan Indomaret.",
        icon: Shield,
    },
    {
        question: "Berapa lama proses transaksi selesai?",
        answer: "Secara umum, proses transaksi memakan waktu 1-5 detik setelah pembayaran kami terima. Untuk keadaan tertentu seperti gangguan server game, diproses maksimal 1x24 jam.",
        icon: Flame,
    },
    {
        question: "Apakah aman bertransaksi di Restopup?",
        answer: "Sangat aman. Kami menggunakan sistem otomatis dan keamanan enkripsi transaksi dengan jaminan legal 100%. Kami tidak pernah meminta password akun game Anda (kecuali layanan joki).",
        icon: Shield,
    }
];

export interface CategoryWithBrands {
    category: string;
    brands: Brand[];
}

interface HomeContentProps {
    categoryData: CategoryWithBrands[];
    carousel?: CarouselItem[];
    brandImages?: Record<string, BrandPublicData>;
    popup?: PopupItem | null;
    firstCarouselImageUrl?: string | null;
}

export default function HomeContent({ categoryData, carousel = [], brandImages = {}, popup, firstCarouselImageUrl }: HomeContentProps) {
    const [carouselReady, setCarouselReady] = useState(false);
    const [search, setSearch] = useState("");
    const [categoryLimits, setCategoryLimits] = useState<Record<string, number>>({});
    const [showPopup, setShowPopup] = useState(false);
    const [isPopupClosing, setIsPopupClosing] = useState(false);
    const [activeTab, setActiveTab] = useState<string>("");
    const [seoExpanded, setSeoExpanded] = useState(false);

    const tabsRef = useRef<HTMLDivElement>(null);
    const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
    const tabButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const isScrollingToSection = useRef(false);

    const [initialLimit, setInitialLimit] = useState(10); // Default for SSR
    const [loadMoreStep, setLoadMoreStep] = useState(10);

    // Dynamic grid limits
    useEffect(() => {
        const updateLimits = () => {
            if (window.innerWidth >= 1024) {
                setInitialLimit(10);
                setLoadMoreStep(10);
            } else if (window.innerWidth >= 768) {
                setInitialLimit(8);
                setLoadMoreStep(8);
            } else {
                setInitialLimit(6);
                setLoadMoreStep(6);
            }
        };

        updateLimits();
        window.addEventListener('resize', updateLimits);
        return () => window.removeEventListener('resize', updateLimits);
    }, []);

    // Check if popup should be shown (once per session)
    useEffect(() => {
        if (popup) {
            const popupShown = sessionStorage.getItem(`popup_shown_${popup.id}`);
            if (!popupShown) {
                setShowPopup(true);
            }
        }
    }, [popup]);

    const closePopup = () => {
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

    const isBrandVisible = (brand: Brand | string) => {
        const meta = getBrandMeta(brand);
        return meta?.is_visible !== false;
    };

    const loadMore = (category: string) => {
        setCategoryLimits(prev => ({
            ...prev,
            [category]: (prev[category] || initialLimit) + loadMoreStep
        }));
    };

    const showLess = (category: string) => {
        setCategoryLimits(prev => ({
            ...prev,
            [category]: initialLimit
        }));
    };

    // Filter brands across all categories based on search AND visibility
    const filteredCategoryData = categoryData.map(catData => ({
        ...catData,
        brands: catData.brands.filter((brand) => {
            const name = getBrandName(brand);
            if (!isBrandVisible(brand)) return false;
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

    const bestSellerItems = bestSellerBrands.map(name => {
        return categoryData.flatMap(c => c.brands).find(b => getBrandName(b) === name)!;
    });

    // Build sorted tab list: Populer first, then categories in admin-defined order
    const tabList: { id: string; label: string }[] = [];
    if (bestSellerItems.length > 0) {
        tabList.push({ id: "section-populer", label: "🔥 Populer" });
    }
    // Categories are already in admin-defined order from backend
    filteredCategoryData.forEach(cat => {
        tabList.push({ id: `section-${cat.category.toLowerCase().replace(/\s+/g, '-')}`, label: cat.category });
    });

    // Set initial active tab
    useEffect(() => {
        if (tabList.length > 0 && !activeTab) {
            setActiveTab(tabList[0].id);
        }
    }, [tabList.length]); // eslint-disable-line react-hooks/exhaustive-deps

    // Scroll-spy: observe sections to highlight active tab
    useEffect(() => {
        if (search) return; // Don't scroll-spy when searching

        const observer = new IntersectionObserver(
            (entries) => {
                if (isScrollingToSection.current) return;
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveTab(entry.target.id);
                    }
                });
            },
            {
                rootMargin: "-80px 0px -60% 0px",
                threshold: 0.1,
            }
        );

        // Observe all section elements
        const currentRefs = sectionRefs.current;
        Object.values(currentRefs).forEach((el) => {
            if (el) observer.observe(el);
        });

        return () => {
            Object.values(currentRefs).forEach((el) => {
                if (el) observer.unobserve(el);
            });
        };
    }, [search, filteredCategoryData.length, bestSellerItems.length]);

    // Auto-scroll the tab bar to keep active tab visible
    useEffect(() => {
        const btn = tabButtonRefs.current[activeTab];
        if (btn) {
            btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        }
    }, [activeTab]);

    // Handle tab click: smooth scroll to section
    const handleTabClick = useCallback((sectionId: string) => {
        setActiveTab(sectionId);
        const el = document.getElementById(sectionId);
        if (el) {
            isScrollingToSection.current = true;
            const offset = 128; // Navbar (64px) + sticky tabs bar (~64px)
            const top = el.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: "smooth" });
            // Re-enable scroll spy after scroll settles
            setTimeout(() => {
                isScrollingToSection.current = false;
            }, 800);
        }
    }, []);

    // Hide server-rendered placeholder once client carousel is ready
    useEffect(() => {
        if (firstCarouselImageUrl) {
            // Small delay to ensure carousel has rendered before hiding placeholder
            const timer = setTimeout(() => {
                const section = document.getElementById('server-carousel-section');
                if (section) {
                    section.style.transition = 'opacity 0.3s ease-out';
                    section.style.opacity = '0';
                    setTimeout(() => {
                        section.style.display = 'none';
                    }, 300);
                }
                setCarouselReady(true);
            }, 100);
            return () => clearTimeout(timer);
        } else {
            setCarouselReady(true);
        }
    }, [firstCarouselImageUrl]);

    // ── Render Brands Grid (shared by Best Sellers + Category sections) ──
    const renderBrandsGrid = (
        brands: Brand[],
        categoryKey: string,
        limit: number,
        hasMore: boolean,
        isExpanded: boolean
    ) => {
        const visibleBrands = brands.slice(0, limit);
        return (
            <>
                <motion.div layout className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
                    <AnimatePresence mode="popLayout">
                        {visibleBrands.map((brand, idx) => {
                            const name = getBrandName(brand);
                            const image = getBrandImage(brand);
                            const status = getBrandStatus(brand);
                            return (
                                <motion.div
                                    layout
                                    key={`${categoryKey}-${name}`}
                                    initial={{ opacity: 0, scale: 0.85, y: 15 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.85 }}
                                    transition={{ duration: 0.35, delay: (idx % 10) * 0.04 }}
                                >
                                    <GameCard
                                        name={name}
                                        href={`/order/${toSlug(name)}`}
                                        image={image || `https://placehold.co/400x500/1e293b/ffffff?text=${encodeURIComponent(name)}`}
                                        status={status}
                                    />
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>

                {/* Load More / Show Less */}
                <div className="mt-8 flex justify-center gap-4">
                    <AnimatePresence>
                        {hasMore && (
                            <motion.button
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => loadMore(categoryKey)}
                                className="group relative flex items-center gap-2 px-6 py-2.5 rounded-full bg-linear-to-r from-primary/20 to-accent/20 border border-primary/30 text-sm font-semibold text-white/90 hover:text-white hover:border-primary/60 hover:shadow-[0_0_25px_rgba(195,17,12,0.3)] transition-all duration-300"
                            >
                                <span>Lihat Lebih</span>
                                <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                            </motion.button>
                        )}

                        {isExpanded && (
                            <motion.button
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => showLess(categoryKey)}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-secondary/30 border border-white/10 text-sm font-semibold text-muted-foreground hover:text-white hover:border-white/20 transition-all duration-300"
                            >
                                <span>Lebih Sedikit</span>
                                <ChevronUp className="w-4 h-4" />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </>
        );
    };

    // ── Section Header Component ──
    const SectionHeader = ({ title, count, icon: Icon }: { title: string; count?: number; icon?: React.ElementType }) => (
        <div className="flex items-center justify-between mb-6 px-1">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="w-1 h-8 bg-linear-to-b from-primary via-accent to-primary/30 rounded-full" />
                    <div className="absolute inset-0 w-1 h-8 bg-linear-to-b from-primary to-accent rounded-full blur-sm opacity-60" />
                </div>
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-5 h-5 text-primary" />}
                    <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                        {title}
                    </h2>
                </div>
            </div>
            {count !== undefined && (
                <Badge variant="secondary" className="bg-secondary/60 text-muted-foreground border border-white/5 backdrop-blur-sm text-xs px-3 py-1">
                    {count} Produk
                </Badge>
            )}
        </div>
    );

    return (
        <>
            {/* Popup */}
            {showPopup && popup && (
                <div
                    className={`fixed inset-0 h-dvh w-screen z-50 flex items-center justify-center p-4 transition-all duration-300 ${isPopupClosing ? "bg-black/0" : "bg-black/70"
                        }`}
                    onClick={closePopup}
                >
                    <div
                        className={`relative max-w-md w-full rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(195,17,12,0.25)] border border-primary/30 bg-card transition-all duration-300 ${isPopupClosing
                            ? "opacity-0 scale-95 translate-y-4"
                            : "opacity-100 scale-100 translate-y-0 animate-in fade-in zoom-in-95"
                            }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={closePopup}
                            className="absolute top-3 right-3 z-10 p-2 bg-black/60 hover:bg-black/80 rounded-full text-white transition-all duration-200 hover:scale-110"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        {popup.link_url ? (
                            <a href={popup.link_url} onClick={closePopup}>
                                <Image
                                    src={popup.image_url}
                                    alt={popup.title || "Promo Restopup"}
                                    width={600}
                                    height={400}
                                    className="w-full h-auto"
                                    sizes="(max-width: 448px) 100vw, 448px"
                                    unoptimized={!popup.image_url?.startsWith('/')}
                                />
                            </a>
                        ) : (
                            <Image
                                src={popup.image_url}
                                alt={popup.title || "Promo Restopup"}
                                width={600}
                                height={400}
                                className="w-full h-auto"
                                sizes="(max-width: 448px) 100vw, 448px"
                                unoptimized={!popup.image_url?.startsWith('/')}
                            />
                        )}
                        {(popup.title || popup.description) && (
                            <div className="p-5 bg-linear-to-b from-card to-background">
                                {popup.title && <h3 className="text-lg font-bold text-foreground">{popup.title}</h3>}
                                {popup.description && <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{popup.description}</p>}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Carousel — hidden until ready if server already rendered first image */}
            {carousel.length > 0 && (
                <section
                    className="-mx-4 md:mx-0"
                    style={{
                        opacity: firstCarouselImageUrl && !carouselReady ? 0 : 1,
                        transition: 'opacity 0.3s ease-in',
                    }}
                >
                    <LayeredCarousel items={carousel} />
                </section>
            )}

            {/* ═══════════════ Hero / Search Section ═══════════════ */}
            <section className="relative flex flex-col items-center justify-center space-y-5 text-center py-2">
                {/* Decorative glow orbs */}
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[400px] max-w-full h-[200px] bg-primary/8 rounded-full blur-[100px] pointer-events-none" />

                <div className="space-y-3 flex flex-col items-center relative z-10">
                    <h1 className="sr-only">Restopup — Top Up Game Termurah dan Terpercaya</h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-muted-foreground/80 max-w-lg mx-auto font-medium text-sm md:text-base"
                    >
                        Top up games favoritmu dengan harga termurah, proses instan, dan terpercaya 100%.
                    </motion.p>
                </div>

                {/* Premium Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.5 }}
                    className="relative w-full max-w-md z-10"
                >
                    <div className="absolute -inset-px bg-linear-to-r from-primary/40 via-accent/30 to-primary/40 rounded-full opacity-0 focus-within:opacity-100 transition-opacity duration-500 blur-sm pointer-events-none" style={{ zIndex: -1 }} />
                    <SearchInput value={search} onChange={setSearch} />
                </motion.div>

                {/* Quick Stats */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="flex items-center gap-4 md:gap-6 text-xs text-muted-foreground/60 pt-1"
                >
                    <span className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-accent/70" />
                        Proses Instan
                    </span>
                    <span className="w-1 h-1 rounded-full bg-white/10" />
                    <span className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-accent/70" />
                        100% Aman
                    </span>
                    <span className="w-1 h-1 rounded-full bg-white/10" />
                    <span className="flex items-center gap-1.5">
                        <Headset className="w-3.5 h-3.5 text-accent/70" />
                        24/7 Support
                    </span>
                </motion.div>
            </section>

            {/* ═══════════════ Sticky Category Tabs ═══════════════ */}
            {!search && tabList.length > 0 && (
                <div
                    ref={tabsRef}
                    className="sticky top-16 z-30 -mx-4 px-4 md:mx-0 md:px-0 py-3"
                >
                    {/* Glass background */}
                    <div className="absolute inset-0 bg-background/70 backdrop-blur-xl border-b border-white/5" />

                    <div className="relative flex gap-2 overflow-x-auto scrollbar-none max-w-6xl mx-4">
                        {tabList.map((tab) => (
                            <button
                                key={tab.id}
                                ref={(el) => { tabButtonRefs.current[tab.id] = el; }}
                                onClick={() => handleTabClick(tab.id)}
                                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 shrink-0 ${activeTab === tab.id
                                    ? "bg-linear-to-r from-primary to-primary/80 text-white shadow-[0_0_20px_rgba(195,17,12,0.35)] border border-primary/50"
                                    : "bg-white/4 text-muted-foreground hover:bg-white/8 hover:text-white/90 border border-white/6"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ═══════════════ Category Content ═══════════════ */}
            {search ? (
                // ── Search Results ──
                <section>
                    <SectionHeader title={`Hasil Pencarian (${allFilteredBrands.length})`} icon={Search} />

                    {allFilteredBrands.length > 0 ? (
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
                                            href={`/order/${toSlug(name)}`}
                                            image={image || `https://placehold.co/400x500/1e293b/ffffff?text=${encodeURIComponent(name)}`}
                                            status={status}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-20 text-center border border-dashed border-border/50 rounded-2xl bg-card/20">
                            <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-muted-foreground">Tidak ada hasil untuk &ldquo;{search}&rdquo;</p>
                            <p className="text-muted-foreground/50 text-sm mt-1">Coba kata kunci lain</p>
                        </div>
                    )}
                </section>
            ) : (
                <>
                    {/* ── Best Seller Section ── */}
                    {bestSellerItems.length > 0 && (() => {
                        const limit = categoryLimits["populer"] || initialLimit;
                        const hasMore = bestSellerItems.length > limit;
                        const isExpanded = limit > initialLimit;

                        return (
                            <section
                                id="section-populer"
                                ref={(el) => { sectionRefs.current["section-populer"] = el; }}
                                className="w-full scroll-mt-32"
                            >
                                <SectionHeader title="Paling Laris" icon={Star} />
                                {renderBrandsGrid(bestSellerItems, "populer", limit, hasMore, isExpanded)}
                            </section>
                        );
                    })()}

                    {/* ── Category Sections (in admin-defined order) ── */}
                    {filteredCategoryData.map((catData, categoryIdx) => {
                        const limit = categoryLimits[catData.category] || initialLimit;
                        const hasMore = catData.brands.length > limit;
                        const isExpanded = limit > initialLimit;
                        const sectionId = `section-${catData.category.toLowerCase().replace(/\s+/g, '-')}`;

                        return (
                            <section
                                key={catData.category}
                                id={sectionId}
                                ref={(el) => { sectionRefs.current[sectionId] = el; }}
                                className="w-full scroll-mt-16"
                            >
                                <SectionHeader title={catData.category} count={catData.brands.length} />

                                {renderBrandsGrid(catData.brands, catData.category, limit, hasMore, isExpanded)}
                            </section>
                        );
                    })}
                </>
            )}

            {/* ═══════════════ FAQ & SEO Section ═══════════════ */}
            {!search && (
                <section className="w-screen relative left-1/2 -translate-x-1/2 mt-16 -mb-8 overflow-hidden">
                    {/* Gradient border top */}
                    <div className="h-px w-full bg-linear-to-r from-transparent via-primary/30 to-transparent" />

                    <div className="bg-linear-to-b from-card/80 via-card/60 to-background pt-12 pb-16 px-4 md:px-10 relative">
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-64 max-w-full h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2" />
                        <div className="absolute bottom-0 left-0 w-48 max-w-full h-48 bg-accent/5 rounded-full blur-[80px] pointer-events-none translate-y-1/2" />

                        <div className="relative z-10 max-w-3xl mx-auto">
                            {/* FAQ Header */}
                            <div className="text-center mb-10">
                                <div>
                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 mb-4">
                                        <Sparkles className="w-3 h-3 mr-1" />
                                        FAQ
                                    </Badge>
                                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">
                                        Pertanyaan Umum
                                    </h2>
                                    <p className="text-muted-foreground text-sm max-w-md mx-auto">
                                        Temukan jawaban untuk pertanyaan yang paling sering ditanyakan seputar Restopup.
                                    </p>
                                </div>
                            </div>

                            {/* Shadcn Accordion */}
                            <Accordion type="single" collapsible className="space-y-2">
                                {faqs.map((faq, index) => {
                                    const FaqIcon = faq.icon;
                                    return (
                                        <AccordionItem
                                            key={index}
                                            value={`faq-${index}`}
                                            className="border border-white/6 rounded-xl bg-white/2 backdrop-blur-sm px-5 data-[state=open]:border-primary/30 data-[state=open]:bg-primary/3 data-[state=open]:shadow-[0_0_20px_rgba(195,17,12,0.08)] transition-all duration-300 hover:border-white/12"
                                        >
                                            <AccordionTrigger className="hover:no-underline py-4 text-sm md:text-base font-medium text-white/90 data-[state=open]:text-primary [&>svg]:text-primary/60 [&>svg]:data-[state=open]:text-primary">
                                                <span className="flex items-center gap-3">
                                                    <FaqIcon className="w-4 h-4 text-accent/70 shrink-0" />
                                                    {faq.question}
                                                </span>
                                            </AccordionTrigger>
                                            <AccordionContent className="text-muted-foreground/80 leading-relaxed text-sm pb-5">
                                                {faq.answer}
                                            </AccordionContent>
                                        </AccordionItem>
                                    );
                                })}
                            </Accordion>

                            <div className="mt-8 text-center">
                                <a
                                    href="/faq"
                                    className="group inline-flex items-center gap-2 text-sm font-medium text-primary/80 hover:text-primary transition-colors"
                                >
                                    Lihat Semua FAQ
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </a>
                            </div>
                        </div>

                        {/* SEO Copywriting Content */}
                        <div className="relative z-10 max-w-5xl mx-auto space-y-8 text-muted-foreground/60 text-sm leading-relaxed mt-16">
                            {/* Gradient divider */}
                            <div className="h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent" />

                            {/* Always visible: Title + Intro */}
                            <div className="pt-4">
                                <h2 className="text-xl md:text-2xl font-bold text-white/90 mb-4">
                                    Restopup — Top Up Game &amp; Voucher Game Termurah dan Terpercaya
                                </h2>
                                <p>
                                    Di era gaming yang terus berkembang, kebutuhan akan layanan top up game dan pembelian voucher game menjadi bagian tak terpisahkan dari pengalaman bermain. Restopup hadir sebagai platform terpercaya yang menghadirkan kemudahan, kecepatan, dan keamanan terbaik untuk setiap transaksi digital kamu.
                                </p>
                                <p className="mt-3">
                                    Dengan koleksi game populer mulai dari Mobile Legends, PUBG Mobile, Free Fire, Genshin Impact, Valorant, hingga Roblox, Restopup memastikan setiap gamer bisa mendapatkan diamond, UC, gems, maupun voucher premium dengan harga paling kompetitif. Ditambah dukungan beragam metode pembayaran modern seperti e-wallet, transfer bank, hingga pulsa — bertransaksi jadi mudah kapan saja dan di mana saja.
                                </p>
                            </div>

                            {/* Expandable content */}
                            <AnimatePresence>
                                {seoExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.4, ease: "easeInOut" }}
                                        className="overflow-hidden space-y-8"
                                    >
                                        <div>
                                            <h3 className="text-lg font-semibold text-white/80 mb-3">
                                                Kenapa Harus Restopup?
                                            </h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="font-semibold text-white/70">Harga Paling Bersahabat</h4>
                                                    <p>Restopup berkomitmen menghadirkan harga terbaik untuk setiap layanan top up dan voucher. Setiap transaksi dirancang agar tetap ramah di kantong tanpa mengorbankan kualitas layanan.</p>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-white/70">Transaksi Instan &amp; Otomatis</h4>
                                                    <p>Kecepatan adalah segalanya. Di Restopup, setiap top up diproses secara otomatis dalam hitungan detik. Begitu pembayaran berhasil, item langsung masuk ke akun game kamu.</p>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-white/70">100% Aman &amp; Terpercaya</h4>
                                                    <p>Keamanan data dan transaksi adalah prioritas utama. Restopup menggunakan sistem terenkripsi yang menjamin setiap informasi pribadi serta pembayaran terlindungi sepenuhnya.</p>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-white/70">Pilihan Game Terlengkap</h4>
                                                    <p>Dari game mobile populer hingga PC dan console, Restopup menyediakan ribuan produk digital — diamond, UC, gems, coin, hingga voucher game resmi yang siap digunakan kapan saja.</p>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-white/70">Dukungan Pelanggan 24/7</h4>
                                                    <p>Tim customer support Restopup selalu siap membantu kapan pun kamu membutuhkan — mulai dari pertanyaan seputar transaksi hingga kendala teknis.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-white/80 mb-3">
                                                Layanan Unggulan Restopup
                                            </h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="font-semibold text-white/70">Top Up Game Mobile</h4>
                                                    <p>Dapatkan diamond, UC, gold, hingga berbagai mata uang digital lainnya secara instan untuk game favoritmu.</p>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-white/70">Voucher Game &amp; Gift Card</h4>
                                                    <p>Tersedia voucher resmi seperti Google Play, App Store, Steam Wallet, Garena Shells, dan masih banyak lagi dengan harga terbaik.</p>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-white/70">Promo &amp; Event Spesial</h4>
                                                    <p>Restopup rutin menghadirkan promo eksklusif, diskon besar, hingga cashback menarik untuk setiap transaksi tertentu.</p>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-white/70">Multi Metode Pembayaran</h4>
                                                    <p>Mendukung pembayaran via e-wallet (OVO, GoPay, Dana, ShopeePay), transfer bank, hingga pulsa operator besar di Indonesia.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-white/80 mb-3">
                                                Restopup — Partner Gaming Digital Kamu
                                            </h3>
                                            <p>
                                                Bermain game bukan lagi sekadar hiburan, tetapi juga gaya hidup. Untuk mendukung itu, Restopup hadir sebagai partner digital yang selalu siap menyediakan segala kebutuhan gaming kamu. Mulai dari membeli diamond Mobile Legends, mengisi UC PUBG Mobile, membeli voucher Steam Wallet, hingga top up Valorant Points — semua bisa dilakukan hanya dengan beberapa klik.
                                            </p>
                                            <p className="mt-3">
                                                Dengan sistem yang praktis dan pelayanan profesional, Restopup memastikan setiap transaksi berlangsung lancar. Tidak perlu menunggu lama, tidak perlu khawatir soal keamanan — cukup pilih produk, lakukan pembayaran, dan nikmati hasilnya langsung di akun game kamu.
                                            </p>
                                        </div>

                                        <div>
                                            <p>
                                                Jika kamu mencari tempat top up game dan voucher game termurah serta terpercaya, maka <strong className="text-white/70">Restopup</strong> adalah jawabannya. Dengan harga bersahabat, transaksi otomatis super cepat, pilihan game lengkap, serta jaminan keamanan — Restopup menjadi solusi terbaik untuk memenuhi segala kebutuhan gaming digitalmu.
                                            </p>
                                            <p className="mt-3 text-muted-foreground/40 text-xs">
                                                Jadikan pengalaman bermain game lebih seru dan menyenangkan bersama Restopup. Ribuan gamer sudah membuktikan kualitas layanan kami — kini giliran kamu untuk merasakannya.
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Toggle Button */}
                            <button
                                onClick={() => setSeoExpanded(!seoExpanded)}
                                className="mt-6 px-6 py-2.5 rounded-full border border-white/10 text-sm font-semibold text-white/60 hover:text-white hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
                            >
                                {seoExpanded ? "Sembunyikan" : "Baca Selengkapnya"}
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* Empty State */}
            {!search && filteredCategoryData.length === 0 && (
                <div className="py-20 text-center border border-dashed border-border/50 rounded-2xl bg-card/20">
                    <Gamepad2 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">Belum ada produk tersedia.</p>
                </div>
            )}
        </>
    );
}
