"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * AffiliateTracker - Client component that captures the `ref` parameter from URL
 * and stores it in localStorage for later use during checkout.
 * 
 * Usage: Place this component in the root layout or any page where affiliate
 * links might land (e.g., homepage).
 * 
 * Flow:
 * 1. Streamer shares link: https://restopup.com/?ref=WINDAH
 * 2. Customer clicks link → this component captures "WINDAH"
 * 3. Stored in localStorage as `affiliate_ref`
 * 4. When customer checks out, order-form reads localStorage and sends to backend
 */
function AffiliateTrackerInner() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const ref = searchParams.get("ref");
        if (ref && ref.trim() !== "") {
            const code = ref.trim().toUpperCase();

            // Store affiliate ref code and timestamp
            localStorage.setItem("affiliate_ref", code);
            localStorage.setItem("affiliate_ref_channel", "link");
            localStorage.setItem("affiliate_ref_time", Date.now().toString());

            console.log(`[Affiliate] Ref code captured: ${code}`);
        }
    }, [searchParams]);

    return null;
}

export default function AffiliateTracker() {
    return (
        <Suspense fallback={null}>
            <AffiliateTrackerInner />
        </Suspense>
    );
}

/**
 * Helper functions to get/clear affiliate ref from localStorage
 */
export function getAffiliateRef(): { code: string; channel: string } | null {
    if (typeof window === "undefined") return null;

    const code = localStorage.getItem("affiliate_ref");
    const channel = localStorage.getItem("affiliate_ref_channel") || "link";
    const timeStr = localStorage.getItem("affiliate_ref_time");

    if (!code) return null;

    // Expire after 30 days (2592000000 ms)
    if (timeStr) {
        const elapsed = Date.now() - parseInt(timeStr, 10);
        if (elapsed > 30 * 24 * 60 * 60 * 1000) {
            clearAffiliateRef();
            return null;
        }
    }

    return { code, channel };
}

export function clearAffiliateRef() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("affiliate_ref");
    localStorage.removeItem("affiliate_ref_channel");
    localStorage.removeItem("affiliate_ref_time");
}
