/**
 * Game Input Configuration
 * 
 * Konfigurasi untuk menentukan format input per game.
 * Sekarang support 2 mode:
 * 1. Dynamic dari API (input_fields dari brand_settings) — prioritas utama
 * 2. Fallback hardcoded — jika API belum punya data
 */

export interface InputFieldConfig {
  key: string;           // Unique identifier (e.g. "user_id", "zone_id", "server")
  type: string;          // "text" | "select"
  label: string;         // Display label
  placeholder: string;   // Input placeholder
  required: boolean;     // Whether field is mandatory
  options?: string[];    // Options for "select" type
}

export interface GameInputConfig {
  brand: string;                // Nama brand (uppercase untuk matching)
  hasZoneId: boolean;           // Apakah memerlukan Zone ID/Server ID
  zoneIdLabel?: string;         // Label untuk Zone ID (default: "Zone ID")
  zoneIdPlaceholder?: string;   // Placeholder input Zone ID
  userIdLabel?: string;         // Label untuk User ID (default: "User ID")
  userIdPlaceholder?: string;   // Placeholder input User ID
  
  // Server List Dropdown
  hasServerList?: boolean;      // Apakah menggunakan dropdown server
  serverLabel?: string;         // Label untuk dropdown server
  serverList?: string[];        // List opsi server

  // Dynamic fields from API
  dynamicFields?: InputFieldConfig[];  // Additional custom fields from admin
  inputSeparator?: string;             // Separator for combining fields ("|", "#", " ", etc.)
}

/**
 * Daftar game dengan konfigurasi input khusus (FALLBACK only).
 * Akan digunakan jika brand belum punya input_fields di database.
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
  {
    brand: "GENSHIN IMPACT",
    hasZoneId: false,
    userIdLabel: "UID",
    userIdPlaceholder: "Masukkan UID",
    hasServerList: true,
    serverLabel: "Server",
    serverList: ["Asia", "America", "Europe", "TW, HK, MO"]
  }
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
 * Build GameInputConfig dari data API (input_fields dari brand_settings).
 * Jika input_fields tersedia dan tidak kosong, gunakan data API.
 * Jika tidak, fallback ke hardcoded config.
 */
export function buildGameConfigFromAPI(
  brand: string,
  inputFields?: InputFieldConfig[],
  inputSeparator?: string
): GameInputConfig {
  // Jika tidak ada input_fields dari API, fallback ke hardcoded
  if (!inputFields || inputFields.length === 0) {
    return getGameConfig(brand);
  }

  const baseConfig = getGameConfig(brand);

  const config: GameInputConfig = {
    brand: brand.toUpperCase().trim(),
    hasZoneId: false,
    hasServerList: false,
    userIdLabel: baseConfig.userIdLabel || "User ID",
    userIdPlaceholder: baseConfig.userIdPlaceholder || "Masukkan User ID",
    inputSeparator: inputSeparator || "",
    dynamicFields: inputFields,
  };

  return config;
}

/**
 * Mendapatkan konfigurasi input untuk game tertentu (fallback hardcoded).
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
 * Gabungkan dan sanitize semua input fields menjadi Customer No.
 * Support both legacy format dan dynamic fields dari API.
 * 
 * @param brand - Nama brand game
 * @param userId - Raw User ID input (primary field)
 * @param zoneId - Raw Zone ID input (legacy Mobile Legends)
 * @param server - Selected Server (legacy Genshin)
 * @param dynamicValues - Key-value map of dynamic field values
 * @param inputSeparator - Separator from API config
 * @returns Sanitized, combined Customer No
 */
export function buildCustomerNo(
  brand: string,
  userId: string,
  zoneId?: string,
  server?: string,
  dynamicValues?: Record<string, string>,
  inputSeparator?: string
): string {
  const config = getGameConfig(brand);
  const cleanUserId = sanitizeUserId(userId);

  // Legacy mode: Use hardcoded config (Mobile Legends Zone ID)
  if (config.hasZoneId && zoneId && (!dynamicValues || Object.keys(dynamicValues).length === 0)) {
    const cleanZoneId = sanitizeZoneId(zoneId);
    return `${cleanUserId}${cleanZoneId}`;
  }

  // Legacy mode: Use hardcoded config (Genshin server list)
  if (config.hasServerList && server && (!dynamicValues || Object.keys(dynamicValues).length === 0)) {
    return `${cleanUserId}|${server}`;
  }

  // Dynamic mode: Use dynamic fields with separator
  if (dynamicValues && Object.keys(dynamicValues).length > 0) {
    const separator = inputSeparator || "";
    const parts = [cleanUserId];
    
    // Add dynamic field values in order
    Object.values(dynamicValues).forEach(val => {
      if (val) {
        parts.push(val.trim());
      }
    });

    return parts.join(separator);
  }

  return cleanUserId;
}
