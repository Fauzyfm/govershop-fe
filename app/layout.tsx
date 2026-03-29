import type { Metadata } from "next";
import { Inter, Space_Grotesk, IBM_Plex_Mono, Kodchasan } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/ui/layout-wrapper";
import { JsonLd } from "@/components/seo/jsonld";
import { MetaPixel } from "@/components/meta-pixel";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

const kodchasan = Kodchasan({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: '--font-kodchasan',
  display: 'swap',
});

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
    <html lang="id" className={`dark ${inter.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable} ${kodchasan.variable}`}>
      <body className="min-h-screen flex flex-col antialiased relative overflow-x-hidden">
        <JsonLd />
        <MetaPixel />
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
