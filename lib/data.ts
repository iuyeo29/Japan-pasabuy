// Mock data layer.
// This stands in for Prisma + PostgreSQL so the app runs end-to-end
// without a live database. Swap each function body for a `prisma.*`
// call once `DATABASE_URL` is connected — the shapes already match
// schema.prisma.

export type Availability = "AVAILABLE" | "LIMITED_STOCK" | "PREORDER" | "SOLD_OUT";

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: string;
  japaneseName: string;
  brand: string;
  category: string;
  description: string;
  ingredients?: string;
  weightGrams?: number;
  dimensions?: string;
  images: string[];
  japanPriceJPY: number;
  exchangeRate: number;
  serviceFee: number;
  shippingFee: number;
  finalPricePHP: number;
  availability: Availability;
  estimatedArrival: string;
  tags: string[];
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isLimitedEdition?: boolean;
  rating: number;
  reviewCount: number;
}

function computePHP(jpy: number, rate: number, serviceFee: number, shippingFee: number) {
  return Math.round(jpy * rate + serviceFee + shippingFee);
}

const RATE = 0.39; // JPY -> PHP, admin-editable in real system

export const products: Product[] = [
  {
    id: "p1",
    slug: "hakuhinkan-milk-cookies",
    sku: "JP-CONF-0012",
    name: "Hakuhinkan Milk Cookies (Box of 10)",
    japaneseName: "博品館 ミルククッキー",
    brand: "Hakuhinkan Toy Park",
    category: "Snacks & Sweets",
    description:
      "A Tokyo institution since 1958. Delicate, milk-forward butter cookies packed individually in a keepsake tin box. A go-to omiyage.",
    weightGrams: 220,
    dimensions: "18 x 12 x 5 cm",
    images: [
      "https://images.unsplash.com/photo-1558326567-98ae2405596b?q=80&w=1200",
      "https://images.unsplash.com/photo-1548907040-4baa419551d5?q=80&w=1200",
    ],
    japanPriceJPY: 1080,
    exchangeRate: RATE,
    serviceFee: 80,
    shippingFee: 120,
    finalPricePHP: computePHP(1080, RATE, 80, 120),
    availability: "AVAILABLE",
    estimatedArrival: "2026-09-05",
    tags: ["omiyage", "cookies", "tokyo"],
    isBestSeller: true,
    rating: 4.8,
    reviewCount: 62,
  },
  {
    id: "p2",
    slug: "hada-labo-gokujyun-lotion",
    sku: "JP-COSM-0044",
    name: "Hada Labo Gokujyun Premium Hyaluronic Lotion",
    japaneseName: "肌ラボ 極潤プレミアム化粧水",
    brand: "Rohto",
    category: "Skincare",
    description:
      "Five types of hyaluronic acid in one bottle. A staple of Japanese skincare routines, prized for deep, lasting hydration without heaviness.",
    ingredients: "Water, Glycerin, Sodium Hyaluronate, Hydrolyzed Hyaluronic Acid, ...",
    weightGrams: 180,
    dimensions: "5 x 5 x 15 cm",
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1200",
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200",
    ],
    japanPriceJPY: 1650,
    exchangeRate: RATE,
    serviceFee: 90,
    shippingFee: 120,
    finalPricePHP: computePHP(1650, RATE, 90, 120),
    availability: "LIMITED_STOCK",
    estimatedArrival: "2026-09-05",
    tags: ["skincare", "hyaluronic acid"],
    isBestSeller: true,
    rating: 4.9,
    reviewCount: 118,
  },
  {
    id: "p3",
    slug: "royce-nama-chocolate-champagne",
    sku: "JP-CONF-0031",
    name: "Royce' Nama Chocolate — Champagne",
    japaneseName: "ロイズ 生チョコレート シャンパン",
    brand: "Royce'",
    category: "Snacks & Sweets",
    description:
      "Hokkaido's most-loved melt-in-your-mouth chocolate, dusted in cocoa, with a delicate champagne aroma. Ships chilled, arrives cold.",
    weightGrams: 140,
    dimensions: "16 x 11 x 3 cm",
    images: [
      "https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=1200",
    ],
    japanPriceJPY: 950,
    exchangeRate: RATE,
    serviceFee: 80,
    shippingFee: 150,
    finalPricePHP: computePHP(950, RATE, 80, 150),
    availability: "PREORDER",
    estimatedArrival: "2026-09-05",
    tags: ["chocolate", "hokkaido", "gift"],
    isNewArrival: true,
    isLimitedEdition: true,
    rating: 5.0,
    reviewCount: 34,
  },
  {
    id: "p4",
    slug: "uniqlo-heattech-crew-neck",
    sku: "JP-APRL-0091",
    name: "UNIQLO HEATTECH Crew Neck (Japan-exclusive weight)",
    japaneseName: "ユニクロ ヒートテック クルーネック",
    brand: "UNIQLO",
    category: "Apparel",
    description:
      "The Japan-market HEATTECH is a heavier weave than the PH release. Sourced directly from a Tokyo flagship store, size run permitting.",
    weightGrams: 160,
    dimensions: "30 x 22 x 3 cm",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200",
    ],
    japanPriceJPY: 1500,
    exchangeRate: RATE,
    serviceFee: 100,
    shippingFee: 180,
    finalPricePHP: computePHP(1500, RATE, 100, 180),
    availability: "SOLD_OUT",
    estimatedArrival: "2026-09-05",
    tags: ["apparel", "uniqlo", "basics"],
    rating: 4.6,
    reviewCount: 21,
  },
  {
    id: "p5",
    slug: "muji-aroma-diffuser-ultrasonic",
    sku: "JP-HOME-0007",
    name: "MUJI Ultrasonic Aroma Diffuser",
    japaneseName: "無印良品 超音波アロマディフューザー",
    brand: "MUJI",
    category: "Home & Living",
    description:
      "MUJI's quietly iconic diffuser — a soft mist, a soft light, and none of the visual noise. Comes with the essential oil starter set.",
    weightGrams: 640,
    dimensions: "12 x 12 x 15 cm",
    images: [
      "https://images.unsplash.com/photo-1602928321679-560bb453f190?q=80&w=1200",
    ],
    japanPriceJPY: 4200,
    exchangeRate: RATE,
    serviceFee: 150,
    shippingFee: 220,
    finalPricePHP: computePHP(4200, RATE, 150, 220),
    availability: "AVAILABLE",
    estimatedArrival: "2026-09-05",
    tags: ["muji", "home", "aroma"],
    isNewArrival: true,
    rating: 4.7,
    reviewCount: 45,
  },
  {
    id: "p6",
    slug: "tokyo-banana-original",
    sku: "JP-CONF-0002",
    name: "Tokyo Banana Original Cream Cake (8pc)",
    japaneseName: "東京ばな奈 ゴーフレット",
    brand: "Tokyo Banana",
    category: "Snacks & Sweets",
    description:
      "The definitive Tokyo Station souvenir. Banana-cream-filled castella sponge — soft, sweet, and instantly recognizable.",
    weightGrams: 300,
    dimensions: "24 x 16 x 6 cm",
    images: [
      "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?q=80&w=1200",
    ],
    japanPriceJPY: 1296,
    exchangeRate: RATE,
    serviceFee: 80,
    shippingFee: 130,
    finalPricePHP: computePHP(1296, RATE, 80, 130),
    availability: "AVAILABLE",
    estimatedArrival: "2026-09-05",
    tags: ["omiyage", "tokyo", "banana"],
    isBestSeller: true,
    rating: 4.9,
    reviewCount: 201,
  },
];

