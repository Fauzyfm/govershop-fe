import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'FAQ - Restopup',
    description: 'Pertanyaan yang sering diajukan seputar layanan top up game di Restopup',
};

export default function FAQPage() {
    const faqs = [
        {
            question: "Apa itu Restopup?",
            answer: "Restopup adalah platform top up game dan voucher digital terpercaya di Indonesia yang menawarkan harga termurah dan proses otomatis 24 jam nonstop."
        },
        {
            question: "Bagaimana cara melakukan transaksi?",
            answer: "Cara transaksi sangat mudah: 1. Pilih game atau layanan yang diinginkan. 2. Pilih nominal produk. 3. Masukkan ID/Username game Anda. 4. Pilih metode pembayaran. 5. Lakukan pembayaran dan pesanan Anda akan diproses otomatis."
        },
        {
            question: "Metode pembayaran apa saja yang tersedia?",
            answer: "Kami menerima berbagai metode pembayaran seperti E-Wallet (OVO, DANA, GoPay, ShopeePay, LinkAja), Transfer Bank (BCA, Mandiri, BNI, BRI), QRIS, serta pembayaran melalui Alfamart dan Indomaret."
        },
        {
            question: "Berapa lama proses transaksi selesai?",
            answer: "Secara umum, proses transaksi memakan waktu 1-5 detik setelah pembayaran kami terima. Untuk keadaan tertentu seperti gangguan server game, diproses maksimal 1x24 jam."
        },
        {
            question: "Apakah aman bertransaksi di Restopup?",
            answer: "Sangat aman. Kami menggunakan sistem otomatis dan keamanan enkripsi transaksi dengan jaminan legal 100%. Kami juga tidak pernah meminta password akun game Anda (kecuali untuk layanan joki)."
        },
        {
            question: "Pesanan saya belum masuk, apa yang harus saya lakukan?",
            answer: "Jika pesanan Anda belum masuk dalam 15 menit, silakan hubungi tim dukungan pelanggan kami via WhatsApp yang tertera di halaman Hubungi Kami dengan menyertakan Nomor Invoice."
        },
        {
            question: "Jam berapa operasional Restopup?",
            answer: "Sistem kami memproses pesanan secara otomatis selama 24 jam nonstop, sehingga Anda dapat bertransaksi kapan saja. Tim dukungan tersedia dari jam 09.00 - 22.00 WIB."
        }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <div className="pt-24 pb-12 overflow-hidden relative">
                <div className="absolute inset-0 bg-linear-to-b from-primary/10 to-transparent pointer-events-none" />
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight drop-shadow-md">
                        Frequently Asked Questions (FAQ)
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                        Temukan jawaban untuk pertanyaan yang paling sering ditanyakan mengenai layanan kami.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-4xl">
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-primary/50 transition-colors">
                            <h3 className="text-lg md:text-xl font-semibold mb-3 text-foreground">
                                {faq.question}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {faq.answer}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-12 p-8 bg-primary/10 rounded-2xl border border-primary/20">
                    <div className="text-center mb-8">
                        <h2 className="text-xl font-bold mb-2">Masih punya pertanyaan?</h2>
                        <p className="text-muted-foreground">
                            Tim dukungan kami siap membantu Anda menyelesaikan masalah.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        {/* WhatsApp Contact */}
                        <div className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold mb-1">WhatsApp CS</h3>
                            <p className="text-sm text-muted-foreground mb-4">Jam Operasional: 09:00 - 22:00 WIB</p>
                            <a
                                href="https://wa.me/6283114014648"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 bg-emerald-600 text-white hover:bg-emerald-700 h-10 px-4 py-2 w-full"
                            >
                                Chat via WhatsApp
                            </a>
                        </div>

                        {/* Email Contact */}
                        <div className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                            <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold mb-1">Email Support</h3>
                            <p className="text-sm text-muted-foreground mb-4">Pesan Anda akan dibalas 1x24 Jam</p>
                            <a
                                href="mailto:support@restopup.com"
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 w-full"
                            >
                                Kirim Email
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
