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

  const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
  return data.publicUrl;
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

  const { data } = supabase.storage.from("products").getPublicUrl(fileName);
  return data.publicUrl;
}
