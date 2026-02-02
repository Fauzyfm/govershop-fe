import api from "@/lib/api";
import { APIResponse, Product, PaymentMethod } from "@/types/api";
import OrderPageClient from "@/components/order/order-page-client";

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

// Helper to fetch brand images from content
async function getBrandImages(): Promise<Record<string, string>> {
    try {
        const res = await api.get<any, APIResponse<{ brand_images: Record<string, string> }>>('/content/brands');
        if (res.success && res.data) {
            return res.data.brand_images || {};
        }
        return {};
    } catch (error) {
        return {};
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

    // Fetch products, payment methods, and brand images in parallel
    const [products, paymentMethods, brandImages] = await Promise.all([
        getProducts(brand),
        getPaymentMethods(),
        getBrandImages()
    ]);

    // Lookup brand image (try exact match first, then case-insensitive)
    let brandImage = brandImages[brand];
    if (!brandImage) {
        // Try finding case-insensitive match
        const brandLower = brand.toLowerCase();
        const foundKey = Object.keys(brandImages).find(k => k.toLowerCase() === brandLower);
        if (foundKey) {
            brandImage = brandImages[foundKey];
        }
    }

    return (
        <OrderPageClient
            brand={brand}
            products={products}
            paymentMethods={paymentMethods}
            brandImage={brandImage}
        />
    );
}
