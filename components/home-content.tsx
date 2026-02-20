"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import GameCard from "@/components/game-card";
import SearchInput from "@/components/ui/search-input";
import LayeredCarousel from "@/components/ui/layered-carousel";

import { Brand, BrandPublicData, CarouselItem, PopupItem } from "@/types/api";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Types
export interface CategoryWithBrands {
    category: string;
    brands: Brand[];
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
    const [showPopup, setShowPopup] = useState(false);
    const [isPopupClosing, setIsPopupClosing] = useState(false);
    const [activeTab, setActiveTab] = useState<string>("");
    const [seoExpanded, setSeoExpanded] = useState(false);

    const tabsRef = useRef<HTMLDivElement>(null);
    const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
    const tabButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const isScrollingToSection = useRef(false);

    const INITIAL_LIMIT = 5;
    const LOAD_MORE_STEP = 10;

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

    // Build sorted tab list: Populer first, then alphabetical categories
    const tabList: { id: string; label: string }[] = [];
    if (bestSellerItems.length > 0) {
        tabList.push({ id: "section-populer", label: "Populer" });
    }
    // Sort categories: "Games" first (if exists), then alphabetically
    const sortedCategories = [...filteredCategoryData].sort((a, b) => {
        if (a.category.toLowerCase() === "games") return -1;
        if (b.category.toLowerCase() === "games") return 1;
        return a.category.localeCompare(b.category);
    });
    sortedCategories.forEach(cat => {
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

    return (
        <div className="space-y-8 max-w-6xl mx-auto text-left">
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
                        <button
                            onClick={closePopup}
                            className="absolute top-3 right-3 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        {popup.link_url ? (
                            <a href={popup.link_url} onClick={closePopup}>
                                <Image
                                    src={popup.image_url}
                                    alt={popup.title || "Promo Govershop"}
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
                                alt={popup.title || "Promo Govershop"}
                                width={600}
                                height={400}
                                className="w-full h-auto"
                                sizes="(max-width: 448px) 100vw, 448px"
                                unoptimized={!popup.image_url?.startsWith('/')}
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

            {/* Carousel */}
            {carousel.length > 0 && (
                <section className="-mx-4 md:mx-0">
                    <LayeredCarousel items={carousel} />
                </section>
            )}

            {/* Hero / Search Section */}
            <section className="flex flex-col items-center justify-center space-y-6 text-center">
                <div className="space-y-4 flex flex-col items-center">
                    <h1 className="sr-only">Govershop — Top Up Game Termurah dan Terpercaya</h1>
                    {/* <div className="relative w-64 h-24 md:w-80 md:h-32">
                        <Image
                            src="/Banner/logo-govershop.png"
                            alt="Govershop — Platform Top Up Game"
                            fill
                            className="object-contain drop-shadow-[0_0_15px_rgba(230,80,27,0.5)]"
                            priority
                        />
                    </div> */}
                    <p className="text-muted-foreground/80 max-w-lg mx-auto font-medium">
                        Top up games favoritmu dengan harga termurah, proses instan, dan terpercaya 100%.
                    </p>
                </div>

                <SearchInput value={search} onChange={setSearch} />
            </section>

            {/* Sticky Category Tabs (only when not searching) */}
            {!search && tabList.length > 0 && (
                <div
                    ref={tabsRef}
                    className="sticky top-16 z-30 -mx-4 px-4 md:mx-0 md:px-0 py-3 bg-background/80 backdrop-blur-xl border-b border-white/5 rounded-full"
                >
                    <div className="flex gap-2 overflow-x-auto scrollbar-none max-w-6xl mx-4">
                        {tabList.map((tab) => (
                            <button
                                key={tab.id}
                                ref={(el) => { tabButtonRefs.current[tab.id] = el; }}
                                onClick={() => handleTabClick(tab.id)}
                                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 shrink-0 ${activeTab === tab.id
                                    ? "bg-primary text-white shadow-[0_0_15px_rgba(230,80,27,0.4)]"
                                    : "bg-secondary/50 text-muted-foreground hover:bg-white/10 hover:text-white border border-white/5"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Category Content */}
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
                <>
                    {/* Best Seller Section */}
                    {bestSellerItems.length > 0 && (
                        <section
                            id="section-populer"
                            ref={(el) => { sectionRefs.current["section-populer"] = el; }}
                            className="w-full rounded-2xl scroll-mt-32 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-backwards"
                        >
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

                    {/* Category Sections (sorted: Games first, then alphabetical) */}
                    {sortedCategories.map((catData, categoryIdx) => {
                        const limit = categoryLimits[catData.category] || INITIAL_LIMIT;
                        const visibleBrands = catData.brands.slice(0, limit);
                        const hasMore = catData.brands.length > limit;
                        const isExpanded = limit > INITIAL_LIMIT;
                        const sectionId = `section-${catData.category.toLowerCase().replace(/\s+/g, '-')}`;

                        return (
                            <section
                                key={catData.category}
                                id={sectionId}
                                ref={(el) => { sectionRefs.current[sectionId] = el; }}
                                className="w-full scroll-mt-16"
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
                                                <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-emerald-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                    })}
                </>
            )}

            {/* SEO Copywriting Section */}
            {!search && (
                <section className="w-screen relative left-1/2 -translate-x-1/2 mt-16 -mb-8 bg-card/80 border-t border-white/5 pt-10 pb-16 px-4 md:px-10">
                    <div className="max-w-6xl mx-auto space-y-8 text-muted-foreground/70 text-sm leading-relaxed">
                        {/* Always visible: Title + Intro */}
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
                                Govershop — Top Up Game &amp; Voucher Game Termurah dan Terpercaya
                            </h2>
                            <p>
                                Di era gaming yang terus berkembang, kebutuhan akan layanan top up game dan pembelian voucher game menjadi bagian tak terpisahkan dari pengalaman bermain. Govershop hadir sebagai platform terpercaya yang menghadirkan kemudahan, kecepatan, dan keamanan terbaik untuk setiap transaksi digital kamu.
                            </p>
                            <p className="mt-3">
                                Dengan koleksi game populer mulai dari Mobile Legends, PUBG Mobile, Free Fire, Genshin Impact, Valorant, hingga Roblox, Govershop memastikan setiap gamer bisa mendapatkan diamond, UC, gems, maupun voucher premium dengan harga paling kompetitif. Ditambah dukungan beragam metode pembayaran modern seperti e-wallet, transfer bank, hingga pulsa — bertransaksi jadi mudah kapan saja dan di mana saja.
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
                                        <h3 className="text-lg font-semibold text-white/90 mb-3">
                                            Kenapa Harus Govershop?
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="font-semibold text-white/80">Harga Paling Bersahabat</h4>
                                                <p>Govershop berkomitmen menghadirkan harga terbaik untuk setiap layanan top up dan voucher. Setiap transaksi dirancang agar tetap ramah di kantong tanpa mengorbankan kualitas layanan.</p>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-white/80">Transaksi Instan &amp; Otomatis</h4>
                                                <p>Kecepatan adalah segalanya. Di Govershop, setiap top up diproses secara otomatis dalam hitungan detik. Begitu pembayaran berhasil, item langsung masuk ke akun game kamu.</p>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-white/80">100% Aman &amp; Terpercaya</h4>
                                                <p>Keamanan data dan transaksi adalah prioritas utama. Govershop menggunakan sistem terenkripsi yang menjamin setiap informasi pribadi serta pembayaran terlindungi sepenuhnya.</p>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-white/80">Pilihan Game Terlengkap</h4>
                                                <p>Dari game mobile populer hingga PC dan console, Govershop menyediakan ribuan produk digital — diamond, UC, gems, coin, hingga voucher game resmi yang siap digunakan kapan saja.</p>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-white/80">Dukungan Pelanggan 24/7</h4>
                                                <p>Tim customer support Govershop selalu siap membantu kapan pun kamu membutuhkan — mulai dari pertanyaan seputar transaksi hingga kendala teknis.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-white/90 mb-3">
                                            Layanan Unggulan Govershop
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="font-semibold text-white/80">Top Up Game Mobile</h4>
                                                <p>Dapatkan diamond, UC, gold, hingga berbagai mata uang digital lainnya secara instan untuk game favoritmu.</p>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-white/80">Voucher Game &amp; Gift Card</h4>
                                                <p>Tersedia voucher resmi seperti Google Play, App Store, Steam Wallet, Garena Shells, dan masih banyak lagi dengan harga terbaik.</p>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-white/80">Promo &amp; Event Spesial</h4>
                                                <p>Govershop rutin menghadirkan promo eksklusif, diskon besar, hingga cashback menarik untuk setiap transaksi tertentu.</p>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-white/80">Multi Metode Pembayaran</h4>
                                                <p>Mendukung pembayaran via e-wallet (OVO, GoPay, Dana, ShopeePay), transfer bank, hingga pulsa operator besar di Indonesia.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-white/90 mb-3">
                                            Govershop — Partner Gaming Digital Kamu
                                        </h3>
                                        <p>
                                            Bermain game bukan lagi sekadar hiburan, tetapi juga gaya hidup. Untuk mendukung itu, Govershop hadir sebagai partner digital yang selalu siap menyediakan segala kebutuhan gaming kamu. Mulai dari membeli diamond Mobile Legends, mengisi UC PUBG Mobile, membeli voucher Steam Wallet, hingga top up Valorant Points — semua bisa dilakukan hanya dengan beberapa klik.
                                        </p>
                                        <p className="mt-3">
                                            Dengan sistem yang praktis dan pelayanan profesional, Govershop memastikan setiap transaksi berlangsung lancar. Tidak perlu menunggu lama, tidak perlu khawatir soal keamanan — cukup pilih produk, lakukan pembayaran, dan nikmati hasilnya langsung di akun game kamu.
                                        </p>
                                    </div>

                                    <div>
                                        <p>
                                            Jika kamu mencari tempat top up game dan voucher game termurah serta terpercaya, maka <strong className="text-white/80">Govershop</strong> adalah jawabannya. Dengan harga bersahabat, transaksi otomatis super cepat, pilihan game lengkap, serta jaminan keamanan — Govershop menjadi solusi terbaik untuk memenuhi segala kebutuhan gaming digitalmu.
                                        </p>
                                        <p className="mt-3 text-muted-foreground/50 text-xs">
                                            Jadikan pengalaman bermain game lebih seru dan menyenangkan bersama Govershop. Ribuan gamer sudah membuktikan kualitas layanan kami — kini giliran kamu untuk merasakannya.
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Toggle Button */}
                        <button
                            onClick={() => setSeoExpanded(!seoExpanded)}
                            className="mt-6 px-6 py-2.5 rounded-full border border-white/10 text-sm font-semibold text-white/70 hover:text-white hover:border-primary/50 transition-all duration-300"
                        >
                            {seoExpanded ? "Sembunyikan" : "Baca Selengkapnya"}
                        </button>
                    </div>
                </section>
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
