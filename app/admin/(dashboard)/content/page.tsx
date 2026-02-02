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
    ExternalLink
} from "lucide-react";
import api from "@/lib/api";
import Modal from "@/components/ui/modal";

type ContentType = "carousel" | "brand_image" | "popup";

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
    ];

    const currentTab = tabs.find(t => t.key === activeTab);
    const canAdd = currentTab?.maxItems ? items.filter(i => i.content_type === activeTab).length < currentTab.maxItems : true;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Kelola Content</h1>
                    <p className="text-slate-400 text-sm mt-1">Kelola carousel, gambar game card, dan popup beranda</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchContent}
                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </button>
                    {canAdd && (
                        <button
                            onClick={openCreateModal}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Tambah {currentTab?.label}
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-800 pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors text-sm font-medium ${activeTab === tab.key
                            ? "bg-slate-800 text-white border-b-2 border-blue-500"
                            : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {tab.maxItems && (
                            <span className="text-xs bg-slate-700 px-1.5 py-0.5 rounded">
                                max {tab.maxItems}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Image Size Info */}
            {currentTab && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <ImageIcon className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm text-blue-400 font-medium">{currentTab.description}</p>
                            <p className="text-sm text-slate-400 mt-1">
                                <span className="text-white font-medium">Ukuran Rekomendasi:</span> {currentTab.imageSize}
                            </p>
                        </div>
                    </div>
                </div>
            )}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                        Loading...
                    </div>
                ) : items.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                        <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Belum ada {currentTab?.label} content</p>
                        {canAdd && (
                            <button
                                onClick={openCreateModal}
                                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm"
                            >
                                <Plus className="w-4 h-4 inline mr-1" />
                                Tambah Sekarang
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                        {items.map(item => (
                            <div
                                key={item.id}
                                className={`relative bg-slate-950 rounded-lg overflow-hidden border ${item.is_active ? "border-slate-700" : "border-red-500/30"
                                    }`}
                            >
                                {/* Image Preview */}
                                <div className="aspect-video bg-slate-800 relative">
                                    <img
                                        src={item.image_url}
                                        alt={item.title || "Content"}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "https://placehold.co/400x225/1e293b/64748b?text=No+Image";
                                        }}
                                    />
                                    {!item.is_active && (
                                        <div className="absolute top-2 left-2 px-2 py-1 bg-red-500/80 text-white text-xs rounded">
                                            Inactive
                                        </div>
                                    )}
                                    {item.sort_order > 0 && (
                                        <div className="absolute top-2 right-2 px-2 py-1 bg-slate-900/80 text-white text-xs rounded">
                                            #{item.sort_order}
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-3 space-y-2">
                                    {item.brand_name && (
                                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                                            {item.brand_name}
                                        </span>
                                    )}
                                    {item.title && (
                                        <h3 className="text-sm font-medium text-white truncate">{item.title}</h3>
                                    )}
                                    {item.link_url && (
                                        <a
                                            href={item.link_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                            Link
                                        </a>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                                        <button
                                            onClick={() => openEditModal(item)}
                                            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-sm transition-colors"
                                        >
                                            <Edit className="w-3 h-3" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="flex items-center justify-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded text-sm transition-colors"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? "Edit Content" : `Tambah ${currentTab?.label}`}
            >
                <form onSubmit={handleSave} className="space-y-4">
                    {/* Brand Name (for brand_image only) */}
                    {activeTab === "brand_image" && (
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">
                                Nama Brand/Game <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.brand_name}
                                onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-600 outline-none"
                                placeholder="MOBILE LEGENDS, FREE FIRE, dll"
                                required
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Harus sama persis dengan nama brand di database
                            </p>
                        </div>
                    )}

                    {/* Image URL */}
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">
                            Image URL <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="url"
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-600 outline-none"
                            placeholder="https://example.com/image.jpg"
                            required
                        />
                        {formData.image_url && (
                            <div className="mt-2 p-2 bg-slate-950 rounded-lg border border-slate-800">
                                <img
                                    src={formData.image_url}
                                    alt="Preview"
                                    className="max-h-32 mx-auto rounded"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = "none";
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    {(activeTab === "carousel" || activeTab === "popup") && (
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-600 outline-none"
                                placeholder="Judul (opsional)"
                            />
                        </div>
                    )}

                    {/* Description (popup only) */}
                    {activeTab === "popup" && (
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Deskripsi</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-600 outline-none min-h-[80px]"
                                placeholder="Deskripsi popup (opsional)"
                            />
                        </div>
                    )}

                    {/* Link URL */}
                    {(activeTab === "carousel" || activeTab === "popup") && (
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Link URL</label>
                            <input
                                type="url"
                                value={formData.link_url}
                                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-600 outline-none"
                                placeholder="https://example.com (opsional)"
                            />
                        </div>
                    )}

                    {/* Sort Order (carousel only) */}
                    {activeTab === "carousel" && (
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Urutan</label>
                            <input
                                type="number"
                                value={formData.sort_order}
                                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-600 outline-none"
                                min="0"
                            />
                        </div>
                    )}

                    {/* Date Range (popup only) */}
                    {activeTab === "popup" && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Tanggal Mulai</label>
                                <input
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-600 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Tanggal Berakhir</label>
                                <input
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-600 outline-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* Active Toggle */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-600"
                        />
                        <label htmlFor="is_active" className="text-sm font-medium text-white cursor-pointer select-none">
                            Aktif
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Simpan
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
