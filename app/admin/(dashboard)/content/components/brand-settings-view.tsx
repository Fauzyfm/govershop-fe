"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Search, Loader2 } from "lucide-react";
import SimpleRichEditor from "@/components/ui/simple-rich-editor";

// Topup Step interface
interface TopupStep {
    step: number;
    title: string;
    desc: string;
}

interface InputField {
    key: string;
    type: string;       // "text" | "select"
    label: string;
    placeholder: string;
    required: boolean;
    options?: string[];
}

interface BrandSetting {
    brand_name: string;
    slug: string;
    custom_image_url: string;
    is_best_seller: boolean;
    is_visible: boolean;
    status: string;
    topup_steps?: TopupStep[];
    description?: string;
    display_category?: string | null;
    display_sort_order?: number;
    input_fields?: InputField[];
    input_separator?: string;
}

interface DisplayCategory {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
}

export default function BrandSettingsView() {
    const [brands, setBrands] = useState<BrandSetting[]>([]);
    const [displayCategories, setDisplayCategories] = useState<DisplayCategory[]>([]);
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
            // Fetch display categories
            const catRes: any = await api.get("/admin/display-categories");
            setDisplayCategories(catRes.data?.categories || []);

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
                    description: "",
                    display_category: null,
                    display_sort_order: 0,
                    input_fields: [],
                    input_separator: "",
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
                    <p className="text-white/50 text-sm mt-1">Atur status, best seller, dan cara topup</p>
                </div>
                {/* Search */}
                <div className="relative max-w-md w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        placeholder="Cari brand..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full md:w-64 bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm md:text-white focus:outline-none focus:border-primary/50 transition-all placeholder:text-white/20"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBrands.map((brand) => (
                        <div
                            key={brand.brand_name}
                            className={`relative p-5 rounded-xl border transition-all hover:shadow-lg hover:shadow-primary/5 ${brand.status === 'active'
                                ? "bg-black/40 border-white/10 hover:border-white/20"
                                : "bg-red-500/5 border-red-500/20"
                                }`}
                        >
                            <div className="flex justify-between items-start mb-5">
                                <h3 className="font-bold text-base text-white truncate max-w-[80%]" title={brand.brand_name}>{brand.brand_name}</h3>
                                {updating === brand.brand_name && (
                                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                )}
                            </div>

                            <div className="space-y-4">
                                {/* Visibility Toggle */}
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                    <span className="text-xs text-white/50 font-medium">Tampilkan di Beranda</span>
                                    <button
                                        onClick={() => updateBrand(brand, { is_visible: !brand.is_visible })}
                                        className={`w-10 h-5 rounded-full transition-colors relative ${brand.is_visible ? "bg-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.4)]" : "bg-white/10"
                                            }`}
                                    >
                                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform shadow-sm ${brand.is_visible ? "left-6" : "left-1"
                                            }`} />
                                    </button>
                                </div>

                                {/* Best Seller Toggle */}
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                    <span className="text-xs text-white/50 font-medium">Best Seller</span>
                                    <button
                                        onClick={() => updateBrand(brand, { is_best_seller: !brand.is_best_seller })}
                                        className={`w-10 h-5 rounded-full transition-colors relative ${brand.is_best_seller ? "bg-primary shadow-[0_0_10px_var(--primary)]" : "bg-white/10"
                                            }`}
                                    >
                                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform shadow-sm ${brand.is_best_seller ? "left-6" : "left-1"
                                            }`} />
                                    </button>
                                </div>

                                {/* Status Dropdown */}
                                <div className="space-y-2">
                                    <label className="text-[10px] text-white/30 uppercase font-bold tracking-wider">Status</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['active', 'coming_soon', 'maintenance'].map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => updateBrand(brand, { status })}
                                                className={`px-1 py-1.5 text-[10px] rounded-lg border transition-all truncate font-medium ${brand.status === status
                                                    ? (status === 'active' ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]" :
                                                        status === 'coming_soon' ? "bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.1)]" :
                                                            "bg-red-500/10 border-red-500/50 text-red-400 shadow-[0_0_10px_rgba(248,113,113,0.1)]")
                                                    : "bg-white/5 border-transparent text-white/40 hover:bg-white/10"
                                                    }`}
                                                title={status.replace('_', ' ')}
                                            >
                                                {status === 'coming_soon' ? 'Soon' : status.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Display Category Dropdown */}
                                <div className="space-y-2">
                                    <label className="text-[10px] text-white/30 uppercase font-bold tracking-wider">Kategori Tab</label>
                                    <select
                                        value={brand.display_category || ""}
                                        onChange={(e) => updateBrand(brand, {
                                            display_category: e.target.value || null,
                                        })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all"
                                    >
                                        <option value="">— Belum dikategorikan —</option>
                                        {displayCategories.filter(c => c.is_active).map(cat => (
                                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Display Sort Order */}
                                {brand.display_category && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-white/30 uppercase font-bold tracking-wider">Urutan di Kategori</label>
                                        <input
                                            type="number"
                                            value={brand.display_sort_order || 0}
                                            onChange={(e) => updateBrand(brand, {
                                                display_sort_order: parseInt(e.target.value) || 0,
                                            })}
                                            min="0"
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all"
                                        />
                                        <p className="text-[10px] text-white/20">0 = alfabet, angka kecil tampil duluan</p>
                                    </div>
                                )}

                                {/* Edit Content Button */}
                                <button
                                    onClick={() => setEditingContent(brand)}
                                    className="w-full mt-2 py-2.5 text-xs font-medium text-white/70 bg-white/5 hover:bg-white/10 hover:text-white border border-white/5 hover:border-white/10 rounded-xl transition-all"
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

// Separator options for admin to choose
const SEPARATOR_OPTIONS = [
    { value: "", label: "Tidak ada (gabung langsung)" },
    { value: "|", label: "Pipe ( | )" },
    { value: "#", label: "Hash ( # )" },
    { value: "/", label: "Slash ( / )" },
    { value: " ", label: "Spasi" },
];

// Modal Component Logic
function EditContentModal({ brand, onClose, onSave }: { brand: BrandSetting, onClose: () => void, onSave: (data: any) => void }) {
    const [desc, setDesc] = useState(brand.description || "");
    const [steps, setSteps] = useState<TopupStep[]>(brand.topup_steps || []);
    const [inputFields, setInputFields] = useState<InputField[]>(brand.input_fields || []);
    const [inputSeparator, setInputSeparator] = useState(brand.input_separator || "");

    // --- Topup Steps ---
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

    // --- Input Fields ---
    const addInputField = () => {
        setInputFields([...inputFields, {
            key: `field_${Date.now()}`,
            type: "text",
            label: "",
            placeholder: "",
            required: true,
            options: [],
        }]);
    };

    const updateInputField = (index: number, updates: Partial<InputField>) => {
        const newFields = [...inputFields];
        newFields[index] = { ...newFields[index], ...updates };
        setInputFields(newFields);
    };

    const removeInputField = (index: number) => {
        setInputFields(inputFields.filter((_, i) => i !== index));
    };

    const addOption = (fieldIndex: number) => {
        const field = inputFields[fieldIndex];
        const newOptions = [...(field.options || []), ""];
        updateInputField(fieldIndex, { options: newOptions });
    };

    const updateOption = (fieldIndex: number, optionIndex: number, value: string) => {
        const field = inputFields[fieldIndex];
        const newOptions = [...(field.options || [])];
        newOptions[optionIndex] = value;
        updateInputField(fieldIndex, { options: newOptions });
    };

    const removeOption = (fieldIndex: number, optionIndex: number) => {
        const field = inputFields[fieldIndex];
        const newOptions = (field.options || []).filter((_, i) => i !== optionIndex);
        updateInputField(fieldIndex, { options: newOptions });
    };

    const handleSave = () => {
        // Clean up input fields: generate proper keys from labels
        const cleanedFields = inputFields
            .filter(f => f.label.trim() !== "") // Remove empty fields
            .map((f, i) => ({
                ...f,
                key: f.key || `field_${i}`,
                options: f.type === "select" ? (f.options || []).filter(o => o.trim() !== "") : undefined,
            }));

        onSave({
            description: desc,
            topup_steps: steps,
            input_fields: cleanedFields,
            input_separator: inputSeparator,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="glass-card rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-white/10">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h3 className="text-xl font-bold text-white">Edit Content: {brand.brand_name}</h3>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 12" /></svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                    {/* Description Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70">Deskripsi Tambahan</label>
                        <SimpleRichEditor
                            value={desc}
                            onChange={(html) => setDesc(html)}
                            placeholder="Tulis informasi tambahan, promo, atau catatan untuk customer..."
                        />
                    </div>

                    {/* Topup Steps Section */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-white/70">Langkah-langkah Topup</label>
                            <button onClick={addStep} className="text-xs bg-primary hover:bg-primary/80 text-white px-3 py-1.5 rounded-lg transition-colors font-medium shadow-lg shadow-primary/20">
                                + Tambah Langkah
                            </button>
                        </div>

                        {steps.length === 0 ? (
                            <div className="text-sm text-white/30 text-center py-8 bg-black/40 rounded-xl border border-dashed border-white/10">
                                Belum ada langkah topup dikonfigurasi.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {steps.map((step, idx) => (
                                    <div key={idx} className="flex gap-4 bg-black/40 p-4 rounded-xl border border-white/10 group hover:border-white/20 transition-all">
                                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-sm font-bold text-white/50 shrink-0 mt-1">
                                            {step.step}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <input
                                                type="text"
                                                value={step.title}
                                                onChange={(e) => updateStep(idx, 'title', e.target.value)}
                                                placeholder="Judul Langkah (contoh: Masukkan User ID)"
                                                className="w-full bg-transparent border-b border-white/10 focus:border-primary/50 px-0 py-1 text-sm font-medium text-white focus:outline-none placeholder:text-white/20"
                                            />
                                            <input
                                                type="text"
                                                value={step.desc}
                                                onChange={(e) => updateStep(idx, 'desc', e.target.value)}
                                                placeholder="Deskripsi detail..."
                                                className="w-full bg-transparent border-b border-white/10 focus:border-primary/50 px-0 py-1 text-xs text-white/50 focus:outline-none placeholder:text-white/10"
                                            />
                                        </div>
                                        <button
                                            onClick={() => removeStep(idx)}
                                            className="text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all self-start p-1"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c0 1 1 2 2 2v2" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* =============== INPUT FIELDS BUILDER =============== */}
                    <div className="space-y-4 border-t border-white/10 pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <label className="text-sm font-medium text-white/70">Input Fields Tambahan</label>
                                <p className="text-[10px] text-white/30 mt-0.5">Tambahkan field input custom (selain User ID utama) untuk game ini</p>
                            </div>
                            <button onClick={addInputField} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors font-medium shadow-lg shadow-blue-600/20">
                                + Tambah Field
                            </button>
                        </div>

                        {inputFields.length === 0 ? (
                            <div className="text-sm text-white/30 text-center py-6 bg-black/40 rounded-xl border border-dashed border-white/10">
                                Tidak ada field tambahan. Hanya User ID utama yang ditampilkan.
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    {inputFields.map((field, idx) => (
                                        <div key={idx} className="bg-black/40 p-4 rounded-xl border border-blue-500/20 space-y-3 group hover:border-blue-500/40 transition-all">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Field #{idx + 1}</span>
                                                <button
                                                    onClick={() => removeInputField(idx)}
                                                    className="text-white/20 hover:text-red-400 transition-colors p-1"
                                                    title="Hapus field"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c0 1 1 2 2 2v2" /></svg>
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                {/* Label */}
                                                <div className="space-y-1">
                                                    <label className="text-[10px] text-white/30 font-medium">Label</label>
                                                    <input
                                                        type="text"
                                                        value={field.label}
                                                        onChange={(e) => updateInputField(idx, { label: e.target.value })}
                                                        placeholder="contoh: Zone ID, Server"
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
                                                    />
                                                </div>

                                                {/* Placeholder */}
                                                <div className="space-y-1">
                                                    <label className="text-[10px] text-white/30 font-medium">Placeholder</label>
                                                    <input
                                                        type="text"
                                                        value={field.placeholder}
                                                        onChange={(e) => updateInputField(idx, { placeholder: e.target.value })}
                                                        placeholder="contoh: Masukkan Zone ID"
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                {/* Type */}
                                                <div className="space-y-1">
                                                    <label className="text-[10px] text-white/30 font-medium">Tipe Input</label>
                                                    <select
                                                        value={field.type}
                                                        onChange={(e) => updateInputField(idx, { type: e.target.value })}
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
                                                    >
                                                        <option value="text">Text (input bebas)</option>
                                                        <option value="select">Select (pilihan)</option>
                                                    </select>
                                                </div>

                                                {/* Required */}
                                                <div className="space-y-1">
                                                    <label className="text-[10px] text-white/30 font-medium">Wajib Diisi</label>
                                                    <div className="flex items-center gap-2 py-2">
                                                        <button
                                                            onClick={() => updateInputField(idx, { required: !field.required })}
                                                            className={`w-10 h-5 rounded-full transition-colors relative ${
                                                                field.required ? "bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]" : "bg-white/10"
                                                            }`}
                                                        >
                                                            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform shadow-sm ${
                                                                field.required ? "left-6" : "left-1"
                                                            }`} />
                                                        </button>
                                                        <span className="text-xs text-white/50">{field.required ? "Ya" : "Tidak"}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Options (only for select type) */}
                                            {field.type === "select" && (
                                                <div className="space-y-2 border-t border-white/5 pt-3">
                                                    <div className="flex justify-between items-center">
                                                        <label className="text-[10px] text-white/30 font-medium">Opsi Pilihan</label>
                                                        <button
                                                            onClick={() => addOption(idx)}
                                                            className="text-[10px] text-blue-400 hover:text-blue-300 font-medium transition-colors"
                                                        >
                                                            + Tambah Opsi
                                                        </button>
                                                    </div>
                                                    {(!field.options || field.options.length === 0) ? (
                                                        <p className="text-[10px] text-white/20 italic">Belum ada opsi</p>
                                                    ) : (
                                                        <div className="space-y-1.5">
                                                            {field.options.map((opt, optIdx) => (
                                                                <div key={optIdx} className="flex gap-2 items-center">
                                                                    <input
                                                                        type="text"
                                                                        value={opt}
                                                                        onChange={(e) => updateOption(idx, optIdx, e.target.value)}
                                                                        placeholder={`Opsi ${optIdx + 1}`}
                                                                        className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500/50"
                                                                    />
                                                                    <button
                                                                        onClick={() => removeOption(idx, optIdx)}
                                                                        className="text-white/20 hover:text-red-400 transition-colors p-1"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Separator Config */}
                                <div className="space-y-2 bg-black/40 p-4 rounded-xl border border-white/10">
                                    <label className="text-[10px] text-white/30 uppercase font-bold tracking-wider">Separator (Pemisah Antar Field)</label>
                                    <p className="text-[10px] text-white/20">Karakter yang digunakan untuk menggabungkan User ID + field tambahan saat dikirim ke provider</p>
                                    <select
                                        value={inputSeparator}
                                        onChange={(e) => setInputSeparator(e.target.value)}
                                        className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
                                    >
                                        {SEPARATOR_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                    {inputSeparator && (
                                        <p className="text-[10px] text-blue-400">
                                            Preview: UserID<span className="text-white font-bold">{inputSeparator}</span>Field1<span className="text-white font-bold">{inputSeparator}</span>Field2
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-white/5">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium">
                        Batal
                    </button>
                    <button onClick={handleSave} className="px-6 py-2.5 text-sm bg-primary hover:bg-primary/80 text-white rounded-xl font-medium transition-colors shadow-lg shadow-primary/20">
                        Simpan Perubahan
                    </button>
                </div>
            </div>
        </div>
    );
}
