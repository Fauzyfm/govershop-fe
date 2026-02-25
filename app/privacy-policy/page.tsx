"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen">
            <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
                {/* Back button */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Kembali ke Beranda
                </Link>

                {/* Card Container */}
                <div className="rounded-2xl bg-card/80 backdrop-blur-md border border-white/10 p-6 md:p-10 shadow-xl">
                    {/* Header */}
                    <div className="mb-12">
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                            Kebijakan Privasi
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Terakhir diperbarui: 23 Februari 2026
                        </p>
                    </div>

                    {/* Content */}
                    <div className="space-y-10 text-foreground/85 leading-relaxed">
                        <section>
                            <p>
                                Restopup (&quot;kami&quot;, &quot;milik kami&quot;) berkomitmen untuk melindungi privasi dan keamanan data pribadi Anda.
                                Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi
                                informasi pribadi Anda saat menggunakan layanan kami di website Restopup.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 border-l-4 border-primary pl-3">
                                1. Informasi yang Kami Kumpulkan
                            </h2>
                            <p className="mb-4">Kami mengumpulkan beberapa jenis informasi untuk menyediakan dan meningkatkan layanan kami:</p>
                            <div className="space-y-4 pl-4">
                                <div>
                                    <h3 className="font-semibold text-foreground mb-1">a. Informasi yang Anda Berikan</h3>
                                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                        <li>Nomor telepon / WhatsApp untuk notifikasi transaksi</li>
                                        <li>Alamat email (untuk akun member)</li>
                                        <li>User ID / Game ID untuk keperluan top up</li>
                                        <li>Informasi pembayaran terkait transaksi</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-1">b. Informasi yang Dikumpulkan Otomatis</h3>
                                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                        <li>Alamat IP dan informasi perangkat</li>
                                        <li>Data penggunaan website (halaman yang dikunjungi, waktu akses)</li>
                                        <li>Cookie dan teknologi pelacakan serupa</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 border-l-4 border-primary pl-3">
                                2. Penggunaan Informasi
                            </h2>
                            <p className="mb-3">Kami menggunakan informasi yang dikumpulkan untuk:</p>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
                                <li>Memproses dan menyelesaikan transaksi top up game Anda</li>
                                <li>Mengirimkan notifikasi status pesanan dan konfirmasi pembayaran</li>
                                <li>Menyediakan dukungan pelanggan (customer support)</li>
                                <li>Meningkatkan kualitas layanan dan pengalaman pengguna</li>
                                <li>Mencegah aktivitas penipuan atau penyalahgunaan layanan</li>
                                <li>Memenuhi kewajiban hukum yang berlaku</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 border-l-4 border-primary pl-3">
                                3. Berbagi Informasi dengan Pihak Ketiga
                            </h2>
                            <p className="mb-3">
                                Kami tidak menjual atau menyewakan data pribadi Anda kepada pihak ketiga.
                                Namun, kami dapat membagikan informasi Anda kepada pihak ketiga dalam kondisi berikut:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
                                <li>
                                    <strong className="text-foreground/90">Penyedia Layanan Pembayaran:</strong> Data transaksi dibagikan kepada
                                    payment gateway (penyedia pembayaran) untuk memproses pembayaran Anda secara aman.
                                </li>
                                <li>
                                    <strong className="text-foreground/90">Penyedia Produk Digital:</strong> User ID / Game ID Anda dibagikan kepada
                                    penyedia produk digital (supplier) untuk memproses pengiriman item ke akun game Anda.
                                </li>
                                <li>
                                    <strong className="text-foreground/90">Kewajiban Hukum:</strong> Jika diwajibkan oleh hukum, peraturan,
                                    atau proses hukum yang berlaku di Indonesia.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 border-l-4 border-primary pl-3">
                                4. Keamanan Data
                            </h2>
                            <p>
                                Kami menerapkan langkah-langkah keamanan teknis dan organisasional yang sesuai untuk melindungi
                                data pribadi Anda dari akses tidak sah, pengubahan, pengungkapan, atau penghancuran. Ini termasuk
                                penggunaan enkripsi, firewall, dan kontrol akses yang ketat. Namun, tidak ada metode transmisi data
                                melalui internet yang 100% aman, dan kami tidak dapat menjamin keamanan absolut.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 border-l-4 border-primary pl-3">
                                5. Penyimpanan Data
                            </h2>
                            <p>
                                Data pribadi Anda disimpan selama diperlukan untuk memenuhi tujuan yang dijelaskan dalam kebijakan ini,
                                termasuk untuk memenuhi kewajiban hukum, menyelesaikan sengketa, dan menegakkan perjanjian kami.
                                Data transaksi disimpan untuk keperluan catatan dan audit sesuai ketentuan hukum yang berlaku.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 border-l-4 border-primary pl-3">
                                6. Hak Anda
                            </h2>
                            <p className="mb-3">
                                Sesuai dengan Undang-Undang Perlindungan Data Pribadi (UU PDP) Indonesia, Anda memiliki hak untuk:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
                                <li>Mengakses data pribadi Anda yang kami simpan</li>
                                <li>Meminta perbaikan data pribadi yang tidak akurat</li>
                                <li>Meminta penghapusan data pribadi Anda (dengan beberapa pengecualian)</li>
                                <li>Menarik persetujuan atas pemrosesan data pribadi Anda</li>
                            </ul>
                            <p className="mt-3">
                                Untuk menggunakan hak-hak tersebut, silakan hubungi kami melalui informasi kontak yang tercantum di bawah.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 border-l-4 border-primary pl-3">
                                7. Cookie
                            </h2>
                            <p>
                                Kami menggunakan cookie dan teknologi serupa untuk meningkatkan pengalaman browsing Anda,
                                menganalisis traffic website, dan memahami bagaimana pengunjung berinteraksi dengan layanan kami.
                                Anda dapat mengatur preferensi cookie melalui pengaturan browser Anda.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 border-l-4 border-primary pl-3">
                                8. Perubahan Kebijakan
                            </h2>
                            <p>
                                Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan akan dipublikasikan
                                di halaman ini dengan tanggal &quot;terakhir diperbarui&quot; yang baru. Kami menyarankan Anda untuk
                                meninjau kebijakan ini secara berkala.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 border-l-4 border-primary pl-3">
                                9. Hubungi Kami
                            </h2>
                            <p>
                                Jika Anda memiliki pertanyaan atau keluhan terkait Kebijakan Privasi ini, silakan hubungi kami melalui:
                            </p>
                            <div className="mt-4 p-4 rounded-xl bg-card border border-border">
                                <p className="font-semibold text-foreground">Restopup</p>
                                <p className="text-muted-foreground mt-1">
                                    No Whatsapp / Telepon:{" "}
                                    <a href="mailto:fachrulfauzy23@gmail.com" className="text-primary hover:underline">
                                        +6283114014648
                                    </a>
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
