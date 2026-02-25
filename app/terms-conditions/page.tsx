"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function TermsConditionsPage() {
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
                            Syarat &amp; Ketentuan
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Terakhir diperbarui: 23 Februari 2026
                        </p>
                    </div>

                    {/* Content */}
                    <div className="space-y-10 text-foreground/85 leading-relaxed">
                        <section>
                            <p>
                                Selamat datang di Restopup. Dengan mengakses dan menggunakan website serta layanan kami,
                                Anda dianggap telah membaca, memahami, dan menyetujui seluruh Syarat &amp; Ketentuan yang
                                berlaku di bawah ini. Jika Anda tidak menyetujui salah satu ketentuan, mohon untuk tidak
                                menggunakan layanan kami.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 border-l-4 border-primary pl-3">
                                1. Definisi
                            </h2>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
                                <li>
                                    <strong className="text-foreground/90">&quot;Restopup&quot;</strong> mengacu pada platform
                                    website yang menyediakan layanan top up game dan produk digital.
                                </li>
                                <li>
                                    <strong className="text-foreground/90">&quot;Pengguna&quot;</strong> adalah setiap individu
                                    yang mengakses, mendaftar, atau menggunakan layanan Restopup.
                                </li>
                                <li>
                                    <strong className="text-foreground/90">&quot;Layanan&quot;</strong> mencakup seluruh fitur yang
                                    tersedia di Restopup, termasuk top up game, pembelian voucher, dan fitur member.
                                </li>
                                <li>
                                    <strong className="text-foreground/90">&quot;Transaksi&quot;</strong> adalah proses pembelian
                                    produk digital melalui Restopup.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 border-l-4 border-primary pl-3">
                                2. Ketentuan Umum
                            </h2>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
                                <li>Pengguna wajib berusia minimal 13 tahun atau memiliki persetujuan orang tua/wali untuk menggunakan layanan ini.</li>
                                <li>Pengguna bertanggung jawab penuh atas keakuratan data yang dimasukkan saat melakukan transaksi, termasuk User ID, Server ID, dan nomor telepon.</li>
                                <li>Restopup berhak menolak, membatalkan, atau menghentikan layanan kepada pengguna yang melanggar ketentuan ini.</li>
                                <li>Restopup berhak mengubah, memodifikasi, atau memperbarui Syarat &amp; Ketentuan ini kapan saja tanpa pemberitahuan terlebih dahulu.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 border-l-4 border-primary pl-3">
                                3. Layanan Top Up &amp; Produk Digital
                            </h2>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
                                <li>Restopup menyediakan layanan top up game dan pembelian produk digital seperti diamond, UC, voucher, dan item in-game lainnya.</li>
                                <li>Proses top up dilakukan secara otomatis setelah pembayaran dikonfirmasi oleh sistem pembayaran.</li>
                                <li>Waktu pemrosesan transaksi umumnya berlangsung dalam hitungan detik hingga beberapa menit, tergantung kondisi server dan penyedia layanan.</li>
                                <li>Harga produk yang ditampilkan sudah termasuk biaya layanan kecuali disebutkan lain.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 border-l-4 border-primary pl-3">
                                4. Pembayaran
                            </h2>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
                                <li>Restopup menerima pembayaran melalui metode yang tersedia di website, termasuk namun tidak terbatas pada QRIS, e-wallet, dan transfer bank.</li>
                                <li>Pembayaran harus dilakukan dalam batas waktu yang ditentukan. Transaksi yang tidak dibayar dalam batas waktu akan otomatis dibatalkan.</li>
                                <li>Biaya tambahan seperti biaya admin dan biaya transaksi akan ditampilkan secara transparan sebelum pembayaran dilakukan.</li>
                                <li>Restopup tidak bertanggung jawab atas keterlambatan atau kegagalan pembayaran yang disebabkan oleh pihak penyedia layanan pembayaran.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 border-l-4 border-primary pl-3">
                                5. Kebijakan Pengembalian Dana (Refund)
                            </h2>
                            <div className="p-4 rounded-xl bg-card border border-border mb-4">
                                <p className="font-semibold text-primary">⚠️ Penting</p>
                                <p className="text-muted-foreground mt-1">
                                    Produk digital yang telah berhasil diproses dan dikirimkan <strong className="text-foreground/90">tidak dapat dikembalikan (non-refundable)</strong>.
                                </p>
                            </div>
                            <p className="mb-3">Pengembalian dana hanya dapat dilakukan dalam kondisi berikut:</p>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
                                <li>Pembayaran berhasil tetapi item tidak masuk ke akun game dalam waktu yang ditentukan, dan bukan disebabkan oleh kesalahan input pengguna.</li>
                                <li>Terjadi kesalahan teknis dari pihak Restopup yang menyebabkan transaksi gagal.</li>
                                <li>Terjadi duplikasi pembayaran yang tidak disengaja.</li>
                            </ul>
                            <p className="mt-3 text-muted-foreground">
                                Proses refund akan diverifikasi terlebih dahulu oleh tim Restopup dan membutuhkan waktu 1–7 hari kerja.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 border-l-4 border-primary pl-3">
                                6. Kesalahan Input Data
                            </h2>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
                                <li>
                                    Pengguna bertanggung jawab penuh atas kebenaran data yang dimasukkan, termasuk
                                    User ID, Server ID, dan nomor telepon.
                                </li>
                                <li>
                                    Restopup <strong className="text-foreground/90">tidak bertanggung jawab</strong> atas kerugian yang timbul akibat kesalahan input data oleh pengguna.
                                </li>
                                <li>
                                    Jika item sudah terkirim ke akun yang salah karena kesalahan input, maka transaksi
                                    dianggap selesai dan tidak dapat di-refund.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 border-l-4 border-primary pl-3">
                                7. Akun Member
                            </h2>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
                                <li>Pengguna dapat mendaftar sebagai member untuk mendapatkan harga khusus dan fitur tambahan.</li>
                                <li>Pengguna bertanggung jawab menjaga kerahasiaan kredensial akun (email dan password).</li>
                                <li>Restopup tidak bertanggung jawab atas kerugian yang timbul akibat akses tidak sah ke akun member yang disebabkan oleh kelalaian pengguna.</li>
                                <li>Restopup berhak menangguhkan atau menonaktifkan akun member yang terbukti melanggar ketentuan ini atau melakukan aktivitas yang mencurigakan.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 border-l-4 border-primary pl-3">
                                8. Larangan Penggunaan
                            </h2>
                            <p className="mb-3">Pengguna dilarang untuk:</p>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
                                <li>Menggunakan layanan untuk tujuan ilegal atau melawan hukum.</li>
                                <li>Melakukan penipuan, manipulasi, atau penyalahgunaan sistem pembayaran.</li>
                                <li>Menggunakan bot, script, atau metode otomatis lainnya untuk mengakses layanan.</li>
                                <li>Mengganggu atau merusak infrastruktur dan keamanan website.</li>
                                <li>Menyebarkan informasi palsu atau menyesatkan terkait layanan Restopup.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 border-l-4 border-primary pl-3">
                                9. Batasan Tanggung Jawab
                            </h2>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
                                <li>Restopup menyediakan layanan &quot;sebagaimana adanya&quot; (as is) tanpa jaminan apapun, baik tersurat maupun tersirat.</li>
                                <li>Restopup tidak bertanggung jawab atas kerugian langsung maupun tidak langsung yang timbul dari penggunaan layanan, termasuk namun tidak terbatas pada kehilangan data, gangguan layanan, atau akses tidak sah.</li>
                                <li>Restopup tidak bertanggung jawab atas gangguan layanan yang disebabkan oleh pihak ketiga, termasuk penyedia game, server game, atau penyedia layanan pembayaran.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 border-l-4 border-primary pl-3">
                                10. Hukum yang Berlaku
                            </h2>
                            <p>
                                Syarat &amp; Ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum yang berlaku
                                di Republik Indonesia. Segala sengketa yang timbul dari penggunaan layanan ini akan
                                diselesaikan secara musyawarah terlebih dahulu. Jika tidak tercapai kesepakatan,
                                maka sengketa akan diselesaikan melalui pengadilan yang berwenang di wilayah Indonesia.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 border-l-4 border-primary pl-3">
                                11. Hubungi Kami
                            </h2>
                            <p>
                                Jika Anda memiliki pertanyaan mengenai Syarat &amp; Ketentuan ini, silakan hubungi kami:
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
