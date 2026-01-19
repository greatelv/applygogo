export interface Experience {
  id: string;
  company_name_source: string;
  role_source: string;
  start_date: string;
  end_date: string;
  bullets_source: string[];
}

export interface TranslatedExperience extends Experience {
  company_name_target: string;
  role_target: string;
  bullets_target: string[];
}

export interface Education {
  id: string;
  school_name_source: string;
  school_name_target?: string;
  major_source: string;
  major_target?: string;
  degree_source: string;
  degree_target?: string;
  start_date: string;
  end_date: string;
}

export interface Skill {
  id: string;
  name: string;
  name_source: string;
  name_target?: string;
  level?: string | null;
}

export interface PersonalInfo {
  name_source: string;
  name_target: string;
  email: string;
  phone: string;
  links: { label: string; url: string }[];
  summary_source: string;
  summary_target: string;
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
  name_source: string;
  name_target: string;
  description_source: string;
  description_target: string;
  date?: string;
}
