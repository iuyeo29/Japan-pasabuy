import { createClient } from "@supabase/supabase-js";

// Server-only client using the service role key — bypasses RLS, so this
// file must never be imported into client components. It's only used
// inside app/api/* route handlers, which run on the server.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export const PAYMENT_PROOFS_BUCKET = "payment-proofs";
export const PRODUCT_IMAGES_BUCKET = "product-images";

export async function uploadPaymentProof(orderNumber: string, file: File) {
  const ext = file.name.split(".").pop() || "bin";
  const path = `${orderNumber}/${Date.now()}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error } = await supabaseAdmin.storage
    .from(PAYMENT_PROOFS_BUCKET)
    .upload(path, Buffer.from(arrayBuffer), {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  // Bucket is private, so store the path and mint signed URLs on demand
  // (see /api/admin/payments) rather than a public URL.
  return path;
}

export async function uploadProductImage(file: File) {
  const ext = file.name.split(".").pop() || "bin";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error } = await supabaseAdmin.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, Buffer.from(arrayBuffer), {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  // This bucket is public, so a direct public URL works — no need to
  // mint a signed URL every time the storefront renders a product image.
  const { data } = supabaseAdmin.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
