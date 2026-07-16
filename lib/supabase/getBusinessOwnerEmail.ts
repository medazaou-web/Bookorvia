import { createAdminClient } from "./admin";

/**
 * Get the business owner's email using the admin client
 * This bypasses RLS and allows us to query auth.users safely server-side
 */
export async function getBusinessOwnerEmail(businessId: string): Promise<string | null> {
  try {
    const adminClient = createAdminClient();

    // First, get the business owner's user_id
    const { data: businessData, error: bizError } = await adminClient
      .from("businesses")
      .select("user_id, name")
      .eq("id", businessId)
      .single();

    if (bizError || !businessData?.user_id) {
      console.error("Error fetching business:", bizError);
      return null;
    }

    // Then, use the admin client's auth.admin method to get user details
    try {
      const { data, error } = await adminClient.auth.admin.getUserById(businessData.user_id);
      
      if (error || !data?.user?.email) {
        console.error("Error fetching user email:", error);
        return null;
      }

      return data.user.email;
    } catch (authError) {
      console.error("Error querying auth.users:", authError);
      return null;
    }
  } catch (e) {
    console.error("Error in getBusinessOwnerEmail:", e);
    return null;
  }
}

/**
 * Get business owner email with fallback to businesses table
 * (in case email is stored there as a field)
 */
export async function getBusinessOwnerEmailWithFallback(businessId: string): Promise<string | null> {
  try {
    const adminClient = createAdminClient();

    // Try to get email from businesses table first (if stored there)
    const { data: businessData } = await adminClient
      .from("businesses")
      .select("owner_email, user_id")
      .eq("id", businessId)
      .single();

    if (businessData?.owner_email) {
      return businessData.owner_email;
    }

    // Fallback to auth.users query
    return getBusinessOwnerEmail(businessId);
  } catch (e) {
    console.error("Error in getBusinessOwnerEmailWithFallback:", e);
    return null;
  }
}
