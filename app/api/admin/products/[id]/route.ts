import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getProductForAdmin,
  updateProductAdmin,
  setProductArchived,
  ProductInput,
} from "@/lib/admin-products";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const product = await getProductForAdmin(params.id);
  if (!product) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await req.json();

    // Toggle archive/unarchive without needing the full form payload.
    if (typeof body.archived === "boolean" && Object.keys(body).length === 1) {
      const product = await setProductArchived(params.id, body.archived);
      return NextResponse.json({ product });
    }

    const product = await updateProductAdmin(params.id, body as ProductInput);
    return NextResponse.json({ product });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// "Delete" archives rather than hard-deletes, so existing orders that
// reference this product never break.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const product = await setProductArchived(params.id, true);
  return NextResponse.json({ product });
}
