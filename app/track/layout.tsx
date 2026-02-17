import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Lacak Pesanan Top Up Game",
    description:
        "Lacak status pesanan top up game kamu di Govershop. Masukkan nomor HP untuk melihat riwayat dan status pembayaran.",
    alternates: {
        canonical: "/track",
    },
};

export default function TrackLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
