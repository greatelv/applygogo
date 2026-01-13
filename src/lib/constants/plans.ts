export const PLAN_PRODUCTS = {
  PASS_7DAY: {
    id: "PASS_7DAY",
    name: "ApplyGoGo 7일 이용권", // DB orderName matching
    price: 9900,
    originalPrice: 19900, // Anchoring: ~50% (Half Price Strategy)
    credits: 50,
    days: 7,
  },
  PASS_30DAY: {
    id: "PASS_30DAY",
    name: "ApplyGoGo 30일 이용권", // DB orderName matching
    price: 12900,
    originalPrice: 29900, // Anchoring: ~57% (Global SaaS Value)
    credits: 300,
    days: 30,
  },
  PASS_BETA_3DAY: {
    id: "PASS_BETA_3DAY",
    name: "베타 런칭 기념 3일 무제한",
    price: 0,
    credits: 50,
    days: 3,
  },
  CREDIT_50: {
    id: "CREDIT_50", // Not a planType, but a product ID
    name: "크레딧 충전 50", // DB orderName matching
    price: 3900,
    credits: 50,
    days: 0,
  },
} as const;

export type PlanProductId = keyof typeof PLAN_PRODUCTS;

export function getProductByPrice(amount: number) {
  return Object.values(PLAN_PRODUCTS).find((p) => p.price === amount);
}
