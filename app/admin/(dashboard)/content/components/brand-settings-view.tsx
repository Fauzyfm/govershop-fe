"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Search, Loader2 } from "lucide-react";

// Topup Step interface
interface TopupStep {
    step: number;
    title: string;
    desc: string;
}

interface BrandSetting {
    brand_name: string;
    slug: string;
    custom_image_url: string;
    is_best_seller: boolean;
    is_visible: boolean;
    status: string; // 'active', 'coming_soon', 'maintenance'
    topup_steps?: TopupStep[];
    description?: string;
}

export default function BrandSettingsView() {
    const [brands, setBrands] = useState<BrandSetting[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState<BrandSetting | null>(null);

    // Fetch brands
    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        try {
            // First fetch products to get all available brands
            const productRes: any = await api.get("/products/brands");
            // Backend returns []{name: string, image_url: string}
            const availableBrands: { name: string }[] = productRes.data.brands;

            // Then fetch existing settings
            const settingsRes: any = await api.get("/admin/brands");
            const settings: BrandSetting[] = settingsRes.data.brands;

            // Merge logic
            const settingsMap = new Map(settings.map(s => [s.brand_name, s]));

            const mergedBrands: BrandSetting[] = availableBrands.map(brand => {
                const brandName = brand.name;
                if (settingsMap.has(brandName)) {
                    return settingsMap.get(brandName)!;
                }
                // Default setting
                return {
                    brand_name: brandName,
                    slug: brandName.toLowerCase().replace(/\s+/g, "-"),
                    custom_image_url: "",
                    is_best_seller: false,
                    is_visible: true,
                    status: "active",
                    topup_steps: [],
                    description: ""
                };
            });

            setBrands(mergedBrands);
        } catch (error) {
            console.error("Failed to fetch brands", error);
        } finally {
            setLoading(false);
        }
    };

    const updateBrand = async (brand: BrandSetting, updates: Partial<BrandSetting>) => {
        setUpdating(brand.brand_name);
        try {
            const updatedBrand = { ...brand, ...updates };
            await api.put(`/admin/brands/${encodeURIComponent(brand.brand_name)}`, updatedBrand);

            setBrands(prev => prev.map(b =>
                b.brand_name === brand.brand_name ? updatedBrand : b
            ));

            // Close modal if editing
            if (editingContent?.brand_name === brand.brand_name) {
                setEditingContent(null);
            }
        } catch (error) {
            alert("Gagal update brand");
        } finally {
            setUpdating(null);
        }
    };

    const filteredBrands = brands.filter(b =>
        b.brand_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white">Kelola Brand</h2>
                    <p className="text-slate-400 text-sm mt-1">Atur status, best seller, dan cara topup</p>
                </div>
                {/* Search */}
                <div className="relative max-w-md w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Cari brand..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full md:w-64 bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-muted-foreground/50"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredBrands.map((brand) => (
                        <div
                            key={brand.brand_name}
                            className={`relative p-5 rounded-xl border transition-all ${brand.status === 'active'
                                ? "bg-slate-950 border-slate-800 hover:border-slate-700"
                                : "bg-red-500/5 border-red-500/20"
                                }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-base text-white truncate max-w-[80%]" title={brand.brand_name}>{brand.brand_name}</h3>
                                {updating === brand.brand_name && (
                                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                )}
                            </div>

                            <div className="space-y-4">
                                {/* Visibility Toggle */}
                                <div className="flex items-center justify-between p-2 bg-slate-900 rounded-lg">
                                    <span className="text-xs text-slate-400 font-medium">Tampilkan di Beranda</span>
                                    <button
                                        onClick={() => updateBrand(brand, { is_visible: !brand.is_visible })}
                                        className={`w-10 h-5 rounded-full transition-colors relative ${brand.is_visible ? "bg-emerald-600" : "bg-slate-700"
                                            }`}
                                    >
                                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform ${brand.is_visible ? "left-6" : "left-1"
                                            }`} />
                                    </button>
                                </div>

                                {/* Best Seller Toggle */}
                                <div className="flex items-center justify-between p-2 bg-slate-900 rounded-lg">
                                    <span className="text-xs text-slate-400 font-medium">Best Seller</span>
                                    <button
                                        onClick={() => updateBrand(brand, { is_best_seller: !brand.is_best_seller })}
                                        className={`w-10 h-5 rounded-full transition-colors relative ${brand.is_best_seller ? "bg-blue-600" : "bg-slate-700"
                                            }`}
                                    >
                                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform ${brand.is_best_seller ? "left-6" : "left-1"
                                            }`} />
                                    </button>
                                </div>

                                {/* Status Dropdown */}
                                <div className="space-y-2">
                                    <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Status</label>
                                    <div className="grid grid-cols-3 gap-1">
                                        {['active', 'coming_soon', 'maintenance'].map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => updateBrand(brand, { status })}
                                                className={`px-1 py-1.5 text-[10px] rounded border transition-all truncate ${brand.status === status
                                                    ? (status === 'active' ? "bg-emerald-500/20 border-emerald-500 text-emerald-500" :
                                                        status === 'coming_soon' ? "bg-amber-500/20 border-amber-500 text-amber-500" :
                                                            "bg-red-500/20 border-red-500 text-red-500")
                                                    : "bg-slate-900 border-transparent text-slate-500 hover:bg-slate-800"
                                                    }`}
                                                title={status.replace('_', ' ')}
                                            >
                                                {status === 'coming_soon' ? 'Soon' : status.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Edit Content Button */}
                                <button
                                    onClick={() => setEditingContent(brand)}
                                    className="w-full mt-2 py-2 text-xs font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg transition-colors"
                                >
                                    Edit Cara Topup & Info
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Edit Content will be here */}
            {editingContent && (
                <EditContentModal
                    brand={editingContent}
                    onClose={() => setEditingContent(null)}
                    onSave={(updates: any) => updateBrand(editingContent, updates)}
                />
            )}
        </div>
    );
}

// Modal Component Logic
function EditContentModal({ brand, onClose, onSave }: { brand: BrandSetting, onClose: () => void, onSave: (data: any) => void }) {
    const [desc, setDesc] = useState(brand.description || "");
    const [steps, setSteps] = useState<TopupStep[]>(brand.topup_steps || []);

    const addStep = () => {
        setSteps([...steps, { step: steps.length + 1, title: "", desc: "" }]);
    };

    const updateStep = (index: number, field: keyof TopupStep, value: string) => {
        const newSteps = [...steps];
        // @ts-ignore
        newSteps[index][field] = value;
        setSteps(newSteps);
    };

    const removeStep = (index: number) => {
        const newSteps = steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, step: i + 1 }));
        setSteps(newSteps);
    };

    const handleSave = () => {
        onSave({ description: desc, topup_steps: steps });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-xl font-bold">Edit Content: {brand.brand_name}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 12" /></svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                    {/* Description Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Deskripsi Tambahan</label>
                        <textarea
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            className="w-full h-24 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500"
                            placeholder="Tulis informasi tambahan, promo, atau catatan untuk customer..."
                        />
                    </div>

                    {/* Topup Steps Section */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-slate-300">Langkah-langkah Topup</label>
                            <button onClick={addStep} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors">
                                + Tambah Langkah
                            </button>
                        </div>

                        {steps.length === 0 ? (
                            <div className="text-sm text-slate-500 text-center py-8 bg-slate-950 rounded-lg border border-dashed border-slate-800">
                                Belum ada langkah topup dikonfigurasi.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {steps.map((step, idx) => (
                                    <div key={idx} className="flex gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800 group">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-400 flex-shrink-0">
                                            {step.step}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <input
                                                type="text"
                                                value={step.title}
                                                onChange={(e) => updateStep(idx, 'title', e.target.value)}
                                                placeholder="Judul Langkah (contoh: Masukkan User ID)"
                                                className="w-full bg-transparent border-b border-slate-800 focus:border-blue-500 px-0 py-1 text-sm font-medium focus:outline-none"
                                            />
                                            <input
                                                type="text"
                                                value={step.desc}
                                                onChange={(e) => updateStep(idx, 'desc', e.target.value)}
                                                placeholder="Deskripsi detail..."
                                                className="w-full bg-transparent border-b border-slate-800 focus:border-blue-500 px-0 py-1 text-xs text-slate-400 focus:outline-none"
                                            />
                                        </div>
                                        <button
                                            onClick={() => removeStep(idx)}
                                            className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity self-start p-1"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c0 1 1 2 2 2v2" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
                        Batal
                    </button>
                    <button onClick={handleSave} className="px-6 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors">
                        Simpan Perubahan
                    </button>
                </div>
            </div>
        </div>
    );
}
