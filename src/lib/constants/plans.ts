export const PLAN_PRODUCTS = {
  PASS_7DAY: {
    id: "PASS_7DAY",
    name: "ApplyGogo 7-Day Pass",
    price: 10,
    originalPrice: 20, // Anchoring
    credits: 50,
    days: 7,
  },
  PASS_30DAY: {
    id: "PASS_30DAY",
    name: "ApplyGogo 30-Day Pass",
    price: 13,
    originalPrice: 30, // Anchoring
    credits: 300,
    days: 30,
  },
  PASS_BETA_3DAY: {
    id: "PASS_BETA_3DAY",
    name: "Beta Launch Special (3 Days)",
    price: 0,
    credits: 50,
    days: 3,
  },
  CREDIT_50: {
    id: "CREDIT_50",
    name: "50 Credits Top-up",
    price: 4,
    credits: 50,
    days: 0,
  },
} as const;

export type PlanProductId = keyof typeof PLAN_PRODUCTS;

export function getProductByPrice(amount: number) {
  return Object.values(PLAN_PRODUCTS).find((p) => p.price === amount);
}
