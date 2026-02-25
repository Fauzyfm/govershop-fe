"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, User, AlertCircle, ArrowLeft } from "lucide-react";
import api from "@/lib/api";

export default function UnifiedLogin() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response: any = await api.post("/admin/login", {
                username,
                password,
            });

            if (response?.success && response?.data) {
                const { role } = response.data;

                // Store role in localStorage for UI auth check
                // Token is stored in HTTP-only cookie by backend
                localStorage.setItem("user_role", role);

                // Redirect based on role
                if (role === "admin") {
                    router.push("/admin/dashboard");
                } else if (role === "member") {
                    router.push("/member/dashboard");
                } else {
                    setError("Role tidak valid");
                }
            } else {
                setError("Gagal login: Response tidak valid");
            }
        } catch (err: any) {
            console.error(err);
            setError(
                err.response?.data?.error || "Gagal login. Periksa username dan password."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="glass-card rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden border border-(--border)">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-(--primary) via-(--accent) to-(--secondary)" />

            <div className="text-center mb-10">
                <Link href="/" className="inline-flex items-center gap-2 text-(--muted-foreground) hover:text-(--foreground) transition-colors mb-6 text-sm bg-(--card)/50 py-1.5 px-3 rounded-full hover:bg-(--card) border border-(--border)/30">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Kembali ke Beranda
                </Link>
                <div className="w-16 h-16 bg-linear-to-br from-(--primary) to-(--secondary) rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-(--primary)/20 transform rotate-3">
                    <User className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-(--foreground) mb-2 glow-text">Login</h1>
                <p className="text-(--muted-foreground)">Masuk ke akun Restopup Anda</p>
            </div>

            {error && (
                <div className="bg-(--primary)/10 border border-(--primary)/20 rounded-xl p-4 mb-6 flex items-start gap-3 backdrop-blur-sm">
                    <AlertCircle className="w-5 h-5 text-(--primary) shrink-0 mt-0.5" />
                    <p className="text-sm text-(--primary-foreground)/80">{error}</p>
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-(--foreground)/80 mb-2 ml-1">
                        Username
                    </label>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--muted-foreground) group-focus-within:text-(--accent) transition-colors" />
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-(--input)/50 border border-(--border) rounded-xl py-3.5 pl-12 pr-4 text-(--foreground) placeholder-(--muted-foreground) focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all hover:border-(--border)/80"
                            placeholder="Masukkan username"
                            required
                        />
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2 ml-1">
                        <label className="block text-sm font-medium text-(--foreground)/80">
                            Password
                        </label>
                        <Link
                            href="/member/forgot-password"
                            className="text-xs text-(--accent) hover:text-(--primary) transition-colors"
                        >
                            Lupa Password?
                        </Link>
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--muted-foreground) group-focus-within:text-(--accent) transition-colors" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-(--input)/50 border border-(--border) rounded-xl py-3.5 pl-12 pr-4 text-(--foreground) placeholder-(--muted-foreground) focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all hover:border-(--border)/80"
                            placeholder="Masukkan password"
                            required
                        />
                    </div>
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
                        "Masuk Sekarang"
                    )}
                </button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-(--muted-foreground) text-sm">
                    Belum punya akun? <Link href="#" className="text-(--accent) hover:text-(--primary) font-medium">Hubungi Admin</Link>
                </p>
            </div>
        </div>
    );
}