export const categories = [
  "Snacks & Sweets",
  "Skincare",
  "Apparel",
  "Home & Living",
];

export const upcomingTrip = {
  name: "September 2026 Tokyo & Osaka Trip",
  shoppingDeadline: "2026-08-20T23:59:00+08:00",
  departureDate: "2026-08-28",
  arrivalDate: "2026-09-02",
  estimatedDelivery: "2026-09-05",
  slotsRemaining: 37,
  maxOrders: 150,
};

export const orderStatuses = [
  "ORDER_SUBMITTED",
  "PENDING_PAYMENT_VERIFICATION",
  "PAYMENT_VERIFIED",
  "WAITING_FOR_JAPAN_TRIP",
  "PURCHASED_IN_JAPAN",
  "PACKED",
  "SHIPPED",
  "IN_TRANSIT",
  "ARRIVED_IN_PHILIPPINES",
  "READY_FOR_PICKUP",
  "DELIVERED",
  "COMPLETED",
] as const;

export const statusLabels: Record<string, string> = {
  ORDER_SUBMITTED: "Order Submitted",
  PENDING_PAYMENT_VERIFICATION: "Pending Payment Verification",
  PAYMENT_VERIFIED: "Payment Verified",
  PAYMENT_REJECTED: "Payment Rejected",
  WAITING_FOR_JAPAN_TRIP: "Waiting for Japan Trip",
  PURCHASED_IN_JAPAN: "Purchased in Japan",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  IN_TRANSIT: "In Transit",
  ARRIVED_IN_PHILIPPINES: "Arrived in Philippines",
  READY_FOR_PICKUP: "Ready for Pickup",
  DELIVERED: "Delivered",
  COMPLETED: "Completed",
};

export const faqs = [
  {
    q: "How does pasabuy reservation work?",
    a: "You reserve and pay for items before the buying trip. Once payment is verified, your items are purchased in Japan on the scheduled trip and shipped back to the Philippines.",
  },
  {
    q: "What happens if an item sells out in Japan?",
    a: "If an item can't be sourced, you're notified immediately and refunded or offered a substitute — your choice.",
  },
  {
    q: "How long does delivery take after the trip?",
    a: "Typically 5–10 days after arrival in the Philippines, depending on customs processing and your location.",
  },
  {
    q: "What payment methods are accepted?",
    a: "GCash, Maya, and direct bank transfer. You'll upload proof of payment for verification before your order is confirmed.",
  },
];

export const mockPaymentQueue = [
  {
    id: "pay_1",
    orderNumber: "JP-2026-00042",
    customer: "Maria Santos",
    method: "GCash",
    referenceNumber: "0923847561",
    amountPaid: 3420,
    orderTotal: 3420,
    paidAt: "2026-07-14T10:22:00+08:00",
    proofUrl:
      "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?q=80&w=800",
    status: "SUBMITTED" as const,
  },
  {
    id: "pay_2",
    orderNumber: "JP-2026-00043",
    customer: "Jerome Villanueva",
    method: "Bank Transfer",
    referenceNumber: "BPI-88291022",
    amountPaid: 5100,
    orderTotal: 5350,
    paidAt: "2026-07-15T18:05:00+08:00",
    proofUrl:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=800",
    status: "SUBMITTED" as const,
  },
  {
    id: "pay_3",
    orderNumber: "JP-2026-00044",
    customer: "Angela Reyes",
    method: "Maya",
    referenceNumber: "MY-77213890",
    amountPaid: 1980,
    orderTotal: 1980,
    paidAt: "2026-07-16T08:40:00+08:00",
    proofUrl:
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=800",
    status: "SUBMITTED" as const,
  },
];

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getRelatedProducts(product: Product) {
  return products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);
}
