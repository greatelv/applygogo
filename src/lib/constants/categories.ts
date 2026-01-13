export const Category = {
  Streaming: "Streaming",
  Music: "Music",
  AI: "AI",
  Software: "Software",
  Travel: "Travel",
  VPN: "VPN",
  Security: "Security",
  Education: "Education",
  Shopping: "Shopping",
  Subscription: "Subscription",
} as const;

export type Category = (typeof Category)[keyof typeof Category];

export const CategoryLabel: Record<Category, string> = {
  [Category.Streaming]: "스트리밍",
  [Category.Music]: "뮤직",
  [Category.AI]: "AI 툴",
  [Category.Software]: "소프트웨어",
  [Category.Travel]: "여행",
  [Category.VPN]: "VPN",
  [Category.Security]: "보안",
  [Category.Education]: "교육",
  [Category.Shopping]: "쇼핑",
  [Category.Subscription]: "구독",
};
