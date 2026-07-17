# Japan Pasabuy PH

A working Next.js app for Japan Pasabuy PH — homepage, catalog with instant
search/filters, product pages, cart, pay-before-checkout with proof-of-payment
upload, order tracking, and an admin payment verification dashboard. Orders
and payments write to a real Supabase (Postgres) database, and `/admin/*` is
now locked behind Clerk authentication + an admin role check.

## 1. Install

```bash
npm install
```

## 2. Connect Supabase

1. Create a project at supabase.com.
2. Dashboard → **Connect → ORM → Prisma** — copy the pooled and direct
   connection strings.
3. Dashboard → **Settings → API** — copy your Project URL and
   `service_role` key.
4. Copy `.env.example` to `.env` and fill in `DATABASE_URL`, `DIRECT_URL`,
   `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
5. Dashboard → **Storage → Create bucket** → name it `payment-proofs`,
   keep it **private**.
6. Dashboard → **Storage → Create bucket** again → name it
   `product-images` this time, and make it **public** (toggle "Public
   bucket" on) — these need to be viewable by anyone browsing the shop.

## 3. Connect Clerk (admin auth)

1. Create an application at clerk.com.
2. Dashboard → **API Keys** — copy the publishable and secret keys into
   `.env` as `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.
3. Dashboard → **Sessions → Edit** → add a custom claim so the admin role
   is available in middleware:
   ```json
   { "metadata": "{{user.public_metadata}}" }
   ```
4. Create your own account by visiting `/sign-up` once the app is running.
5. Dashboard → **Users** → click your user → **Metadata** tab → under
   **Public metadata**, set:
   ```json
   { "role": "admin" }
   ```
   Only accounts with this exact metadata can reach `/admin/payments` or
   call the admin API routes — everyone else gets redirected/blocked, both
   in `middleware.ts` and again inside the route handlers themselves.

## 4. Set up the database

```bash
npm run db:push    # creates every table from prisma/schema.prisma
npm run db:seed    # loads the product catalog from lib/data.ts into it
```

## 5. Run it

```bash
npm run dev
```

Open http://localhost:3000. Sign up, set your own account's role to
`admin` (step 3.5 above), then visit `/admin/payments` — you should get
in. Sign out (or open an incognito window) and try the same URL: you
should get redirected instead.

## What's real now

- Checkout uploads to Supabase Storage and creates real `Order` +
  `OrderItem` + `Payment` rows (still guest checkout — no customer login
  yet, see below).
- `/orders/[orderNumber]` reads the live order and its actual status.
- `/admin/payments` requires a signed-in Clerk user with
  `public_metadata.role = "admin"` — enforced in middleware AND again in
  each API route (defense in depth, since middleware-only auth has had
  real bypass vulnerabilities in Next.js history).
- **The homepage, `/shop`, and every product page now read live from the
  database** — `lib/data.ts` is only used as the initial seed source
  (`npm run db:seed`) plus static content like the trip countdown and FAQ.
  Once you edit or add a product through `/admin/products`, it shows up
  on the live site immediately.
- **`/admin/products`** — admin-only product management: create, edit,
  duplicate, and archive products, with the same price-calculator formula
  (Japan price → exchange rate → service fee → shipping fee → discount →
  final price) from the original spec computed server-side on save. A
  signed-in admin sees an "Admin" link in the header; everyone else
  doesn't.

## Managing products going forward

Go to `/admin/products` (you'll need `public_metadata.role = "admin"` —
see the Clerk setup above). From there you can:

- **Create** a new product — fill in the form, drag and drop (or choose)
  product photos to upload them directly, and the final price is
  calculated automatically as you type.
  **Edit** any field on an existing product.
  **Duplicate** — clones a product as a starting point for a similar one.
  **Archive** — soft-deletes it (hidden from the storefront, but existing
  orders referencing it still work). Archived products can be restored.

CSV import/export and the crop/filter/watermark image editor aren't built
yet — those are still on the roadmap below.

## What's still ahead

1. **Customer accounts** — checkout is still guest-only. The natural next
   step is offering "sign in to check out" so `Order.userId` gets
   populated and customers can see order history.
2. **Built-in image editor** — crop, filters, watermark, background
   removal on top of the upload that now exists.
3. **CSV import/export, bulk upload** — for adding many products at once.
4. **Notifications** — `// TODO` markers in `lib/orders.ts` mark where
   email/SMS should fire on payment approval/rejection.
5. **CMS pages**, **SEO layer**, multi-language/multi-currency, promo
   codes, loyalty — later phases per the original brief.

Tell me which one to build next.
