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

// Extract storage relative file path from public URL or file name
export function extractStoragePath(urlOrPath: string, bucket: string): string | null {
  if (!urlOrPath) return null;
  const trimmed = urlOrPath.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return trimmed;
  }

  const marker = `/${bucket}/`;
  const index = trimmed.indexOf(marker);
  if (index !== -1) {
    const relativePath = trimmed.substring(index + marker.length);
    return decodeURIComponent(relativePath.split("?")[0]);
  }

  const lastSegment = trimmed.split("/").pop()?.split("?")[0];
  return lastSegment ? decodeURIComponent(lastSegment) : null;
}

// Delete file from Supabase Storage
export async function deleteStorageFile(
  urlOrPath: string | null | undefined,
  bucket: string = "products"
): Promise<boolean> {
  if (!urlOrPath) return false;

  const filePath = extractStoragePath(urlOrPath, bucket);
  if (!filePath) return false;

  try {
    const { error } = await supabase.storage.from(bucket).remove([filePath]);
    if (error) {
      console.warn(`Notice deleting file from Supabase storage [${bucket}/${filePath}]:`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(`Exception deleting file from Supabase storage [${bucket}/${filePath}]:`, err);
    return false;
  }
}
