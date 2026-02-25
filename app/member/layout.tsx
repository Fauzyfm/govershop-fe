import type { Metadata } from "next";

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
    },
    title: "Member Area — Restopup",
};

export default function MemberLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
