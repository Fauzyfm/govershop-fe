"use client";

import { useEffect, useState } from "react";
import {
    Plus,
    Edit,
    Trash2,
    Image as ImageIcon,
    Layers,
    Bell,
    RefreshCw,
    Save,
    X,
    ExternalLink,
    Info,
    Check
} from "lucide-react";
import api from "@/lib/api";
import Modal from "@/components/ui/modal";
import BrandSettingsView from "./components/brand-settings-view";

type ContentType = "carousel" | "brand_image" | "popup" | "brand_settings";

interface ContentItem {
    id: number;
    content_type: ContentType;
    brand_name?: string;
    image_url: string;
    title?: string;
    description?: string;
    link_url?: string;
    sort_order: number;
    is_active: boolean;
    start_date?: string;
    end_date?: string;
    created_at: string;
    updated_at: string;
}

const initialFormData = {
    content_type: "carousel" as ContentType,
    brand_name: "",
    image_url: "",
    title: "",
    description: "",
    link_url: "",
    sort_order: 0,
    is_active: true,
    start_date: "",
    end_date: "",
};

export default function ContentManagement() {
    const [items, setItems] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<ContentType>("carousel");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
    const [formData, setFormData] = useState(initialFormData);
    const [saving, setSaving] = useState(false);

    // Fetch content
    const fetchContent = async () => {
        if (activeTab === "brand_settings") return;

        setLoading(true);
        try {
            const response: any = await api.get(`/admin/content?type=${activeTab}`);
            setItems(response.data?.items || []);
        } catch (error) {
            console.error("Failed to fetch content:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContent();
    }, [activeTab]);

    // Open modal for create
    const openCreateModal = () => {
        setEditingItem(null);
        setFormData({
            ...initialFormData,
            content_type: activeTab,
        });
        setIsModalOpen(true);
    };

    // Open modal for edit
    const openEditModal = (item: ContentItem) => {
        setEditingItem(item);
        setFormData({
            content_type: item.content_type,
            brand_name: item.brand_name || "",
            image_url: item.image_url,
            title: item.title || "",
            description: item.description || "",
            link_url: item.link_url || "",
            sort_order: item.sort_order,
            is_active: item.is_active,
            start_date: item.start_date ? item.start_date.split("T")[0] : "",
            end_date: item.end_date ? item.end_date.split("T")[0] : "",
        });
        setIsModalOpen(true);
    };

    // Save content
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                ...formData,
                brand_name: formData.brand_name || null,
                title: formData.title || null,
                description: formData.description || null,
                link_url: formData.link_url || null,
                start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
                end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
            };

            if (editingItem) {
                await api.put(`/admin/content/${editingItem.id}`, payload);
            } else {
                await api.post("/admin/content", payload);
            }

            setIsModalOpen(false);
            fetchContent();
        } catch (error) {
            console.error("Failed to save content:", error);
        } finally {
            setSaving(false);
        }
    };

    // Delete content
    const handleDelete = async (id: number) => {
        if (!confirm("Apakah Anda yakin ingin menghapus content ini?")) return;

        try {
            await api.delete(`/admin/content/${id}`);
            fetchContent();
        } catch (error) {
            console.error("Failed to delete content:", error);
        }
    };

    const tabs = [
        {
            key: "carousel" as ContentType,
            label: "Carousel",
            icon: Layers,
            maxItems: 5,
            imageSize: "1200 x 400 px (rasio 3:1)",
            description: "Banner slider di bagian atas beranda"
        },
        {
            key: "brand_image" as ContentType,
            label: "Game Card Images",
            icon: ImageIcon,
            maxItems: null,
            imageSize: "400 x 500 px (rasio 4:5)",
            description: "Gambar card game di halaman beranda"
        },
        {
            key: "popup" as ContentType,
            label: "Popup",
            icon: Bell,
            maxItems: 1,
            imageSize: "600 x 800 px (rasio 3:4) atau square",
            description: "Popup promo saat user masuk beranda"
        },
        {
            key: "brand_settings" as ContentType,
            label: "Kelola Brand",
            icon: RefreshCw,
            maxItems: null,
            imageSize: "",
            description: "Atur status dan best seller brand"
        },
    ];

    const currentTab = tabs.find(t => t.key === activeTab);
    const canAdd = activeTab !== "brand_settings" && (currentTab?.maxItems ? items.filter(i => i.content_type === activeTab).length < currentTab.maxItems : true);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_10px_var(--primary)]" />
                        Kelola Content
                    </h1>
                    <p className="text-white/50 text-sm mt-1 ml-4">Kelola carousel, gambar game card, popup, dan status brand</p>
                </div>
                <div className="flex items-center gap-3">
                    {activeTab !== "brand_settings" && (
                        <button
                            onClick={fetchContent}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/70 transition-colors border border-white/5"
                            title="Refresh"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        </button>
                    )}
                    {canAdd && (
                        <button
                            onClick={openCreateModal}
                            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-xl transition-colors font-medium text-sm shadow-lg shadow-primary/20"
                        >
                            <Plus className="w-4 h-4" />
                            Tambah {currentTab?.label}
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/10 pb-2 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-t-xl transition-all text-sm font-medium whitespace-nowrap border-b-2 ${activeTab === tab.key
                            ? "bg-white/5 text-white border-primary"
                            : "text-white/40 hover:text-white hover:bg-white/5 border-transparent"
                            }`}
                    >
                        <tab.icon className={`w-4 h-4 ${activeTab === tab.key ? "text-primary" : ""}`} />
                        {tab.label}
                        {tab.maxItems && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${activeTab === tab.key ? "bg-primary/20 text-primary" : "bg-white/10 text-white/50"}`}>
                                max {tab.maxItems}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            {activeTab === "brand_settings" ? (
                <BrandSettingsView />
            ) : (
                <>
                    {/* Image Size Info */}
                    {currentTab && currentTab.imageSize && (
                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <ImageIcon className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm text-blue-400 font-medium">{currentTab.description}</p>
                                    <p className="text-sm text-white/40 mt-1">
                                        <span className="text-white/70 font-medium">Ukuran Rekomendasi:</span> {currentTab.imageSize}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="glass-card rounded-2xl overflow-hidden min-h-[300px]">
                        {loading ? (
                            <div className="p-12 text-center text-white/40 flex flex-col items-center justify-center h-full">
                                <RefreshCw className="w-8 h-8 animate-spin mb-4 text-primary" />
                                Loading content...
                            </div>
                        ) : items.length === 0 ? (
                            <div className="p-12 text-center text-white/30 flex flex-col items-center justify-center h-full">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                    <ImageIcon className="w-8 h-8 opacity-50" />
                                </div>
                                <p>Belum ada {currentTab?.label} content</p>
                                {canAdd && (
                                    <button
                                        onClick={openCreateModal}
                                        className="mt-6 px-5 py-2.5 bg-primary hover:bg-primary/80 text-white rounded-xl transition-colors text-sm font-medium shadow-lg shadow-primary/20"
                                    >
                                        <Plus className="w-4 h-4 inline mr-2" />
                                        Tambah Sekarang
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                                {items.map(item => (
                                    <div
                                        key={item.id}
                                        className={`group relative bg-black/40 rounded-xl overflow-hidden border transition-all hover:border-white/20 hover:shadow-lg hover:shadow-primary/5 ${item.is_active ? "border-white/10" : "border-red-500/30"
                                            }`}
                                    >
                                        {/* Image Preview */}
                                        <div className="aspect-video bg-white/5 relative group-hover:bg-white/10 transition-colors">
                                            <img
                                                src={item.image_url}
                                                alt={item.title || "Content"}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "https://placehold.co/400x225/1e293b/64748b?text=No+Image";
                                                }}
                                            />
                                            {/* Status Badge */}
                                            <div className="absolute top-2 left-2 flex gap-2">
                                                {!item.is_active && (
                                                    <div className="px-2 py-1 bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold rounded uppercase tracking-wider shadow-sm">
                                                        Inactive
                                                    </div>
                                                )}
                                                {item.sort_order > 0 && (
                                                    <div className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-mono rounded border border-white/10">
                                                        #{item.sort_order}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Hover Actions Overlay */}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                                <button
                                                    onClick={() => openEditModal(item)}
                                                    className="p-2 bg-white text-black rounded-full hover:bg-primary hover:text-white transition-colors transform hover:scale-110"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors transform hover:scale-110"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="p-4 space-y-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="space-y-1">
                                                    {item.brand_name && (
                                                        <span className="text-[10px] font-bold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 inline-block mb-1">
                                                            {item.brand_name}
                                                        </span>
                                                    )}
                                                    {item.title ? (
                                                        <h3 className="text-sm font-semibold text-white/90 truncate pr-2">{item.title}</h3>
                                                    ) : (
                                                        <h3 className="text-sm text-white/30 italic">No Title</h3>
                                                    )}
                                                </div>
                                            </div>

                                            {item.link_url && (
                                                <a
                                                    href={item.link_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1.5 w-fit"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                    <span className="truncate max-w-[200px]">{item.link_url}</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Create/Edit Modal */}
            {activeTab !== "brand_settings" && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={editingItem ? "Edit Content" : `Tambah ${currentTab?.label}`}
                >
                    <form onSubmit={handleSave} className="space-y-5">
                        {/* Brand Name (for brand_image only) */}
                        {activeTab === "brand_image" && (
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-1.5">
                                    Nama Brand/Game <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.brand_name}
                                    onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 text-sm outline-none transition-all placeholder:text-white/20"
                                    placeholder="MOBILE LEGENDS, FREE FIRE, dll"
                                    required
                                />
                                <p className="text-xs text-white/40 mt-1.5 flex items-center gap-1">
                                    <Info className="w-3 h-3" /> Harus sama persis dengan nama brand di database
                                </p>
                            </div>
                        )}

                        {/* Image URL with Preview */}
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-1.5">
                                Image URL <span className="text-red-400">*</span>
                            </label>
                            <div className="space-y-3">
                                <input
                                    type="url"
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 text-sm outline-none transition-all placeholder:text-white/20"
                                    placeholder="https://example.com/image.jpg"
                                    required
                                />
                                {formData.image_url && (
                                    <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/40 aspect-video flex items-center justify-center">
                                        <img
                                            src={formData.image_url}
                                            alt="Preview"
                                            className="w-full h-full object-contain"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = "none";
                                            }}
                                        />
                                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded text-[10px] text-white/70 backdrop-blur-md">
                                            Preview
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Title & Link Group */}
                        {(activeTab === "carousel" || activeTab === "popup") && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-1.5">Title</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 text-sm outline-none transition-all placeholder:text-white/20"
                                        placeholder="Judul (opsional)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-1.5">Link URL</label>
                                    <input
                                        type="url"
                                        value={formData.link_url}
                                        onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 text-sm outline-none transition-all placeholder:text-white/20"
                                        placeholder="https://example.com"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Description (popup only) */}
                        {activeTab === "popup" && (
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-1.5">Deskripsi</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 text-sm outline-none transition-all placeholder:text-white/20 min-h-[80px]"
                                    placeholder="Deskripsi popup (opsional)"
                                />
                            </div>
                        )}

                        {/* Sort Order (carousel only) */}
                        {activeTab === "carousel" && (
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-1.5">Urutan Display</label>
                                <input
                                    type="number"
                                    value={formData.sort_order}
                                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 text-sm outline-none transition-all placeholder:text-white/20"
                                    min="0"
                                />
                                <p className="text-xs text-white/30 mt-1">Angka lebih kecil tampil lebih dulu</p>
                            </div>
                        )}

                        {/* Date Range (popup only) */}
                        {activeTab === "popup" && (
                            <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-1.5">Tanggal Mulai</label>
                                    <input
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-primary/50 text-sm outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-1.5">Tanggal Berakhir</label>
                                    <input
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-primary/50 text-sm outline-none transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Active Toggle */}
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-white/20 bg-black/40 checked:border-primary checked:bg-primary transition-all"
                                />
                                <Check className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                            </div>
                            <label htmlFor="is_active" className="text-sm font-medium text-white cursor-pointer select-none">
                                Status Aktif
                            </label>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl text-white/70 hover:bg-white/10 transition-colors text-sm font-medium"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/80 text-white transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-medium shadow-lg shadow-primary/20"
                            >
                                {saving ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Simpan Content
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}
