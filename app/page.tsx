import api from "@/lib/api";
import HomeContent from "@/components/home-content";
import { APIResponse, Brand } from "@/types/api";

export const revalidate = 60; // Revalidate every 60 seconds (ISR)

// Types for content API
interface CarouselItem {
  id: number;
  image_url: string;
  title?: string;
  link_url?: string;
}

interface PopupItem {
  id: number;
  image_url: string;
  title?: string;
  description?: string;
  link_url?: string;
}

async function getCategories(): Promise<string[]> {
  try {
    const res = await api.get<any, APIResponse<{ categories: string[] }>>('/products/categories');
    if (res.success && res.data) {
      return res.data.categories;
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch categories", error);
    return [];
  }
}

async function getBrandsByCategory(category: string): Promise<Brand[]> {
  try {
    const res = await api.get<any, APIResponse<{ brands: Brand[] }>>(`/products/brands?category=${encodeURIComponent(category)}`);
    if (res.success && res.data) {
      return res.data.brands;
    }
    return [];
  } catch (error) {
    console.error(`Failed to fetch brands for ${category}`, error);
    return [];
  }
}

async function getCarousel(): Promise<CarouselItem[]> {
  try {
    const res = await api.get<any, APIResponse<{ carousel: CarouselItem[] }>>('/content/carousel');
    if (res.success && res.data) {
      return res.data.carousel || [];
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch carousel", error);
    return [];
  }
}

async function getBrandImages(): Promise<Record<string, string>> {
  try {
    const res = await api.get<any, APIResponse<{ brand_images: Record<string, string> }>>('/content/brands');
    if (res.success && res.data) {
      return res.data.brand_images || {};
    }
    return {};
  } catch (error) {
    console.error("Failed to fetch brand images", error);
    return {};
  }
}

async function getPopup(): Promise<PopupItem | null> {
  try {
    const res = await api.get<any, APIResponse<{ popup: PopupItem | null }>>('/content/popup');
    if (res.success && res.data) {
      return res.data.popup;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch popup", error);
    return null;
  }
}

export interface CategoryWithBrands {
  category: string;
  brands: Brand[];
}

export default async function Home() {
  // Fetch all data in parallel
  const [categories, carousel, brandImages, popup] = await Promise.all([
    getCategories(),
    getCarousel(),
    getBrandImages(),
    getPopup(),
  ]);

  // Fetch brands for each category in parallel
  const categoryData: CategoryWithBrands[] = await Promise.all(
    categories.map(async (category) => ({
      category,
      brands: await getBrandsByCategory(category),
    }))
  );

  // Filter out empty categories
  const nonEmptyCategories = categoryData.filter(c => c.brands.length > 0);

  return (
    <HomeContent
      categoryData={nonEmptyCategories}
      carousel={carousel}
      brandImages={brandImages}
      popup={popup}
    />
  );
}
