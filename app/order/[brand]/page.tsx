import api from "@/lib/api";
import { APIResponse, Product, PaymentMethod } from "@/types/api";
import OrderForm from "@/components/order/order-form";

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

interface OrderPageProps {
    params: Promise<{
        brand: string;
    }>;
}

export default async function OrderPage({ params }: OrderPageProps) {
    const resolvedParams = await params;
    const brand = decodeURIComponent(resolvedParams.brand);
    const [products, paymentMethods] = await Promise.all([
        getProducts(brand),
        getPaymentMethods()
    ]);

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-6 glass p-6 rounded-2xl">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center text-3xl font-bold shadow-2xl shadow-primary/20">
                    {brand.substring(0, 2).toUpperCase()}
                </div>
                <div>
                    <h1 className="text-3xl font-bold">{brand}</h1>
                    <p className="text-muted-foreground">Top Up {brand} Termurah & Terpercaya</p>
                </div>
            </div>

            {/* Main Order Form */}
            <OrderForm
                brand={brand}
                initialProducts={products}
                paymentMethods={paymentMethods}
            />
        </div>
    );
}
