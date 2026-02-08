import { Product } from "@/types/api";
import { cn } from "@/lib/utils";

interface ProductGridProps {
    products: Product[];
    selectedSku: string | null;
    onSelect: (sku: string) => void;
}

export default function ProductGrid({ products, selectedSku, onSelect }: ProductGridProps) {
    // Sorting is handled by parent (OrderForm)

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.map((product) => {
                const displayName = product.display_name || product.product_name;
                const hasCustomImage = !!product.image_url;

                return (
                    <button
                        key={product.buyer_sku_code}
                        onClick={() => onSelect(product.buyer_sku_code)}
                        className={cn(
                            "relative p-4 rounded-xl text-left transition-all border group",
                            selectedSku === product.buyer_sku_code
                                ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(16,185,129,0.15)] scale-[1.02]"
                                : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10"
                        )}
                    >
                        {/* Best Seller Badge */}
                        {product.is_best_seller && (
                            <div className="absolute -top-3 -left-3 z-10">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                                </span>
                                <div className="absolute top-0 left-0 bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-br-lg rounded-tl-lg shadow-lg translate-y-[2px] translate-x-[2px]">
                                    BEST SELLER
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            {/* Product Image - Only if custom image exists */}
                            {hasCustomImage && (
                                <div className="flex justify-center mb-2">
                                    <img
                                        src={product.image_url}
                                        alt={displayName}
                                        className="w-16 h-16 object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                            )}

                            {/* Product Name */}
                            <span className="font-semibold text-sm md:text-sm text-center leading-tight min-h-[40px] flex items-center justify-center">
                                {displayName}
                            </span>

                            {/* Price */}
                            <div className="flex flex-col items-center">
                                {product.is_promo && product.original_price && (
                                    <span className="text-xs text-muted-foreground line-through">
                                        Rp {Math.ceil(product.original_price).toLocaleString("id-ID")}
                                    </span>
                                )}
                                <span className={cn(
                                    "text-base font-bold",
                                    selectedSku === product.buyer_sku_code ? "text-primary" : "text-white"
                                )}>
                                    Rp {Math.ceil(product.price).toLocaleString("id-ID")}
                                </span>
                            </div>

                            {/* Tags */}
                            {product.tags && product.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 justify-center mt-1">
                                    {product.tags.map(tag => (
                                        <span key={tag} className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-white/70 uppercase">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedSku === product.buyer_sku_code && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-lg animate-in zoom-in duration-200">
                                <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
