"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import api from "@/lib/api";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            setStatus("error");
            setMessage("Token reset tidak valid atau tidak ada.");
            return;
        }

        if (password !== confirmPassword) {
            setStatus("error");
            setMessage("Password tidak cocok.");
            return;
        }

        if (password.length < 6) {
            setStatus("error");
            setMessage("Password minimal 6 karakter.");
            return;
        }

        setStatus("loading");
        setMessage("");

        try {
            await api.post("/member/reset-password", {
                token,
                new_password: password
            });
            setStatus("success");
            setMessage("Password berhasil direset! Silakan login dengan password baru.");
        } catch (err: any) {
            console.error(err);
            setStatus("error");
            setMessage(err.response?.data?.error || "Gagal reset password. Token mungkin sudah kadaluarsa.");
        }
    };

    if (!token) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                <h3 className="text-red-400 font-medium mb-2">Token Invalid</h3>
                <p className="text-sm text-slate-400 mb-4">Link reset password tidak valid atau sudah kadaluarsa.</p>
                <Link href="/member/forgot-password" className="text-sm text-white hover:underline">
                    Kirim ulang link reset
                </Link>
            </div>
        );
    }

    return (
        <>
            {status === "error" && (
                <div className="bg-(--primary)/10 border border-(--primary)/20 rounded-xl p-4 mb-6 flex items-start gap-3 backdrop-blur-sm">
                    <AlertCircle className="w-5 h-5 text-(--primary) shrink-0 mt-0.5" />
                    <p className="text-sm text-(--primary-foreground)/80">{message}</p>
                </div>
            )}

            {status === "success" ? (
                <div className="bg-(--secondary)/20 border border-(--primary)/20 rounded-xl p-6 text-center space-y-4 backdrop-blur-sm">
                    <div className="w-12 h-12 bg-(--primary)/20 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-6 h-6 text-(--primary)" />
                    </div>
                    <div>
                        <h3 className="text-(--primary) font-medium mb-1">Berhasil!</h3>
                        <p className="text-sm text-(--muted-foreground)">{message}</p>
                    </div>
                    <Link
                        href="/auth/login"
                        className="block w-full arcade-btn text-center"
                    >
                        Login Sekarang
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-(--foreground)/80 mb-2 ml-1">
                            Password Baru
                        </label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--muted-foreground) group-focus-within:text-(--accent) transition-colors" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-(--input)/50 border border-(--border) rounded-xl py-3.5 pl-12 pr-4 text-(--foreground) placeholder-(--muted-foreground) focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all hover:border-(--border)/80"
                                placeholder="Minimal 6 karakter"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-(--foreground)/80 mb-2 ml-1">
                            Konfirmasi Password
                        </label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--muted-foreground) group-focus-within:text-(--accent) transition-colors" />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-(--input)/50 border border-(--border) rounded-xl py-3.5 pl-12 pr-4 text-(--foreground) placeholder-(--muted-foreground) focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all hover:border-(--border)/80"
                                placeholder="Ulangi password baru"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={status === "loading"}
                        className="w-full arcade-btn flex items-center justify-center gap-2"
                    >
                        {status === "loading" ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Menyimpan...</span>
                            </>
                        ) : (
                            "Reset Password"
                        )}
                    </button>
                </form>
            )}
        </>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="glass-card rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden border border-(--border)">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-(--primary) via-(--accent) to-(--secondary)" />

            <div className="text-center mb-10">
                <Link href="/auth/login" className="inline-flex items-center gap-2 text-(--muted-foreground) hover:text-(--foreground) transition-colors mb-6 text-sm bg-(--card)/50 py-1.5 px-3 rounded-full hover:bg-(--card) border border-(--border)/30">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Kembali ke Login
                </Link>
                <div className="w-16 h-16 bg-linear-to-br from-(--primary) to-(--secondary) rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-(--primary)/20 transform rotate-6">
                    <Lock className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-(--foreground) mb-2 glow-text">Reset Password</h1>
                <p className="text-(--muted-foreground)">Buat password baru untuk akun Anda</p>
            </div>

            <Suspense fallback={
                <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
            }>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}
