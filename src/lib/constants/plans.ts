export const PLAN_PRODUCTS = {
  PASS_1DAY: {
    id: "PASS_1DAY",
    name: "ApplyGoGo 1일 이용권 (벼락치기 패스)", // DB orderName matching
    price: 3900,
    priceGlobal: 3, // USD
    originalPrice: 8900, // Anchoring: ~56%
    originalPriceGlobal: 8, // USD
    credits: 50,
    days: 1,
  },
  PASS_7DAY: {
    id: "PASS_7DAY",
    name: "ApplyGoGo 7일 이용권", // DB orderName matching
    price: 5900,
    priceGlobal: 6, // USD
    originalPrice: 19900, // Anchoring: ~70%
    originalPriceGlobal: 18, // USD
    credits: 100,
    days: 7,
  },
  PASS_30DAY: {
    id: "PASS_30DAY",
    name: "ApplyGoGo 30일 이용권", // DB orderName matching
    price: 9900,
    priceGlobal: 10, // USD
    originalPrice: 29900, // Anchoring: ~66% (Global SaaS Value)
    originalPriceGlobal: 28, // USD
    credits: 300,
    days: 30,
  },
  PASS_BETA_3DAY: {
    id: "PASS_BETA_3DAY",
    name: "베타 런칭 기념 3일 무제한",
    price: 0,
    priceGlobal: 0,
    credits: 50,
    days: 3,
  },
  CREDIT_50: {
    id: "CREDIT_50", // Not a planType, but a product ID
    name: "크레딧 충전 50", // DB orderName matching
    price: 3900,
    priceGlobal: 4,
    credits: 50,
    days: 0,
  },
} as const;

export type PlanProductId = keyof typeof PLAN_PRODUCTS;

export function getProductByPrice(amount: number) {
  return Object.values(PLAN_PRODUCTS).find(
    (p) => p.price === amount || (p as any).priceGlobal === amount,
  );
}
