"use client";

import { useState } from "react";
import { Settings, Lock, AlertCircle, CheckCircle } from "lucide-react";

export default function MemberSettingsPage() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (newPassword !== confirmPassword) {
            setMessage({ type: "error", text: "Password baru tidak cocok" });
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ type: "error", text: "Password minimal 6 karakter" });
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/member/password`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ type: "success", text: data.message || "Password berhasil diubah" });
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                setMessage({ type: "error", text: data.error || "Gagal mengubah password" });
            }
        } catch {
            setMessage({ type: "error", text: "Terjadi kesalahan jaringan" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Settings className="w-7 h-7 text-(--primary)" />
                Pengaturan
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Change Password */}
                <div className="glass-card rounded-xl border border-white/10 p-6">
                    <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-(--accent)" />
                        Ubah Password
                    </h2>

                    {message && (
                        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${message.type === "success" ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
                            {message.type === "success" ? <CheckCircle className="w-5 h-5 text-green-400 shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
                            <p className={`text-sm ${message.type === "success" ? "text-green-400" : "text-red-400"}`}>{message.text}</p>
                        </div>
                    )}

                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-(--foreground)/80 mb-2">Password Lama</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full bg-(--input)/50 border border-(--border) rounded-xl py-3 px-4 text-(--foreground) placeholder-(--muted-foreground) focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all"
                                placeholder="Masukkan password lama"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-(--foreground)/80 mb-2">Password Baru</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-(--input)/50 border border-(--border) rounded-xl py-3 px-4 text-(--foreground) placeholder-(--muted-foreground) focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all"
                                placeholder="Masukkan password baru"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-(--foreground)/80 mb-2">Konfirmasi Password Baru</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-(--input)/50 border border-(--border) rounded-xl py-3 px-4 text-(--foreground) placeholder-(--muted-foreground) focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all"
                                placeholder="Ulangi password baru"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full arcade-btn flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                "Ubah Password"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
