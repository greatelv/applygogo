import { Category } from "@/lib/constants/categories";

export interface ServiceCTA {
  text: string;
  url: string;
  description?: string;
  color?: string; // Hex code or generic color name
}

export interface Service {
  id: string;
  name: string;
  category: Category;
  description: string;
  logo: string; // Path to logo image in /public/service-icons
  cta: ServiceCTA;
  subServices?: string[]; // Specific services handled within this platform (e.g., Netflix for Gamsgo)
  isFromGamsgo?: boolean;
}
