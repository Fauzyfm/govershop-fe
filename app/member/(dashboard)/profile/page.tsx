"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, AlertCircle, CheckCircle, Save } from "lucide-react";
import api from "@/lib/api";

interface Profile {
    id: number;
    username: string;
    email: string;
    full_name: string;
    whatsapp: string;
    balance: number;
    status: string;
    created_at: string;
}

export default function MemberProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [fullName, setFullName] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data: any = await api.get("/member/profile");
            if (data.success && data.data) {
                setProfile(data.data);
                setFullName(data.data.full_name || "");
                setWhatsapp(data.data.whatsapp || "");
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setIsSaving(true);

        try {
            const data: any = await api.put("/member/profile", {
                full_name: fullName,
                whatsapp: whatsapp,
            });
            if (data.success) {
                setMessage({ type: "success", text: data.message || "Profil berhasil diupdate" });
                fetchProfile();
            } else {
                setMessage({ type: "error", text: data.error || "Gagal mengupdate profil" });
            }
        } catch {
            setMessage({ type: "error", text: "Terjadi kesalahan jaringan" });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <div className="w-8 h-8 border-2 border-(--primary) border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <User className="w-7 h-7 text-(--primary)" />
                Profil Saya
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Info Card */}
                <div className="glass-card rounded-xl border border-white/10 p-6">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-linear-to-br from-(--primary) to-(--secondary) rounded-full mx-auto flex items-center justify-center mb-4">
                            <User className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white">{profile?.full_name || profile?.username}</h2>
                        <p className="text-(--muted-foreground)">@{profile?.username}</p>
                        <div className="mt-4 p-3 bg-(--card)/50 rounded-xl">
                            <p className="text-xs text-(--muted-foreground)">Saldo</p>
                            <p className="text-xl font-bold text-(--accent)">
                                Rp {(profile?.balance || 0).toLocaleString("id-ID")}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Edit Profile Form */}
                <div className="lg:col-span-2 glass-card rounded-xl border border-white/10 p-6">
                    <h2 className="text-lg font-semibold text-white mb-6">Edit Profil</h2>

                    {message && (
                        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${message.type === "success" ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
                            {message.type === "success" ? <CheckCircle className="w-5 h-5 text-green-400 shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
                            <p className={`text-sm ${message.type === "success" ? "text-green-400" : "text-red-400"}`}>{message.text}</p>
                        </div>
                    )}

                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-(--foreground)/80 mb-2">Username</label>
                            <input
                                type="text"
                                value={profile?.username || ""}
                                disabled
                                className="w-full bg-(--input)/30 border border-(--border) rounded-xl py-3 px-4 text-(--muted-foreground) cursor-not-allowed"
                            />
                            <p className="text-xs text-(--muted-foreground) mt-1">Username tidak dapat diubah</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-(--foreground)/80 mb-2">
                                <Mail className="w-4 h-4 inline mr-2" />
                                Email
                            </label>
                            <input
                                type="email"
                                value={profile?.email || ""}
                                disabled
                                className="w-full bg-(--input)/30 border border-(--border) rounded-xl py-3 px-4 text-(--muted-foreground) cursor-not-allowed"
                            />
                            <p className="text-xs text-(--muted-foreground) mt-1">Hubungi admin untuk mengubah email</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-(--foreground)/80 mb-2">Nama Lengkap</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-(--input)/50 border border-(--border) rounded-xl py-3 px-4 text-(--foreground) placeholder-(--muted-foreground) focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all"
                                placeholder="Nama lengkap Anda"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-(--foreground)/80 mb-2">
                                <Phone className="w-4 h-4 inline mr-2" />
                                WhatsApp
                            </label>
                            <input
                                type="text"
                                value={whatsapp}
                                onChange={(e) => setWhatsapp(e.target.value)}
                                className="w-full bg-(--input)/50 border border-(--border) rounded-xl py-3 px-4 text-(--foreground) placeholder-(--muted-foreground) focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all"
                                placeholder="08xxxxxxxxxx"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="arcade-btn flex items-center justify-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Simpan Perubahan
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
