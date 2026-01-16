export interface Experience {
  id: string;
  company: string;
  position: string;
  period: string;
  bullets: string[];
}

export interface TranslatedExperience extends Experience {
  companyTranslated: string;
  positionTranslated: string;
  bulletsTranslated: string[];
}

export interface Education {
  id: string;
  school_name: string;
  school_name_translated?: string;
  major: string;
  major_translated?: string;
  degree: string;
  degree_translated?: string;
  start_date: string;
  end_date: string;
}

export interface Skill {
  id: string;
  name: string;
  level?: string | null;
}

export interface PersonalInfo {
  name_original: string;
  name_translated: string;
  email: string;
  phone: string;
  links: { label: string; url: string }[];
  summary?: string;
  summary_original?: string;
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
  name_original: string;
  name_translated?: string;
  description_original?: string;
  description_translated?: string;
  date?: string;
}
