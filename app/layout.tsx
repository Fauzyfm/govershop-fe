import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/ui/layout-wrapper";
import { JsonLd } from "@/components/seo/jsonld";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://restopup.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Restopup — Top Up Game Termurah & Instan",
    template: "%s | Restopup",
  },
  description:
    "Top up game favoritmu di Restopup — harga termurah, proses instan, dan terpercaya. Mobile Legends, Free Fire, Genshin Impact, dan 100+ game lainnya.",
  icons: {
    icon: "/Banner/favicon-restopup.png",
    shortcut: "/Banner/favicon-restopup.png",
    apple: "/Banner/favicon-restopup.png",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    siteName: "Restopup",
    title: "Restopup — Top Up Game Termurah & Instan",
    description:
      "Top up game favoritmu di Restopup — harga termurah, proses instan, dan terpercaya. 100+ game tersedia.",
    images: [
      {
        url: "/Banner/logo-restopup-v-dark.png",
        width: 1200,
        height: 630,
        alt: "Restopup — Platform Top Up Game Terpercaya",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Restopup — Top Up Game Termurah & Instan",
    description:
      "Top up game favoritmu dengan harga termurah dan proses instan di Restopup.",
    images: ["/Banner/logo-restopup-v-dark.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className={`${inter.className} min-h-screen flex flex-col antialiased relative overflow-x-hidden`}>
        <JsonLd />
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
