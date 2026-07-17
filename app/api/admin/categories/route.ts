import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { listCategoriesAdmin } from "@/lib/admin-products";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const categories = await listCategoriesAdmin();
  return NextResponse.json({ categories });
}
