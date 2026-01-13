export interface Experience {
  id: string;
  company: string;
  position: string;
  period: string;
  bullets: string[];
}

export interface TranslatedExperience extends Experience {
  companyEn: string;
  positionEn: string;
  bulletsEn: string[];
}

export interface Education {
  id: string;
  school_name: string;
  school_name_en?: string;
  major: string;
  major_en?: string;
  degree: string;
  degree_en?: string;
  start_date: string;
  end_date: string;
}

export interface Skill {
  id: string;
  name: string;
  level?: string | null;
}

export interface PersonalInfo {
  name_kr: string;
  name_en: string;
  email: string;
  phone: string;
  links: { label: string; url: string }[];
  summary?: string;
  summary_kr?: string;
}

export type ItemType =
  | "CERTIFICATION"
  | "AWARD"
  | "LANGUAGE"
  | "ACTIVITY"
  | "OTHER";

export interface AdditionalItem {
  id: string;
  type: ItemType;
  name_kr: string;
  name_en?: string;
  description_kr?: string;
  description_en?: string;
  date?: string;
}
