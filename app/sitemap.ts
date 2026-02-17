import type { MetadataRoute } from "next";
import api from "@/lib/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://govershop.com";

interface BrandPublicData {
  brand_name: string;
  image_url: string;
  is_best_seller: boolean;
  is_visible: boolean;
  status: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/track`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Dynamic brand/order pages
  let brandPages: MetadataRoute.Sitemap = [];
  try {
    const res = await api.get<
      any,
      { success: boolean; data?: { brand_images: Record<string, BrandPublicData> } }
    >("/content/brands");

    if (res.success && res.data?.brand_images) {
      brandPages = Object.entries(res.data.brand_images)
        .filter(([, brand]) => brand.is_visible !== false && brand.status === "active")
        .map(([name]) => ({
          url: `${SITE_URL}/order/${encodeURIComponent(name)}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }));
    }
  } catch (error) {
    console.error("Failed to generate brand sitemap entries", error);
  }

  return [...staticPages, ...brandPages];
}
