import api from "@/lib/api";
import HomeContent from "@/components/home-content";
import { APIResponse, Brand, BrandPublicData, CarouselItem, PopupItem, DisplayCategoryWithBrands } from "@/types/api";

export const revalidate = 60; // Revalidate every 60 seconds (ISR)

async function getDisplayCategories(): Promise<DisplayCategoryWithBrands[]> {
  try {
    const res = await api.get<any, APIResponse<{ categories: DisplayCategoryWithBrands[] }>>('/content/display-categories');
    if (res.success && res.data) {
      return res.data.categories;
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch display categories", error);
    return [];
  }
}

async function getBrandsByNames(brandNames: string[]): Promise<Brand[]> {
  // Get all brands from the products API, then filter by the names we need
  try {
    const res = await api.get<any, APIResponse<{ brands: Brand[] }>>('/products/brands');
    if (res.success && res.data) {
      const allBrands = res.data.brands;
      // Filter to only include brands that are in the requested list, preserving order
      return brandNames.map(name => {
        const found = allBrands.find(b => b.name === name);
        return found || { name, image_url: undefined, status: 'active' } as Brand;
      });
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch brands", error);
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

async function getBrandImages(): Promise<Record<string, BrandPublicData>> {
  try {
    const res = await api.get<any, APIResponse<{ brand_images: Record<string, BrandPublicData> }>>('/content/brands');
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
  const [displayCategories, carousel, brandImages, popup] = await Promise.all([
    getDisplayCategories(),
    getCarousel(),
    getBrandImages(),
    getPopup(),
  ]);

  // Fetch brands for all display categories
  // Collect all unique brand names from display categories
  const allBrandNames = Array.from(new Set(displayCategories.flatMap(dc => dc.brands)));
  const allBrands = allBrandNames.length > 0 ? await getBrandsByNames(allBrandNames) : [];
  const brandMap = new Map(allBrands.map(b => [b.name, b]));

  // Build category data from display categories
  const categoryData: CategoryWithBrands[] = displayCategories.map(dc => ({
    category: dc.name,
    brands: dc.brands.map(name => brandMap.get(name) || { name, status: 'active' } as Brand),
  }));

  return (
    <HomeContent
      categoryData={categoryData}
      carousel={carousel}
      brandImages={brandImages}
      popup={popup}
    />
  );
}
