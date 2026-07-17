import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import ProductForm from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  if (!userId || role !== "admin") redirect("/");

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="eyebrow text-stamp">Admin</div>
      <h1 className="mt-1 font-display text-3xl italic">New Product</h1>
      <div className="mt-8">
        <ProductForm mode="create" />
      </div>
    </div>
  );
}
