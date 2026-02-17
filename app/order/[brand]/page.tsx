import type { Metadata } from "next";
import api from "@/lib/api";
import { APIResponse, Product, PaymentMethod } from "@/types/api";
import OrderPageClient from "@/components/order/order-page-client";

export async function generateMetadata({ params }: OrderPageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const brand = decodeURIComponent(resolvedParams.brand);
    return {
        title: `Top Up ${brand} — Harga Termurah & Proses Instan`,
        description: `Top up ${brand} di Govershop dengan harga termurah dan proses instan. Pembayaran mudah via QRIS, transfer bank, dan lainnya. Aman dan terpercaya!`,
        openGraph: {
            title: `Top Up ${brand} | Govershop`,
            description: `Top up ${brand} murah dan cepat di Govershop. Proses otomatis, harga bersaing.`,
        },
        alternates: {
            canonical: `/order/${encodeURIComponent(brand)}`,
        },
    };
}

// Helper to fetch products for a brand
async function getProducts(brand: string) {
    try {
        const res = await api.get<any, APIResponse<{ products: Product[] }>>(`/products?brand=${encodeURIComponent(brand)}`);
        // Filter out system products like "Cek Username" and ensure brand match if API returns others
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

interface BrandDetails {
    brand_name: string;
    image_url: string;
    is_best_seller: boolean;
    status: string;
    topup_steps?: TopupStep[];
    description?: string;
}

interface BrandPublicData {
    brand_name: string;
    image_url: string;
    is_best_seller: boolean;
    status: string;
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
    const brand = decodeURIComponent(resolvedParams.brand);

    // Fetch products, payment methods, brand details, AND global brand images in parallel
    const [products, paymentMethods, brandDetails, brandImages] = await Promise.all([
        getProducts(brand),
        getPaymentMethods(),
        getBrandDetails(brand),
        getBrandImages()
    ]);

    // Determine brand image:
    // 1. Try from specific brand details
    let brandImage = brandDetails?.image_url;

    // 2. If not found, try from global brand map (fallback)
    if (!brandImage) {
        let brandData = brandImages[brand];
        if (!brandData) {
            // Case-insensitive lookup
            const brandLower = brand.toLowerCase();
            const foundKey = Object.keys(brandImages).find(k => k.toLowerCase() === brandLower);
            if (foundKey) {
                brandData = brandImages[foundKey];
            }
        }
        brandImage = brandData?.image_url || "";
    }

    // Get dynamic content
    const dynamicSteps = brandDetails?.topup_steps || [];
    const description = brandDetails?.description || "";

    return (
        <OrderPageClient
            brand={brand}
            products={products}
            paymentMethods={paymentMethods}
            brandImage={brandImage}
            dynamicSteps={dynamicSteps}
            description={description}
        />
    );
}
