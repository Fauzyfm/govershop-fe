import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * On-Demand Revalidation API Route
 * 
 * POST /api/revalidate
 * Body: { paths: ["/order/mobile-legends", "/order/free-fire"], secret?: string }
 * 
 * Used by admin to instantly refresh cached pages after product updates.
 * This ensures SEO-friendly static pages stay up-to-date without waiting for ISR timer.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { paths, secret } = body;

        // Optional: validate secret for security (set REVALIDATION_SECRET in .env)
        const expectedSecret = process.env.REVALIDATION_SECRET;
        if (expectedSecret && secret !== expectedSecret) {
            return NextResponse.json(
                { success: false, message: "Invalid secret" },
                { status: 401 }
            );
        }

        if (!paths || !Array.isArray(paths) || paths.length === 0) {
            return NextResponse.json(
                { success: false, message: "paths array is required" },
                { status: 400 }
            );
        }

        // Revalidate each path
        const revalidated: string[] = [];
        for (const path of paths) {
            if (typeof path === "string" && path.startsWith("/")) {
                revalidatePath(path);
                revalidated.push(path);
            }
        }

        // Also revalidate the home page (it may show product info)
        revalidatePath("/");

        return NextResponse.json({
            success: true,
            revalidated,
            timestamp: Date.now(),
        });
    } catch (error) {
        console.error("[Revalidate] Error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to revalidate" },
            { status: 500 }
        );
    }
}
