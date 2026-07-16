import { NextRequest, NextResponse } from "next/server";
import { getBusinessOwnerEmail } from "@/lib/supabase/getBusinessOwnerEmail";
import { getAuthenticatedUserOrThrow, verifyBusinessOwnership, unauthorizedResponse } from "@/lib/security/auth";

export async function GET(req: NextRequest) {
  try {
    // SECURITY: Verify user is authenticated
    let user;
    try {
      user = await getAuthenticatedUserOrThrow(req);
    } catch {
      return unauthorizedResponse('User not authenticated');
    }

    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get("businessId");

    if (!businessId) {
      return NextResponse.json(
        { error: "businessId is required" },
        { status: 400 }
      );
    }

    // SECURITY: Verify user owns the business
    const ownsBusinessLocation = await verifyBusinessOwnership(businessId, user.id);
    if (!ownsBusinessLocation) {
      return unauthorizedResponse('You do not own this business');
    }

    const email = await getBusinessOwnerEmail(businessId);

    if (!email) {
      return NextResponse.json(
        { error: "Could not retrieve business owner email" },
        { status: 404 }
      );
    }

    return NextResponse.json({ email });
  } catch (error: any) {
    console.error("Error in get-business-owner-email:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
