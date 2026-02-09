"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Search, ShoppingCart, Filter } from "lucide-react";
import Link from "next/link";

interface Product {
    buyer_sku_code: string;
    product_name: string;
    display_name: string;
    category: string;
    brand: string;
    type: string;
    price: number;
    is_available: boolean;
    tags?: string[];
}

interface FilterOptions {
    categories: string[];
    brands: string[];
    types: string[];
}

export default function MemberProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Pagination
    const [limit] = useState(20);
    const [page, setPage] = useState(1);

    // Filters
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [brandStr, setBrandStr] = useState("all");
    const [typeStr, setTypeStr] = useState("all");
    const [status, setStatus] = useState("all");

    // Filter Options
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
        categories: [],
        brands: [],
        types: [],
    });

    // Fetch Filter Options
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products/filters`, {
                    credentials: "include",
                });
                const json = await res.json();
                if (json.data) {
                    setFilterOptions({
                        categories: json.data.categories || [],
                        brands: json.data.brands || [],
                        types: json.data.types || [],
                    });
                }
            } catch (error) {
                console.error("Failed to fetch filter options:", error);
            }
        };
        fetchFilters();
    }, []);

    // Fetch Products
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

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/member/products?${params.toString()}`, {
                credentials: "include",
            });
            const json = await res.json();

            if (json.success) {
                const fetchedProducts = json.data?.products || [];
                // Sort by SKU ASC
                fetchedProducts.sort((a: Product, b: Product) =>
                    a.buyer_sku_code.localeCompare(b.buyer_sku_code, undefined, { numeric: true, sensitivity: "base" })
                );
                setProducts(fetchedProducts);
                setTotal(json.data?.total || 0);
            }
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch when filters change (except search - manual trigger)
    useEffect(() => {
        const isFilterActive = category !== "all" || brandStr !== "all" || typeStr !== "all" || status !== "all";
        if (hasSearched || isFilterActive) {
            if (!search && !isFilterActive) return;
            fetchProducts();
        }
    }, [page, category, brandStr, typeStr, status]);

    // Reset when all filters cleared
    useEffect(() => {
        const isFilterActive = category !== "all" || brandStr !== "all" || typeStr !== "all" || status !== "all";
        const isSearchActive = search.trim() !== "";
        if (!isFilterActive && !isSearchActive) {
            setProducts([]);
            setTotal(0);
            setHasSearched(false);
        }
    }, [category, brandStr, typeStr, status, search]);

    // Handle search submit
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

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="w-1.5 h-8 bg-(--primary) rounded-full shadow-[0_0_10px_var(--primary)]" />
                        Order Product
                    </h1>
                    <div className="text-sm text-white/50 ml-4">
                        {hasSearched ? (
                            <>Found <span className="text-(--primary) font-bold">{total}</span> Products</>
                        ) : (
                            "Cari produk untuk melakukan topup"
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                        <input
                            type="text"
                            placeholder="Nama, SKU..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-black/20 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-(--primary)/50 w-full md:w-48 transition-colors"
                        />
                    </form>

                    <select
                        value={category}
                        onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                        className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-(--primary)/50 cursor-pointer max-w-[150px] [&>option]:bg-[#280905]"
                    >
                        <option value="all">Category: All</option>
                        {filterOptions.categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    <select
                        value={brandStr}
                        onChange={(e) => { setBrandStr(e.target.value); setPage(1); }}
                        className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-(--primary)/50 cursor-pointer max-w-[150px] [&>option]:bg-[#280905]"
                    >
                        <option value="all">Brand: All</option>
                        {filterOptions.brands.map((b) => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>

                    <select
                        value={typeStr}
                        onChange={(e) => { setTypeStr(e.target.value); setPage(1); }}
                        className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-(--primary)/50 cursor-pointer max-w-[150px] [&>option]:bg-[#280905]"
                    >
                        <option value="all">Type: All</option>
                        {filterOptions.types.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => fetchProducts()}
                        disabled={!hasSearched && category === "all" && typeStr === "all" && status === "all" && !search}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/50 hover:text-white transition-colors disabled:opacity-50 border border-white/5"
                        title="Search / Refresh"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>

            {/* Product Table */}
            <div className="glass-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-white/70">
                        <thead className="bg-white/5 text-white/90 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4 whitespace-nowrap">SKU</th>
                                <th className="px-6 py-4 min-w-[300px]">Product Name</th>
                                <th className="px-6 py-4 min-w-[200px]">Category / Type</th>
                                <th className="px-6 py-4 whitespace-nowrap">Brand</th>
                                <th className="px-6 py-4 whitespace-nowrap">Harga Member</th>
                                <th className="px-6 py-4 whitespace-nowrap">Status</th>
                                <th className="px-6 py-4 text-right whitespace-nowrap">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {!hasSearched && !loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center text-white/50 gap-4">
                                            <div className="p-4 bg-white/5 rounded-full border border-white/10">
                                                <Search className="w-8 h-8 opacity-50" />
                                            </div>
                                            <div className="max-w-md">
                                                <p className="text-lg font-medium text-white/80 mb-1">Cari Produk</p>
                                                <p className="text-sm">
                                                    Gunakan kolom pencarian atau filter di atas untuk menemukan produk yang ingin Anda topup.
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <RefreshCw className="w-6 h-6 animate-spin text-(--primary)" />
                                            <span className="text-white/50">Loading data...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-white/50">
                                        Tidak ada produk yang sesuai dengan filter.
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.buyer_sku_code} className="hover:bg-white/5 transition-colors h-[70px] group">
                                        <td className="px-6 py-4 font-mono align-top whitespace-nowrap text-white/60">
                                            {product.buyer_sku_code}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-white align-top">
                                            <div className="flex flex-col gap-1">
                                                <span className="line-clamp-2 leading-relaxed group-hover:text-(--primary) transition-colors" title={product.product_name}>
                                                    {product.display_name || product.product_name}
                                                </span>
                                                {product.tags && product.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {product.tags.map((tag) => (
                                                            <span key={tag} className="px-1.5 py-0.5 rounded bg-(--primary)/10 text-(--primary) text-[10px] border border-(--primary)/20">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-white/90 font-medium">{product.category}</span>
                                                <span className="text-[10px] text-white/50 uppercase">{product.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top whitespace-nowrap">{product.brand}</td>
                                        <td className="px-6 py-4 align-top whitespace-nowrap">
                                            <span className="text-(--accent) font-medium">
                                                Rp {(product.price || 0).toLocaleString("id-ID")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 align-top whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-medium border ${product.is_available
                                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                : "bg-red-500/10 text-red-500 border-red-500/20"
                                                }`}>
                                                {product.is_available ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right align-top whitespace-nowrap">
                                            <Link
                                                href={`/member/topup?sku=${product.buyer_sku_code}`}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${product.is_available
                                                    ? "bg-(--primary) hover:bg-(--primary)/80 text-white shadow-lg shadow-(--primary)/20"
                                                    : "bg-white/5 text-white/30 cursor-not-allowed pointer-events-none"
                                                    }`}
                                            >
                                                <ShoppingCart className="w-3 h-3" />
                                                TOPUP
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-white/5 px-6 py-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-sm text-white/50">
                        Showing {Math.min((page - 1) * limit + 1, total)} to {Math.min(page * limit, total)} of {total} results
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                            disabled={page === 1}
                            className="px-3 py-1 bg-white/5 text-white/70 rounded-lg hover:bg-white/10 disabled:opacity-50 text-sm transition-colors"
                        >
                            Previous
                        </button>
                        <span className="px-3 py-1 text-white/70 text-sm flex items-center">
                            Page {page} of {totalPages || 1}
                        </span>
                        <button
                            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                            disabled={page >= totalPages}
                            className="px-3 py-1 bg-white/5 text-white/70 rounded-lg hover:bg-white/10 disabled:opacity-50 text-sm transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
