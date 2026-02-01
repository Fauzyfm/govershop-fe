import api from "@/lib/api";
import HomeContent from "@/components/home-content";
import { APIResponse, Brand } from "@/types/api";

async function getBrands() {
  try {
    const res = await api.get<any, APIResponse<{ brands: Brand[] }>>('/products/brands?category=Games');
    if (res.success && res.data) {
      return res.data.brands;
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch brands", error);
    return [];
  }
}

export default async function Home() {
  const brands = await getBrands();

  // Fallback data
  const displayBrands: Brand[] = brands.length > 0 ? brands : [
    { name: "MOBILE LEGENDS" },
    { name: "FREE FIRE" },
    { name: "PUBG MOBILE" },
    { name: "VALORANT" },
    { name: "GENSHIN IMPACT" },
    { name: "HONKAI STAR RAIL" }
  ];

  return <HomeContent brands={displayBrands} />;
}
