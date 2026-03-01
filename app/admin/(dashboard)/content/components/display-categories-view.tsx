"use client";

import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import { Plus, Edit, Trash2, GripVertical, Save, X, Loader2, ToggleLeft, ToggleRight } from "lucide-react";

interface DisplayCategory {
    id: number;
    name: string;
    slug: string;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export default function DisplayCategoriesView() {
    const [categories, setCategories] = useState<DisplayCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newName, setNewName] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState("");
    const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
    const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response: any = await api.get("/admin/display-categories");
            setCategories(response.data?.categories || []);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;

        setSaving(true);
        try {
            await api.post("/admin/display-categories", {
                name: newName.trim(),
                is_active: true,
            });
            setNewName("");
            fetchCategories();
        } catch (error) {
            console.error("Failed to create category:", error);
            alert("Gagal membuat kategori. Pastikan nama tidak duplikat.");
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async (id: number) => {
        if (!editingName.trim()) return;

        setSaving(true);
        try {
            const cat = categories.find(c => c.id === id);
            await api.put(`/admin/display-categories/${id}`, {
                name: editingName.trim(),
                is_active: cat?.is_active ?? true,
            });
            setEditingId(null);
            setEditingName("");
            fetchCategories();
        } catch (error) {
            console.error("Failed to update category:", error);
            alert("Gagal update kategori.");
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (cat: DisplayCategory) => {
        try {
            await api.put(`/admin/display-categories/${cat.id}`, {
                name: cat.name,
                is_active: !cat.is_active,
            });
            fetchCategories();
        } catch (error) {
            console.error("Failed to toggle category:", error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Hapus kategori ini? Brand yang di-assign ke kategori ini akan menjadi belum dikategorikan.")) return;

        try {
            await api.delete(`/admin/display-categories/${id}`);
            fetchCategories();
        } catch (error) {
            console.error("Failed to delete category:", error);
        }
    };

    // Drag and drop for sorting
    const handleDragStart = (idx: number) => {
        setDraggedIdx(idx);
    };

    const handleDragOver = (e: React.DragEvent, idx: number) => {
        e.preventDefault();
        setDragOverIdx(idx);
    };

    const handleDrop = async (dropIdx: number) => {
        if (draggedIdx === null || draggedIdx === dropIdx) {
            setDraggedIdx(null);
            setDragOverIdx(null);
            return;
        }

        const newCategories = [...categories];
        const [dragged] = newCategories.splice(draggedIdx, 1);
        newCategories.splice(dropIdx, 0, dragged);
        setCategories(newCategories);
        setDraggedIdx(null);
        setDragOverIdx(null);

        // Save new order to backend
        try {
            await api.put("/admin/display-categories/sort", {
                ids: newCategories.map(c => c.id),
            });
        } catch (error) {
            console.error("Failed to save sort order:", error);
            fetchCategories(); // Revert on error
        }
    };

    const handleDragEnd = () => {
        setDraggedIdx(null);
        setDragOverIdx(null);
    };

    if (loading) {
        return (
            <div className="p-12 text-center text-white/40 flex flex-col items-center">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                Loading categories...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Info */}
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                <p className="text-sm text-blue-400 font-medium">Kategori akan menjadi tab di halaman depan</p>
                <p className="text-sm text-white/40 mt-1">
                    Drag & drop untuk mengatur urutan tab. Urutan paling atas = tab pertama.
                </p>
            </div>

            {/* Add New Category */}
            <form onSubmit={handleCreate} className="flex gap-3">
                <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nama kategori baru (e.g. Game Mobile, Voucher)"
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 text-sm outline-none transition-all placeholder:text-white/20"
                />
                <button
                    type="submit"
                    disabled={saving || !newName.trim()}
                    className="px-5 py-3 bg-primary hover:bg-primary/80 text-white rounded-xl transition-colors font-medium text-sm shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2 shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    Tambah
                </button>
            </form>

            {/* Categories List */}
            <div className="glass-card rounded-2xl overflow-hidden">
                {categories.length === 0 ? (
                    <div className="p-12 text-center text-white/30">
                        <p>Belum ada kategori. Tambahkan kategori pertama di atas.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {categories.map((cat, idx) => (
                            <div
                                key={cat.id}
                                draggable
                                onDragStart={() => handleDragStart(idx)}
                                onDragOver={(e) => handleDragOver(e, idx)}
                                onDrop={() => handleDrop(idx)}
                                onDragEnd={handleDragEnd}
                                className={`flex items-center gap-4 px-5 py-4 transition-all ${dragOverIdx === idx ? "bg-primary/10 border-primary/30" : "hover:bg-white/5"
                                    } ${draggedIdx === idx ? "opacity-50" : ""} ${!cat.is_active ? "opacity-60" : ""
                                    }`}
                            >
                                {/* Drag Handle */}
                                <div className="cursor-grab active:cursor-grabbing text-white/30 hover:text-white/60 transition-colors">
                                    <GripVertical className="w-5 h-5" />
                                </div>

                                {/* Order Number */}
                                <span className="text-xs font-mono text-white/30 w-6 text-center shrink-0">
                                    {idx + 1}
                                </span>

                                {/* Name */}
                                <div className="flex-1 min-w-0">
                                    {editingId === cat.id ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                className="flex-1 bg-black/40 border border-primary/50 rounded-lg px-3 py-1.5 text-white text-sm outline-none"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") handleUpdate(cat.id);
                                                    if (e.key === "Escape") setEditingId(null);
                                                }}
                                            />
                                            <button
                                                onClick={() => handleUpdate(cat.id)}
                                                disabled={saving}
                                                className="p-1.5 bg-primary rounded-lg text-white hover:bg-primary/80 transition-colors"
                                            >
                                                <Save className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="p-1.5 bg-white/10 rounded-lg text-white/50 hover:text-white hover:bg-white/20 transition-colors"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-white truncate">{cat.name}</span>
                                            <span className="text-[10px] text-white/30 font-mono bg-white/5 px-2 py-0.5 rounded shrink-0">
                                                {cat.slug}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Active Toggle */}
                                <button
                                    onClick={() => handleToggleActive(cat)}
                                    className="shrink-0"
                                    title={cat.is_active ? "Aktif — klik untuk nonaktifkan" : "Nonaktif — klik untuk aktifkan"}
                                >
                                    {cat.is_active ? (
                                        <ToggleRight className="w-7 h-7 text-green-400 hover:text-green-300 transition-colors" />
                                    ) : (
                                        <ToggleLeft className="w-7 h-7 text-white/30 hover:text-white/50 transition-colors" />
                                    )}
                                </button>

                                {/* Actions */}
                                {editingId !== cat.id && (
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            onClick={() => {
                                                setEditingId(cat.id);
                                                setEditingName(cat.name);
                                            }}
                                            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat.id)}
                                            className="p-2 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                            title="Hapus"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
