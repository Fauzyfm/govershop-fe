"use client";

import { useEffect, useState, useMemo } from "react";
import {
    RefreshCw,
    Edit,
    Search,
    Filter,
} from "lucide-react";
import api from "@/lib/api";
import Modal from "@/components/ui/modal";
import Notification from "@/components/ui/notification";

export default function AdminProducts() {
    const [products, setProducts] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [hasSearched, setHasSearched] = useState(false); // New state to track if search has been performed
    const [notification, setNotification] = useState<{ message: string | null; type: "success" | "error" | "info" | null }>({
        message: null,
        type: null
    });

    // Pagination
    const [limit, setLimit] = useState(20);
    const [page, setPage] = useState(1);

    // Filters
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [brandStr, setBrandStr] = useState("all");
    const [typeStr, setTypeStr] = useState("all");
    const [status, setStatus] = useState("all");

    // REMOVED: debouncedSearch (we will use manual trigger or specific filter changes)

    // Dynamic Filter Options (keep existing)
    const [filterOptions, setFilterOptions] = useState({
        categories: [] as string[],
        brands: [] as string[],
        types: [] as string[],
    });

    // Fetch Filter Options (keep existing)
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

    // REMOVED: Debounce search useEffect

    // Data Fetching
    const fetchProducts = async () => {
        setLoading(true);
        setHasSearched(true); // Mark that we have attempted a search
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

    // 1. Auto-Fetch Trigger (Pagination / Filters)
    // We EXCLUDE 'search' here to prevent fetching on every keystroke
    useEffect(() => {
        const isFilterActive = category !== "all" || brandStr !== "all" || typeStr !== "all" || status !== "all";

        // Only fetch if we have explicit filters active OR if we have already established a search context
        // and just changing pages/limits.
        if (hasSearched || isFilterActive) {
            // Exception: If search input is currently empty and filters are all 'all', DO NOT fetch.
            // This is handled by the reset effect below.
            if (!search && !isFilterActive) return;

            fetchProducts();
        }
    }, [page, limit, category, brandStr, typeStr, status]);

    // 2. Auto-Reset Trigger (Criteria Cleared)
    // Runs when search term or filters change to detect "Empty State"
    useEffect(() => {
        const isFilterActive = category !== "all" || brandStr !== "all" || typeStr !== "all" || status !== "all";
        const isSearchActive = search.trim() !== "";

        if (!isFilterActive && !isSearchActive) {
            setProducts([]);
            setTotal(0);
            setHasSearched(false);
        }
    }, [category, brandStr, typeStr, status, search]);

    // Handle Search Submit (Enter key or Button)
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


    // ... (Modal states keep existing)
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
        is_best_seller: false,
    });

    // ... (handleSync, openEditModal, handleSaveProduct keep existing)
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
            display_name: product.display_name || product.product_name,
            discount_price: product.discount_price ? product.discount_price.toString() : "",
            tags: product.tags ? product.tags.join(", ") : "",
            image_url: product.image_url || "",
            description: product.description || "",
            markup_percent: product.markup_percent ? product.markup_percent.toString() : "",
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
                is_best_seller: formData.is_best_seller,
            };

            await api.put(`/admin/products/${editingProduct.buyer_sku_code}`, payload);
            setNotification({ message: "Produk berhasil diupdate!", type: "success" });
            setIsEditModalOpen(false);
            fetchProducts();
        } catch (error: any) {
            console.error("Failed to update product:", error);
            setNotification({ message: error?.response?.data?.message || "Gagal update produk.", type: "error" });
        }
    };

    // Derived Logic for Display
    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-6">
            <Notification
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification({ message: null, type: null })}
            />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Product Management</h1>
                    <div className="text-sm text-slate-500">
                        {hasSearched ? (
                            <>Found <span className="text-white font-bold">{total}</span> Products</>
                        ) : (
                            "Search or filter to view products"
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Name, SKU..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full md:w-48 transition-colors"
                        />
                    </form>

                    {/* Filters */}
                    <select
                        value={category}
                        onChange={(e) => {
                            setCategory(e.target.value);
                            setPage(1);
                        }}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer max-w-[150px]"
                    >
                        <option value="all">Category: All</option>
                        {filterOptions.categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    <select
                        value={brandStr}
                        onChange={(e) => {
                            setBrandStr(e.target.value);
                            setPage(1);
                        }}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer max-w-[150px]"
                    >
                        <option value="all">Brand: All</option>
                        {filterOptions.brands.map((b) => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>

                    <select
                        value={typeStr}
                        onChange={(e) => {
                            setTypeStr(e.target.value);
                            setPage(1);
                        }}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer max-w-[150px]"
                    >
                        <option value="all">Type: All</option>
                        {filterOptions.types.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>

                    <select
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            setPage(1);
                        }}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                        <option value="all">Status: All</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    <button
                        onClick={() => fetchProducts()}
                        disabled={!hasSearched && category === 'all' && typeStr === 'all' && status === 'all' && !search}
                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors disabled:opacity-50"
                        title="Search / Refresh"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </button>

                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => setIsSyncModalOpen(true)}
                        disabled={syncing}
                    >
                        <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
                        {syncing ? "Syncing..." : "Sync Digiflazz"}
                    </button>
                </div>
            </div>

            {/* Product Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-400">
                        <thead className="bg-slate-950 text-slate-200 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4 whitespace-nowrap">SKU</th>
                                <th className="px-6 py-4 min-w-[300px]">Product Name</th>
                                <th className="px-6 py-4 min-w-[200px]">Category / Type</th>
                                <th className="px-6 py-4 whitespace-nowrap">Brand</th>
                                <th className="px-6 py-4 whitespace-nowrap">Seller</th>
                                <th className="px-6 py-4 whitespace-nowrap">Price (Buy)</th>
                                <th className="px-6 py-4 whitespace-nowrap">Markup %</th>
                                <th className="px-6 py-4 whitespace-nowrap">Profit</th>
                                <th className="px-6 py-4 whitespace-nowrap">Price (Sell)</th>
                                <th className="px-6 py-4 whitespace-nowrap">Status</th>
                                <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {!hasSearched && !loading ? (
                                <tr>
                                    <td colSpan={11} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-500 gap-4">
                                            <div className="p-4 bg-slate-800/50 rounded-full">
                                                <Search className="w-8 h-8 opacity-50" />
                                            </div>
                                            <div className="max-w-md">
                                                <p className="text-lg font-medium text-slate-400 mb-1">Cari Produk</p>
                                                <p className="text-sm">
                                                    Silakan gunakan kolom pencarian atau filter di atas untuk menemukan produk yang ingin Anda kelola.
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : loading ? (
                                <tr>
                                    <td colSpan={11} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                                            <span className="text-slate-400">Loading data...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className="px-6 py-8 text-center text-slate-500">
                                        No products found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.buyer_sku_code} className="hover:bg-slate-800/50 transition-colors h-[80px]">
                                        <td className="px-6 py-4 font-mono align-top whitespace-nowrap">{product.buyer_sku_code}</td>
                                        <td className="px-6 py-4 font-medium text-white align-top">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-start gap-2">
                                                    <span className="line-clamp-2 leading-relaxed" title={product.product_name}>{product.product_name}</span>
                                                    {product.is_best_seller && (
                                                        <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-bold border border-yellow-500/20 whitespace-nowrap">
                                                            BEST SELLER
                                                        </span>
                                                    )}
                                                </div>
                                                <span className={`text-[10px] ${!product.display_name ? "text-slate-600 italic" : "text-slate-400"}`}>
                                                    Display: {product.display_name || "Unset"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-white font-medium">{product.category}</span>
                                                <span className="text-[10px] text-slate-500 uppercase">{product.type}</span>

                                                {/* Tags moved here */}
                                                {product.tags && product.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {product.tags.map((tag: string) => (
                                                            <span key={tag} className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] border border-blue-500/20">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top whitespace-nowrap">{product.brand}</td>
                                        <td className="px-6 py-4 align-top whitespace-nowrap">
                                            <span className="text-slate-300">{product.seller_name || "-"}</span>
                                        </td>
                                        <td className="px-6 py-4 align-top whitespace-nowrap">Rp {product.buy_price ? product.buy_price.toLocaleString() : "-"}</td>
                                        <td className="px-6 py-4 text-slate-400 align-top whitespace-nowrap">{product.markup_percent || 0}%</td>
                                        <td className="px-6 py-4 text-emerald-400 font-medium align-top whitespace-nowrap">
                                            Rp {((product.selling_price || 0) - (product.buy_price || 0)).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 align-top whitespace-nowrap">
                                            <div className="flex flex-col">
                                                {product.discount_price && product.discount_price > 0 ? (
                                                    <>
                                                        <span className="text-xs text-slate-500 line-through">Rp {product.selling_price?.toLocaleString()}</span>
                                                        <span className="text-yellow-400 font-medium">Rp {product.discount_price.toLocaleString()}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-emerald-400 font-medium">Rp {product.selling_price?.toLocaleString()}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${product.is_available
                                                ? "bg-emerald-500/10 text-emerald-500"
                                                : "bg-red-500/10 text-red-500"
                                                }`}>
                                                {product.is_available ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right align-top whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(product)}
                                                    className="p-2 hover:bg-slate-800 rounded-lg text-blue-400 transition-colors"
                                                    title="Edit Product"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Server-Side Pagination */}
                <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                        Showing {Math.min((page - 1) * limit + 1, total)} to {Math.min(page * limit, total)} of {total} results
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(prev => Math.max(1, prev - 1))}
                            disabled={page === 1}
                            className="px-3 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 disabled:opacity-50 text-sm"
                        >
                            Previous
                        </button>
                        <span className="px-3 py-1 text-slate-400 text-sm flex items-center">
                            Page {page} of {totalPages || 1}
                        </span>
                        <button
                            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={page >= totalPages}
                            className="px-3 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 disabled:opacity-50 text-sm"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>



            {/* Edit Product Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Produk"
            >
                <form onSubmit={handleSaveProduct} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Display Name</label>
                        <input
                            type="text"
                            value={formData.display_name}
                            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-600 outline-none"
                            placeholder="Nama Produk Custom"
                        />
                        <p className="text-xs text-slate-500 mt-1">Kosongkan untuk menggunakan nama asli dari Digiflazz.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Image URL</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={formData.image_url}
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-600 outline-none font-mono text-xs"
                                placeholder="https://..."
                            />
                            {formData.image_url && (
                                <img src={formData.image_url} className="w-10 h-10 rounded object-cover border border-slate-700" alt="Preview" />
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">
                                Harga Jual Diskon (Rp)
                            </label>
                            <input
                                type="number"
                                value={formData.discount_price}
                                onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-600 outline-none"
                                placeholder={editingProduct ? `Kosongkan untuk pakai harga normal: Rp ${editingProduct.selling_price?.toLocaleString()}` : "0"}
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                {editingProduct && (
                                    <>
                                        Harga normal: <span className="text-emerald-400">Rp {editingProduct.selling_price?.toLocaleString()}</span>
                                        {formData.discount_price && parseFloat(formData.discount_price) > 0 && (
                                            <span className="ml-2">
                                                → Diskon: <span className="text-yellow-400">Rp {parseFloat(formData.discount_price).toLocaleString()}</span>
                                            </span>
                                        )}
                                    </>
                                )}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Markup Percent (%)</label>
                            <input
                                type="number"
                                value={formData.markup_percent}
                                onChange={(e) => setFormData({ ...formData, markup_percent: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-600 outline-none"
                                placeholder="Example: 10"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Tags</label>
                        <input
                            type="text"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-600 outline-none"
                            placeholder="diamond, wdp, promo (pisahkan koma)"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Deskripsi</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-600 outline-none min-h-[80px]"
                            placeholder="Deskripsi singkat produk..."
                        />
                    </div>

                    <div className="flex items-center gap-3 py-2">
                        <input
                            type="checkbox"
                            id="is_best_seller"
                            checked={formData.is_best_seller}
                            onChange={(e) => setFormData({ ...formData, is_best_seller: e.target.checked })}
                            className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-600"
                        />
                        <label htmlFor="is_best_seller" className="text-sm font-medium text-white cursor-pointer select-none">
                            Set sebagai Best Seller
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
                        <button
                            type="button"
                            onClick={() => setIsEditModalOpen(false)}
                            className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
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
                title="Konfirmasi Sync Produk"
            >
                <div className="space-y-4">
                    <p className="text-slate-300">
                        Apakah Anda yakin ingin melakukan sinkronisasi produk dari Digiflazz?
                    </p>
                    <p className="text-sm text-slate-500">
                        Proses ini akan mengambil data produk terbaru dan mungkin membutuhkan waktu beberapa menit.
                    </p>

                    {syncing && (
                        <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                            <span className="text-blue-400">Sedang melakukan sync...</span>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={() => setIsSyncModalOpen(false)}
                            disabled={syncing}
                            className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            disabled={syncing}
                            onClick={handleSync}
                            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {syncing ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Syncing...
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
