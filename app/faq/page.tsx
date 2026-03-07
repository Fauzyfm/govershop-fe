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
            answer: "Cara transaksi sangat mudah: 1. Pilih game atau layanan yang diinginkan. 2. Masukkan ID/Username game Anda. 3. Pilih nominal produk. 4. Pilih metode pembayaran. 5. Lakukan pembayaran dan pesanan Anda akan diproses otomatis."
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

                <div className="mt-12 text-center p-8 bg-primary/10 rounded-2xl border border-primary/20">
                    <h2 className="text-xl font-bold mb-4">Masih punya pertanyaan?</h2>
                    <p className="text-muted-foreground mb-6">
                        Tim dukungan kami siap membantu Anda menyelesaikan masalah.
                    </p>
                    <a
                        href="https://wa.me/6283114014648"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    >
                        Hubungi Customer Service
                    </a>
                </div>
            </div>
        </div>
    );
}
