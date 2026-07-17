import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { listAllProductsForAdmin, createProductAdmin, ProductInput } from "@/lib/admin-products";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const products = await listAllProductsForAdmin();
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const input = (await req.json()) as ProductInput;
    if (!input.name || !input.sku || !input.categoryId || !input.description) {
      return NextResponse.json(
        { error: "Name, SKU, category, and description are required." },
        { status: 400 }
      );
    }
    const product = await createProductAdmin(input);
    return NextResponse.json({ product });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
