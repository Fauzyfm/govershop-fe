"use client";

import { useEffect, useState } from "react";
import {
    RefreshCw,
    Edit,
    Search,
    Filter,
    FileDown,
    Package,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import api from "@/lib/api";
import Modal from "@/components/ui/modal";
import Notification from "@/components/ui/notification";
import { exportProductsToPDF, exportMemberPricesToPDF } from "@/lib/pdf-export";
import { toSlug } from "@/lib/slug";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from "@/components/ui/table";

export default function AdminProducts() {
    const [products, setProducts] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [notification, setNotification] = useState<{ message: string | null; type: "success" | "error" | "info" | null }>({
        message: null,
        type: null
    });
    const [exporting, setExporting] = useState(false);

    // Pagination - Limit set to 10 as requested
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);

    // Filters
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [brandStr, setBrandStr] = useState("all");
    const [typeStr, setTypeStr] = useState("all");
    const [status, setStatus] = useState("all");

    // Dynamic Filter Options
    const [filterOptions, setFilterOptions] = useState({
        categories: [] as string[],
        brands: [] as string[],
        types: [] as string[],
    });

    // Fetch Filter Options
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const response: any = await api.get("/admin/products/filters");
                setFilterOptions({
                    categories: response.data.categories || [],
                    brands: response.data.brands || [],
                    types: response.data.types || [],
                });
            } catch (error) {
                console.error("Failed to fetch filter options:", error);
            }
        };
        fetchFilters();
    }, []);

    // Data Fetching
    const fetchProducts = async () => {
        setLoading(true);
        setHasSearched(true);
        try {
            const offset = (page - 1) * limit;
            const params = new URLSearchParams();
            params.append("limit", limit.toString());
            params.append("offset", offset.toString());
            if (search) params.append("search", search);
            if (category !== "all") params.append("category", category);
            if (brandStr !== "all") params.append("brand", brandStr);
            if (typeStr !== "all") params.append("type", typeStr);
            if (status !== "all") params.append("status", status);

            const response: any = await api.get(`/admin/products?${params.toString()}`);
            const fetchedProducts = response.data.products || [];

            // Sort Client-Side by SKU ASC
            fetchedProducts.sort((a: any, b: any) => {
                return a.buyer_sku_code.localeCompare(b.buyer_sku_code, undefined, { numeric: true, sensitivity: 'base' });
            });

            setProducts(fetchedProducts);
            setTotal(response.data.total || 0);
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch ALL products for PDF export (no pagination)
    const fetchAllProductsForExport = async (): Promise<any[]> => {
        try {
            const params = new URLSearchParams();
            params.append("limit", "10000"); // Get all products
            params.append("offset", "0");
            if (search) params.append("search", search);
            if (category !== "all") params.append("category", category);
            if (brandStr !== "all") params.append("brand", brandStr);
            if (typeStr !== "all") params.append("type", typeStr);
            if (status !== "all") params.append("status", status);

            const response: any = await api.get(`/admin/products?${params.toString()}`);
            const allProducts = response.data.products || [];

            // Sort by SKU ASC
            allProducts.sort((a: any, b: any) => {
                return a.buyer_sku_code.localeCompare(b.buyer_sku_code, undefined, { numeric: true, sensitivity: 'base' });
            });

            return allProducts;
        } catch (error) {
            console.error("Failed to fetch all products for export:", error);
            return [];
        }
    };

    // Export handlers
    const handleExportCatalog = async () => {
        setExporting(true);
        setNotification({ message: "Mengambil semua data produk...", type: "info" });
        try {
            const allProducts = await fetchAllProductsForExport();
            if (allProducts.length > 0) {
                exportProductsToPDF(allProducts, { storeName: 'RESTOPUP KATALOG' });
                setNotification({ message: `Berhasil export ${allProducts.length} produk ke PDF!`, type: "success" });
            } else {
                setNotification({ message: "Tidak ada produk untuk diexport.", type: "error" });
            }
        } catch (error) {
            setNotification({ message: "Gagal export PDF.", type: "error" });
        } finally {
            setExporting(false);
        }
    };

    const handleExportMemberPrices = async () => {
        setExporting(true);
        setNotification({ message: "Mengambil semua data produk...", type: "info" });
        try {
            const allProducts = await fetchAllProductsForExport();
            if (allProducts.length > 0) {
                exportMemberPricesToPDF(allProducts, { storeName: 'RESTOPUP - HARGA MEMBER' });
                setNotification({ message: `Berhasil export ${allProducts.length} harga member ke PDF!`, type: "success" });
            } else {
                setNotification({ message: "Tidak ada produk untuk diexport.", type: "error" });
            }
        } catch (error) {
            setNotification({ message: "Gagal export PDF.", type: "error" });
        } finally {
            setExporting(false);
        }
    };

    // Auto-Fetch Trigger (Pagination / Filters)
    useEffect(() => {
        const isFilterActive = category !== "all" || brandStr !== "all" || typeStr !== "all" || status !== "all";

        if (hasSearched || isFilterActive) {
            if (!search && !isFilterActive) return;
            fetchProducts();
        }
    }, [page, limit, category, brandStr, typeStr, status]);

    // Auto-Reset Trigger (Criteria Cleared)
    useEffect(() => {
        const isFilterActive = category !== "all" || brandStr !== "all" || typeStr !== "all" || status !== "all";
        const isSearchActive = search.trim() !== "";

        if (!isFilterActive && !isSearchActive) {
            setProducts([]);
            setTotal(0);
            setHasSearched(false);
        }
    }, [category, brandStr, typeStr, status, search]);

    // Handle Search Submit
    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        const isFilterActive = category !== "all" || brandStr !== "all" || typeStr !== "all" || status !== "all";
        const isSearchActive = search.trim() !== "";

        if (!isFilterActive && !isSearchActive) {
            setProducts([]);
            setTotal(0);
            setHasSearched(false);
            return;
        }

        setPage(1);
        fetchProducts();
    };


    // Modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [formData, setFormData] = useState({
        display_name: "",
        discount_price: "",
        tags: "",
        image_url: "",
        description: "",
        markup_percent: "",
        member_markup_percent: "",
        is_best_seller: false,
    });

    const handleSync = async () => {
        setSyncing(true);
        try {
            const response: any = await api.post("/admin/sync/products");
            setNotification({
                message: response.message || "Product sudah diperbarui dengan Digiflazz!",
                type: "success"
            });
            await fetchProducts();
            setIsSyncModalOpen(false);

            // Revalidate all order pages after sync (prices may have changed)
            try {
                await fetch('/api/revalidate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paths: ['/order'] }),
                });
            } catch (revalError) {
                console.warn('[Revalidate] Failed after sync:', revalError);
            }
        } catch (error: any) {
            console.error("Sync failed:", error);
            const errorMessage = error.response?.data?.message || error.message || "Gagal melakukan sinkronisasi dengan Digiflazz.";
            setNotification({
                message: `Gagal Sync: ${errorMessage}`,
                type: "error"
            });
        } finally {
            setSyncing(false);
        }
    };

    const openEditModal = (product: any) => {
        setEditingProduct(product);
        setFormData({
            display_name: product.display_name || "",
            discount_price: product.discount_price ? product.discount_price.toString() : "",
            tags: product.tags ? product.tags.join(", ") : "",
            image_url: product.image_url || "",
            description: product.description || "",
            markup_percent: product.markup_percent ? product.markup_percent.toString() : "",
            member_markup_percent: product.member_markup_percent ? product.member_markup_percent.toString() : "",
            is_best_seller: product.is_best_seller || false,
        });
        setIsEditModalOpen(true);
    };

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;

        try {
            const payload = {
                display_name: formData.display_name || null,
                discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
                tags: formData.tags ? formData.tags.split(",").map(t => t.trim()).filter(t => t) : [],
                image_url: formData.image_url || null,
                description: formData.description || null,
                markup_percent: formData.markup_percent ? parseFloat(formData.markup_percent) : null,
                member_markup_percent: formData.member_markup_percent ? parseFloat(formData.member_markup_percent) : null,
                is_best_seller: formData.is_best_seller,
            };

            await api.put(`/admin/products/${editingProduct.buyer_sku_code}`, payload);
            setNotification({ message: "Produk berhasil diupdate!", type: "success" });
            setIsEditModalOpen(false);
            fetchProducts();

            // Trigger on-demand ISR revalidation for the brand's order page
            try {
                const brandSlug = toSlug(editingProduct.brand);
                await fetch('/api/revalidate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paths: [`/order/${brandSlug}`] }),
                });
            } catch (revalError) {
                console.warn('[Revalidate] Failed to revalidate, page will update on next ISR cycle:', revalError);
            }
        } catch (error: any) {
            console.error("Failed to update product:", error);
            setNotification({ message: error?.response?.data?.message || "Gagal update produk.", type: "error" });
        }
    };

    const totalPages = Math.ceil(total / limit);
    const formatCurrency = (amount: number) => `Rp ${amount.toLocaleString('id-ID')}`;

    return (
        <div className="space-y-6">
            <Notification
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification({ message: null, type: null })}
            />
            {/* ===== Header ===== */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                        <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            Product Management
                        </h1>
                        <p className="text-sm text-white/50">
                            {hasSearched ? (
                                <>Found <span className="text-white font-medium">{total}</span> products</>
                            ) : (
                                "Search or filter to view products"
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {products.length > 0 && (
                        <>
                            <button
                                onClick={handleExportCatalog}
                                disabled={exporting}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 disabled:bg-white/5 disabled:text-white/30 disabled:border-white/10 disabled:cursor-not-allowed rounded-lg text-blue-400 text-sm font-medium transition-all"
                                title="Export katalog produk ke PDF"
                            >
                                <FileDown className={`w-4 h-4 ${exporting ? "animate-pulse" : ""}`} />
                                <span className="hidden sm:inline">Katalog PDF</span>
                            </button>
                            <button
                                onClick={handleExportMemberPrices}
                                disabled={exporting}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 disabled:bg-white/5 disabled:text-white/30 disabled:border-white/10 disabled:cursor-not-allowed rounded-lg text-emerald-400 text-sm font-medium transition-all"
                                title="Export harga member ke PDF"
                            >
                                <FileDown className={`w-4 h-4 ${exporting ? "animate-pulse" : ""}`} />
                                <span className="hidden sm:inline">Member PDF</span>
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => setIsSyncModalOpen(true)}
                        disabled={syncing}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 disabled:bg-white/5 disabled:text-white/30 disabled:border-white/10 disabled:cursor-not-allowed rounded-lg text-amber-400 text-sm font-medium transition-all"
                    >
                        <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
                        <span className="hidden sm:inline">Sync Digiflazz</span>
                    </button>
                    <button
                        onClick={() => fetchProducts()}
                        disabled={!hasSearched && category === 'all' && typeStr === 'all' && status === 'all' && !search}
                        className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-white/70 hover:text-white text-sm font-medium transition-all disabled:opacity-50"
                        title="Search / Refresh"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* ===== Filters & Search ===== */}
            <Card className="border-transparent bg-card/60">
                <CardContent className="pt-5 pb-5">
                    <div className="flex flex-col gap-4">
                        {/* Search Row */}
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                            <Input
                                type="text"
                                placeholder="Cari berdasarkan SKU, Nama Produk, dll..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 bg-black/20 border-white/10 h-10 w-full"
                            />
                        </form>

                        {/* Dropdown Filters */}
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                            <div className="flex items-center gap-1.5 text-xs text-white/40 shrink-0">
                                <Filter className="w-3.5 h-3.5" />
                                <span>Filter:</span>
                            </div>

                            <select
                                value={category}
                                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                                className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 appearance-none cursor-pointer pr-8 hover:bg-white/5 transition-colors [&>option]:bg-[#280905] w-full md:w-auto"
                            >
                                <option value="all">Category: All</option>
                                {filterOptions.categories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>

                            <select
                                value={brandStr}
                                onChange={(e) => { setBrandStr(e.target.value); setPage(1); }}
                                className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 appearance-none cursor-pointer pr-8 hover:bg-white/5 transition-colors [&>option]:bg-[#280905] w-full md:w-auto"
                            >
                                <option value="all">Brand: All</option>
                                {filterOptions.brands.map((b) => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </select>

                            <select
                                value={typeStr}
                                onChange={(e) => { setTypeStr(e.target.value); setPage(1); }}
                                className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 appearance-none cursor-pointer pr-8 hover:bg-white/5 transition-colors [&>option]:bg-[#280905] w-full md:w-auto"
                            >
                                <option value="all">Type: All</option>
                                {filterOptions.types.map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>

                            <Separator orientation="vertical" className="h-6 hidden md:block bg-white/10" />

                            <select
                                value={status}
                                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                                className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 appearance-none cursor-pointer pr-8 hover:bg-white/5 transition-colors [&>option]:bg-[#280905] w-full md:w-auto"
                            >
                                <option value="all">Status: All</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ===== Data Table ===== */}
            <Card className="border-transparent bg-card/60 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/10 bg-white/3 hover:bg-white/3">
                            <TableHead>SKU</TableHead>
                            <TableHead className="min-w-[250px]">Product Name</TableHead>
                            <TableHead className="min-w-[150px]">Category & Tags</TableHead>
                            <TableHead>Brand & Seller</TableHead>
                            <TableHead>Modal</TableHead>
                            <TableHead>Harga Jual</TableHead>
                            <TableHead>Harga Member</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!hasSearched && !loading ? (
                            <TableRow>
                                <TableCell colSpan={9} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center text-white/50 gap-3">
                                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                                            <Search className="w-6 h-6 text-white/30" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white shadow-xs mb-1">Cari Produk</p>
                                            <p className="text-xs max-w-sm mx-auto">Gunakan search atau filter di atas untuk menampilkan produk.</p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : loading ? (
                            [...Array(limit)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                    <TableCell>
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-48" />
                                            <Skeleton className="h-3 w-32" />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-20" />
                                            <Skeleton className="h-3 w-16" />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-3 w-20" />
                                        </div>
                                    </TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell>
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-20" />
                                            <Skeleton className="h-3 w-12" />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-20" />
                                            <Skeleton className="h-3 w-12" />
                                        </div>
                                    </TableCell>
                                    <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-lg" /></TableCell>
                                </TableRow>
                            ))
                        ) : products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center text-white/50 gap-3">
                                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                                            <Package className="w-6 h-6 text-white/30" />
                                        </div>
                                        <p className="text-sm">Tidak ada produk yang cocok dengan pencarian / filter.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => (
                                <TableRow key={product.buyer_sku_code} className="group">
                                    <TableCell className="font-mono text-[11px] align-top">
                                        <code className="bg-white/5 px-1.5 py-0.5 rounded text-white/70 border border-white/5 whitespace-nowrap">
                                            {product.buyer_sku_code}
                                        </code>
                                    </TableCell>
                                    <TableCell className="align-top">
                                        <div className="flex flex-col gap-1.5 cursor-default">
                                            <div className="flex items-start gap-2">
                                                <span className="font-medium text-white group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                                                    {product.product_name}
                                                </span>
                                                {product.is_best_seller && (
                                                    <Badge variant="warning" className="shrink-0 text-[9px] h-4 px-1.5 border-none shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                                                        HOT
                                                    </Badge>
                                                )}
                                            </div>
                                            <span className={`text-[10px] ${!product.display_name ? "text-white/30" : "text-white/50"} flex items-center gap-1`}>
                                                Display: {product.display_name || "Unset"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="align-top">
                                        <div className="flex flex-col gap-1.5 cursor-default">
                                            <div className="flex items-center gap-2">
                                                <span className="text-white/90 font-medium text-xs">{product.category}</span>
                                                <span className="text-[10px] text-white/40 uppercase tracking-wider">{product.type}</span>
                                            </div>
                                            {product.tags && product.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {product.tags.map((tag: string) => (
                                                        <Badge key={tag} variant="default" className="bg-primary/10 text-primary border-primary/20 text-[9px] px-1.5 py-0">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="align-top cursor-default">
                                        <div className="flex flex-col gap-1 text-xs">
                                            <span className="text-white/80 font-medium">{product.brand}</span>
                                            <span className="text-[10px] text-white/40 flex items-center gap-1">
                                                By: {product.seller_name || "-"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-orange-400 font-medium align-top text-xs whitespace-nowrap cursor-default">
                                        {formatCurrency(product.buy_price || 0)}
                                    </TableCell>
                                    <TableCell className="align-top whitespace-nowrap cursor-default">
                                        <div className="flex flex-col gap-1">
                                            {product.discount_price && product.discount_price > 0 ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-white/30 line-through">{formatCurrency(product.selling_price || 0)}</span>
                                                    <span className="text-yellow-400 font-bold text-xs">{formatCurrency(product.discount_price)}</span>
                                                </div>
                                            ) : (
                                                <span className="text-emerald-400 font-bold text-xs">{formatCurrency(product.selling_price || 0)}</span>
                                            )}
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-emerald-400/80 text-[10px] font-medium">+Rp {((product.selling_price || 0) - (product.buy_price || 0)).toLocaleString()}</span>
                                                <span className="text-white/30 text-[9px]">({product.markup_percent || 0}%)</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="align-top whitespace-nowrap cursor-default">
                                        {(() => {
                                            const buyPrice = product.buy_price || 0;
                                            const memberMarkup = product.member_markup_percent || 0.7;
                                            const memberPrice = Math.ceil(buyPrice + (buyPrice * memberMarkup / 100));
                                            const memberProfit = memberPrice - buyPrice;
                                            return (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-cyan-400 font-bold text-xs">{formatCurrency(memberPrice)}</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-emerald-400/80 text-[10px] font-medium">+Rp {memberProfit.toLocaleString()}</span>
                                                        <span className="text-white/30 text-[9px]">({memberMarkup}%)</span>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </TableCell>
                                    <TableCell className="align-top">
                                        <Badge
                                            variant={product.is_available ? "success" : "destructive"}
                                            className="text-[10px] px-2"
                                        >
                                            {product.is_available ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right align-top">
                                        <button
                                            onClick={() => openEditModal(product)}
                                            className="inline-flex p-1.5 hover:bg-primary/20 hover:text-primary rounded-lg text-white/40 transition-colors border border-transparent hover:border-primary/20"
                                            title="Edit Product"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* ===== Pagination Controls ===== */}
                {(products.length > 0 || total > 0) && (
                    <div className="bg-white/3 px-4 py-3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-xs text-white/40 font-medium">
                            Menampilkan <span className="text-white/80">{Math.min((page - 1) * limit + 1, total)}</span> — <span className="text-white/80">{Math.min(page * limit, total)}</span> dari <span className="text-white">{total}</span> produk
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                disabled={page === 1 || loading}
                                className="flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 text-white/70 rounded-lg hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:text-white/70 text-xs font-medium transition-all"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                                Prev
                            </button>
                            <span className="px-2 text-xs text-white/50 font-medium min-w-[60px] text-center">
                                {page} / {totalPages || 1}
                            </span>
                            <button
                                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={page >= totalPages || loading}
                                className="flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 text-white/70 rounded-lg hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:text-white/70 text-xs font-medium transition-all"
                            >
                                Next
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </Card>

            {/* ===== Modals ===== */}

            {/* Edit Product Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={
                    <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                            <Edit className="w-4 h-4 text-primary" />
                        </div>
                        <span>Edit Produk</span>
                    </div>
                }
            >
                <form onSubmit={handleSaveProduct} className="space-y-4 pt-2">
                    {/* Info Card */}
                    {editingProduct && (
                        <div className="bg-black/20 rounded-xl p-3 border border-white/5 space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-white/40">Product Name</span>
                                <span className="text-white font-medium max-w-[200px] truncate">{editingProduct.product_name}</span>
                            </div>
                            <Separator className="bg-white/5" />
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-white/40">SKU Code</span>
                                <code className="text-primary font-mono">{editingProduct.buyer_sku_code}</code>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-medium text-white/70 mb-1.5">Display Name</label>
                        <Input
                            type="text"
                            value={formData.display_name}
                            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                            className="bg-black/20 border-white/10 font-medium text-white"
                            placeholder={editingProduct ? editingProduct.product_name : "Nama Custom..."}
                        />
                        <p className="text-[10px] text-white/40 mt-1.5 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-primary" />
                            Kosongkan untuk menggunakan nama asli dari Digiflazz.
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-white/70 mb-1.5">Image URL</label>
                        <Input
                            type="text"
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            className="bg-black/20 border-white/10 font-medium text-white"
                            placeholder="https://example.com/image.png"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-white/70 mb-1.5">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 min-h-[80px]"
                            placeholder="Deskripsi produk..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-white/70 mb-1.5">Harga Jual Diskon</label>
                            <Input
                                type="number"
                                value={formData.discount_price}
                                onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                                className="bg-black/20 border-white/10 text-yellow-400 font-bold"
                                placeholder={editingProduct ? `Normal: Rp ${editingProduct.selling_price?.toLocaleString()}` : "0"}
                            />
                            {editingProduct && formData.discount_price && parseFloat(formData.discount_price) > 0 && (
                                <p className="text-[10px] text-yellow-400/80 mt-1.5">
                                    Diskon aktif. Normal: Rp {editingProduct.selling_price?.toLocaleString()}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-white/70 mb-1.5">Tags <span className="text-white/30 font-normal">(Koma untuk pisah)</span></label>
                            <Input
                                type="text"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                className="bg-black/20 border-white/10 font-mono text-xs"
                                placeholder="promo, hot..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-white/70 mb-1.5">Markup Umum (%)</label>
                            <Input
                                type="number"
                                value={formData.markup_percent}
                                onChange={(e) => setFormData({ ...formData, markup_percent: e.target.value })}
                                className="bg-black/20 border-white/10"
                                placeholder="Def: 3"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-white/70 mb-1.5">Markup Member (%)</label>
                            <Input
                                type="number"
                                value={formData.member_markup_percent}
                                onChange={(e) => setFormData({ ...formData, member_markup_percent: e.target.value })}
                                className="bg-black/20 border-white/10"
                                placeholder="Def: 0.7"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={() => setFormData({ ...formData, is_best_seller: !formData.is_best_seller })}>
                        <input
                            type="checkbox"
                            checked={formData.is_best_seller}
                            readOnly
                            className="w-4 h-4 rounded border-white/20 bg-black/40 text-primary pointer-events-none"
                        />
                        <div className="flex-1">
                            <label className="text-sm font-medium text-white cursor-pointer select-none">Tandai sebagai Best Seller</label>
                            <p className="text-[10px] text-white/40">Produk akan mendapatkan badge "HOT"</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-2">
                        <button
                            type="button"
                            onClick={() => setIsEditModalOpen(false)}
                            className="px-4 py-2.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors text-sm font-medium border border-white/10"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/80 text-white transition-colors shadow-lg shadow-primary/20 text-sm font-medium"
                        >
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Sync Confirmation Modal */}
            <Modal
                isOpen={isSyncModalOpen}
                onClose={() => !syncing && setIsSyncModalOpen(false)}
                title={
                    <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <RefreshCw className="w-4 h-4 text-amber-500" />
                        </div>
                        <span>Sync Digiflazz</span>
                    </div>
                }
            >
                <div className="space-y-4 pt-2">
                    <p className="text-sm text-white/80 leading-relaxed">
                        Apakah Anda yakin ingin melakukan sinkronisasi produk dari Digiflazz? Proses ini akan mengambil data produk terbaru dan mungkin membutuhkan waktu beberapa menit.
                    </p>

                    {syncing && (
                        <div className="flex items-center justify-center p-6 bg-amber-500/10 border border-amber-500/20 rounded-xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-linear-to-r from-transparent via-amber-500/10 to-transparent w-[200%] animate-shimmer" />
                            <div className="flex flex-col items-center gap-3 relative z-10">
                                <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                                <span className="text-amber-500 font-medium text-sm">Menyinkronkan Data...</span>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-white/10 mt-2">
                        <button
                            type="button"
                            onClick={() => setIsSyncModalOpen(false)}
                            disabled={syncing}
                            className="px-4 py-2.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50 text-sm font-medium border border-white/10"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            disabled={syncing}
                            onClick={handleSync}
                            className="px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-900/20 text-sm font-medium"
                        >
                            {syncing ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Tunggu...
                                </>
                            ) : (
                                "Ya, Sync Sekarang"
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
