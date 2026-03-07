import { Metadata } from 'next';
import { Zap, ShieldCheck, HeartHandshake } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Tentang Kami - Restopup',
    description: 'Kisah perjalanan Restopup hadir sebagai platform top up game dan voucher digital termurah dan terpercaya di Indonesia.',
};

export default function AboutPage() {
    return (
        <div className="w-screen relative left-1/2 -translate-x-1/2 -mt-8 min-h-screen bg-background text-foreground pt-32 pb-24">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-16 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight relative z-10 neon-glow">Tentang Restopup</h1>
                    <p className="text-muted-foreground text-lg md:text-xl relative z-10 max-w-2xl mx-auto">
                        Sebuah cerita kecil tentang bagaimana kami bermula, dan kenapa kami terus ada untuk Anda.
                    </p>
                </div>
            </div>

            {/* Full-width Content */}
            <div className="w-full relative bg-card/40 border-y border-white/5 py-12 md:py-20 overflow-hidden">
                {/* Background acccent */}
                <div className="absolute -top-40 right-0 md:right-40 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-4xl mx-auto px-4 relative z-10 prose prose-invert space-y-6 text-muted-foreground/90 leading-relaxed md:text-lg">
                    <p className="first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:mr-2 first-letter:float-left">
                        Dulu, bermain game seringkali terasa seperti aktivitas yang hanya bisa dinikmati oleh kalangan tertentu. Ketika sebuah item eksklusif atau karakter baru dirilis, tidak semua gamer memiliki akses mudah untuk mendapatkannya. Metode pembayaran yang rumit, harga yang terlampau tinggi, atau proses panjang yang berbelit-belit sering menjadi penghalang.
                    </p>

                    <p>
                        Berangkat dari keresahan sederhana itulah Restopup lahir. Kami memulainya bukan dengan ambisi menjadi sesuatu yang raksasa secara instan, melainkan dari sebuah keinginan mendasar: bagaimana caranya agar teman-teman kami, dan semua gamer di luar sana, bisa membeli apa yang mereka inginkan di dalam game tanpa merasa sedang mempersulit diri sendiri.
                    </p>

                    <div className="border-l-4 border-primary/50 pl-6 my-10 py-2 italic text-white/80">
                        "Kami percaya bahwa setiap gamer berhak mendapatkan pengalaman yang menyenangkan, tidak hanya saat berada di dalam permainan, tetapi juga saat mereka sedang mempersiapkan diri menuju pertempuran."
                    </div>

                    <p>
                        Pada hari-hari awal perjalanan ini, kami menghabiskan waktu tanpa henti untuk mencari tahu bagaimana menciptakan sebuah sistem yang berjalan mulus. Kami ingin saat Anda menekan tombol bayar, item yang dinanti-nanti langsung berada di genggaman dalam hitungan detik. Kami membangun teknologi di balik layar agar sistem bekerja secara otomatis, 24 jam sehari, 7 hari seminggu, tanpa lelah.
                    </p>

                    <p>
                        Seiring berjalannya waktu, kepercayaan mulai terbangun. Dari satu transaksi menjadi puluhan, kemudian ribuan. Namun, fokus kami tidak pernah bergeser dari niat awal. Kami terus mencari cara menekan harga agar tetap bersahabat dengan kantong pelajar maupun pekerja. Kami mengintegrasikan lebih banyak metode pembayaran, dari pulsa yang sederhana hingga transaksi bank digital yang modern.
                    </p>

                    <p>
                        Restopup bukan sekadar toko atau platform transaksi otomatis. Kami melihat diri kami sebagai bagian dari komunitas game yang terus berkembang pesat. Kami ada di sana ketika Anda butuh persiapan darurat sebelum turnamen malam, atau sekadar ingin memberi hadiah kecil untuk teman satu tim yang bermain luar biasa.
                    </p>

                    <p>
                        Hari ini, dengan sistem keamanan enkripsi yang terjamin dan komitmen legalitas pada setiap produk yang kami tawarkan, Restopup mengukuhkan langkahnya sebagai mitra terpercaya puluhan ribu gamer di seluruh Indonesia.
                    </p>

                    <p>
                        Perjalanan ini masih panjang, dan game-game baru akan terus bermunculan. Tapi satu hal yang akan selalu sama: di mana pun pertempuran maya Anda berada, Restopup akan selalu siap di belakang layar, memastikan persiapan Anda berjalan mudah, murah, dan cepat.
                    </p>
                </div>
            </div>

            {/* Value Section Re-wrapped */}
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-card/30 border border-white/5 rounded-2xl p-8 hover:bg-card/50 transition-colors">
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                            <Zap className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Kecepatan</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">Sistem otomatis kami mendobrak batasan waktu, memastikan tidak ada lagi jeda antara pembayaran dan bermain.</p>
                    </div>
                    <div className="bg-card/30 border border-white/5 rounded-2xl p-8 hover:bg-card/50 transition-colors">
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Kejujuran</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">Harga yang bersahabat dan 100% legalitas produk tanpa kompromi, karena kepercayaan Anda adalah fondasi kami.</p>
                    </div>
                    <div className="bg-card/30 border border-white/5 rounded-2xl p-8 hover:bg-card/50 transition-colors">
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                            <HeartHandshake className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Kenyamanan</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">Kemudahan bertransaksi kapan saja dengan berbagai metode pembayaran lokal yang Anda gunakan setiap hari.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
