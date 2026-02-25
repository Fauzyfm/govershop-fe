/**
 * Slug utilities for clean URLs
 * Converts brand names to URL-friendly slugs and back
 */

/**
 * Convert a brand name to a URL-friendly slug
 * "MOBILE LEGENDS" → "mobile-legends"
 * "Free Fire" → "free-fire"
 * "PUBG MOBILE" → "pubg-mobile"
 * "Genshin Impact" → "genshin-impact"
 */
export function toSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // remove special chars except spaces and dashes
        .replace(/\s+/g, '-')          // spaces → dashes
        .replace(/-+/g, '-')           // collapse multiple dashes
        .replace(/^-|-$/g, '');        // trim leading/trailing dashes
}

/**
 * Find the real brand name from a slug by matching against known brand names.
 * Returns the original brand name or null if not found.
 * 
 * Also supports legacy encoded URLs (e.g. "MOBILE%20LEGENDS" decoded to "MOBILE LEGENDS")
 * for backward compatibility.
 */
export function findBrandBySlug(slug: string, brandNames: string[]): string | null {
    // First try exact slug match
    for (const name of brandNames) {
        if (toSlug(name) === slug) {
            return name;
        }
    }

    // Fallback: try direct match (for legacy URLs that used encodeURIComponent)
    const decoded = decodeURIComponent(slug);
    for (const name of brandNames) {
        if (name.toLowerCase() === decoded.toLowerCase()) {
            return name;
        }
    }

    return null;
}
