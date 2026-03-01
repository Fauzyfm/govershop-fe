import type { Metadata } from "next";
import { notFound } from "next/navigation";
import api from "@/lib/api";
import { toSlug, findBrandBySlug } from "@/lib/slug";
import { APIResponse, Product, PaymentMethod } from "@/types/api";
import OrderPageClient from "@/components/order/order-page-client";

interface BrandPublicData {
    brand_name: string;
    image_url: string;
    is_best_seller: boolean;
    status: string;
}

// Fetch all brand names for slug resolution (from both content settings AND product data)
async function getAllBrandNames(): Promise<string[]> {
    try {
        const [contentRes, productsRes] = await Promise.all([
            api.get<any, APIResponse<{ brand_images: Record<string, BrandPublicData> }>>('/content/brands').catch(() => null),
            api.get<any, APIResponse<{ brands: { name: string }[] }>>('/products/brands').catch(() => null),
        ]);

        const names = new Set<string>();

        // From content/brand settings
        if (contentRes?.success && contentRes.data?.brand_images) {
            Object.keys(contentRes.data.brand_images).forEach(name => names.add(name));
        }

        // From Digiflazz products
        if (productsRes?.success && productsRes.data?.brands) {
            productsRes.data.brands.forEach((b: { name: string }) => names.add(b.name));
        }

        return Array.from(names);
    } catch {
        return [];
    }
}

// Resolve slug param to real brand name
async function resolveBrand(slugParam: string): Promise<string | null> {
    const brandNames = await getAllBrandNames();
    return findBrandBySlug(slugParam, brandNames);
}

export async function generateMetadata({ params }: OrderPageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const brand = await resolveBrand(resolvedParams.brand) || decodeURIComponent(resolvedParams.brand);
    return {
        title: `Top Up ${brand} — Harga Termurah & Proses Instan`,
        description: `Top up ${brand} di Restopup dengan harga termurah dan proses instan. Pembayaran mudah via QRIS, transfer bank, dan lainnya. Aman dan terpercaya!`,
        openGraph: {
            title: `Top Up ${brand} | Restopup`,
            description: `Top up ${brand} murah dan cepat di Restopup. Proses otomatis, harga bersaing.`,
        },
        alternates: {
            canonical: `/order/${toSlug(brand)}`,
        },
    };
}

// Helper to fetch products for a brand
async function getProducts(brand: string) {
    try {
        const res = await api.get<any, APIResponse<{ products: Product[] }>>(`/products?brand=${encodeURIComponent(brand)}`);
        const allProducts = res.data?.products || [];
        return allProducts.filter(p =>
            p.brand.toLowerCase() === brand.toLowerCase() &&
            !p.product_name.toLowerCase().includes("cek username")
        );
    } catch (error) {
        return [];
    }
}

// Helper to fetch payment methods
async function getPaymentMethods() {
    try {
        const res = await api.get<any, APIResponse<{ payment_methods: PaymentMethod[] }>>('/payment-methods');
        return res.data?.payment_methods || [];
    } catch (error) {
        return [];
    }
}

interface TopupStep {
    step: number;
    title: string;
    desc: string;
}

interface BrandPopup {
    id: number;
    image_url: string;
    title?: string;
    description?: string;
    link_url?: string;
}

interface BrandDetails {
    brand_name: string;
    image_url: string;
    is_best_seller: boolean;
    status: string;
    topup_steps?: TopupStep[];
    description?: string;
    popup?: BrandPopup | null;
}

async function getBrandImages(): Promise<Record<string, BrandPublicData>> {
    try {
        const res = await api.get<any, APIResponse<{ brand_images: Record<string, BrandPublicData> }>>('/content/brands');
        if (res.success && res.data) {
            return res.data.brand_images || {};
        }
        return {};
    } catch (error) {
        return {};
    }
}

async function getBrandDetails(brand: string): Promise<BrandDetails | null> {
    try {
        const res = await api.get<any, APIResponse<BrandDetails>>(`/brands/${encodeURIComponent(brand)}`);
        if (res.success && res.data) {
            return res.data;
        }
        return null;
    } catch (error) {
        return null;
    }
}

interface OrderPageProps {
    params: Promise<{
        brand: string;
    }>;
}

export default async function OrderPage({ params }: OrderPageProps) {
    const resolvedParams = await params;

    // Resolve slug to real brand name
    const brand = await resolveBrand(resolvedParams.brand);

    if (!brand) {
        notFound();
    }

    // Fetch products, payment methods, brand details, AND global brand images in parallel
    const [products, paymentMethods, brandDetails, brandImages] = await Promise.all([
        getProducts(brand),
        getPaymentMethods(),
        getBrandDetails(brand),
        getBrandImages()
    ]);

    // Determine brand image
    let brandImage = brandDetails?.image_url;

    if (!brandImage) {
        let brandData = brandImages[brand];
        if (!brandData) {
            const brandLower = brand.toLowerCase();
            const foundKey = Object.keys(brandImages).find(k => k.toLowerCase() === brandLower);
            if (foundKey) {
                brandData = brandImages[foundKey];
            }
        }
        brandImage = brandData?.image_url || "";
    }

    const dynamicSteps = brandDetails?.topup_steps || [];
    const description = brandDetails?.description || "";
    const brandPopup = brandDetails?.popup || null;

    return (
        <OrderPageClient
            brand={brand}
            products={products}
            paymentMethods={paymentMethods}
            brandImage={brandImage}
            dynamicSteps={dynamicSteps}
            description={description}
            brandPopup={brandPopup}
        />
    );
}
