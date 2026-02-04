/**
 * Game Input Configuration
 * 
 * Konfigurasi berbasis data untuk menentukan format input per game.
 * Mudah ditambahkan game baru tanpa perlu edit komponen order-form.
 */

export interface GameInputConfig {
  brand: string;                // Nama brand (uppercase untuk matching)
  hasZoneId: boolean;           // Apakah memerlukan Zone ID/Server ID
  zoneIdLabel?: string;         // Label untuk Zone ID (default: "Zone ID")
  zoneIdPlaceholder?: string;   // Placeholder input Zone ID
  userIdLabel?: string;         // Label untuk User ID (default: "User ID")
  userIdPlaceholder?: string;   // Placeholder input User ID
}

/**
 * Daftar game dengan konfigurasi input khusus.
 * Tambahkan game baru di sini tanpa perlu edit komponen.
 */
const GAME_CONFIGS: GameInputConfig[] = [
  {
    brand: "MOBILE LEGENDS",
    hasZoneId: true,
    zoneIdLabel: "Zone ID",
    zoneIdPlaceholder: "1234",
    userIdLabel: "User ID",
    userIdPlaceholder: "Masukkan User ID"
  },
  // Contoh untuk game lain yang memerlukan Zone ID:
  // {
  //   brand: "GENSHIN IMPACT",
  //   hasZoneId: true,
  //   zoneIdLabel: "Server",
  //   zoneIdPlaceholder: "Asia",
  //   userIdLabel: "UID",
  //   userIdPlaceholder: "Masukkan UID"
  // },
  // {
  //   brand: "HONKAI STAR RAIL",
  //   hasZoneId: true,
  //   zoneIdLabel: "Server",
  //   zoneIdPlaceholder: "Asia",
  //   userIdLabel: "UID",
  //   userIdPlaceholder: "Masukkan UID"
  // },
];

/**
 * Default config untuk game tanpa konfigurasi khusus.
 * Hanya memerlukan User ID saja.
 */
const DEFAULT_CONFIG: GameInputConfig = {
  brand: "DEFAULT",
  hasZoneId: false,
  userIdLabel: "User ID",
  userIdPlaceholder: "Masukkan User ID"
};

/**
 * Mendapatkan konfigurasi input untuk game tertentu.
 * @param brand - Nama brand game
 * @returns GameInputConfig untuk game tersebut atau default config
 */
export function getGameConfig(brand: string): GameInputConfig {
  const normalizedBrand = brand.toUpperCase().trim();
  const config = GAME_CONFIGS.find(c => c.brand === normalizedBrand);
  return config ?? { ...DEFAULT_CONFIG, brand: normalizedBrand };
}

/**
 * Sanitize User ID - hapus spasi di awal, akhir, dan di tengah.
 * Untuk game yang ID-nya hanya berisi angka.
 * @param value - Raw input dari user
 * @returns Sanitized User ID
 */
export function sanitizeUserId(value: string): string {
  // Hapus semua spasi (di awal, akhir, dan tengah)
  return value.replace(/\s/g, '').trim();
}

/**
 * Sanitize Zone ID - hapus kurung, spasi, dan karakter non-angka lainnya.
 * User sering copy-paste format seperti "(1234)" dari game.
 * @param value - Raw input dari user (mungkin berisi kurung)
 * @returns Sanitized Zone ID (hanya angka)
 */
export function sanitizeZoneId(value: string): string {
  // Hapus kurung biasa, kurung fullwidth, dan spasi
  // Hanya sisakan angka
  return value.replace(/[()（）\s\-]/g, '').trim();
}

/**
 * Gabungkan dan sanitize User ID + Zone ID menjadi Customer No.
 * @param brand - Nama brand game
 * @param userId - Raw User ID input
 * @param zoneId - Raw Zone ID input (optional)
 * @returns Sanitized, combined Customer No
 */
export function buildCustomerNo(brand: string, userId: string, zoneId?: string): string {
  const config = getGameConfig(brand);
  const cleanUserId = sanitizeUserId(userId);
  
  if (config.hasZoneId && zoneId) {
    const cleanZoneId = sanitizeZoneId(zoneId);
    return `${cleanUserId}${cleanZoneId}`;
  }
  
  return cleanUserId;
}
