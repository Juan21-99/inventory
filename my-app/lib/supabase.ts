import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Upload avatar - uses user ID and timestamp for unique filename to avoid caching
export async function uploadAvatar(
  file: File,
  userId: string,
): Promise<string | null> {
  const fileExt = file.name.split(".").pop();
  // Create unique filename: userId-timestamp.ext
  const fileName = `${userId}-${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Error uploading avatar:", error);
    return null;
  }

  // Construct public URL manually
  return `${supabaseUrl}/storage/v1/object/public/avatars/${fileName}`;
}

// Upload Product Image
export async function uploadProductImage(file: File): Promise<string | null> {
  const fileExt = file.name.split(".").pop();
  const fileName = `product-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error } = await supabase.storage
    .from("products")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Error uploading product image:", error);
    return null;
  }

  return `${supabaseUrl}/storage/v1/object/public/products/${fileName}`;
}

// Upload Promo Image
export async function uploadPromoImage(file: File): Promise<string | null> {
  const fileExt = file.name.split(".").pop();
  const fileName = `promo-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error } = await supabase.storage
    .from("promos")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Error uploading promo image:", error);
    return null;
  }

  return `${supabaseUrl}/storage/v1/object/public/promos/${fileName}`;
}

// Helper to extract userId from existing avatar URL (optional usage)
export function getAvatarUrl(): string {
  // This is legacy/fallback now, real URL comes from Firestore
  return "";
}
