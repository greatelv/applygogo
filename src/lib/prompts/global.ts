import { AppLocale } from "./types";

/**
 * 1. Extraction Prompt (Global: Extract from English/Japanese)
 */
export const getExtractionPromptGlobal = (locale: AppLocale) => {
  const languageMap = {
    en: "English",
    ja: "Japanese",
    ko: "Korean",
  };
  const targetLanguage = languageMap[locale] || "English";

  return `
You are an **Expert Resume Data Extraction AI**.
Your mission is to extract **ALL career history and details** from the provided PDF.

**TARGET LANGUAGE:** Extract text primarily in **${targetLanguage}**.
- If the document is in ${targetLanguage}, extract it consistently.
- Even if mixed, prioritize ${targetLanguage} content for the '_source' fields.

**CRITICAL RULES (CRITICAL):**
1. **Greedy Capture (ALL-IN)**: Extract EVERYTHING. Do not filter or summarize at this stage.
   - Dates, Job Titles, and Company Names are mandatory.
2. **Company Name Extraction**: 
   - Priority 1: **Legal Entity Name** (e.g., Google LLC).
   - Priority 2: **Brand/Service Name** (e.g., Google).
   - **NEVER** copy the previous company name for a new block.
3. **Education**:
   - Explicitly look for **School Names** (keywords: University, College, School).
   - Extract major, degree, and start/end dates without omission.
4. **Additional Info**:
   - Extract certifications, awards, and language proficiencies accurately.
5. **Validation**:
   - If the document is NOT a resume/CV, return \`{ "is_resume": false, "detected_language": "other" }\`.
   - Detect the **Dominant Language** ("en", "ja", "ko").

**OUTPUT FORMAT (JSON):**
Extract into \`_source\` suffixed fields.

\`\`\`json
{
  "is_resume": true,
  "detected_language": "${locale}",
  "personal_info": {
    "name_source": "...", 
    "email": "...",
    "phone": "...",
    "links": [
      { "label": "LinkedIn/GitHub/Blog/Portfolio... (Infer from URL)", "url": "..." }
    ],
    "summary_source": "..."
  },
  "work_experiences": [
    {
      "company_name_source": "...",
      "role_source": "...",
      "start_date": "YYYY-MM",
      "end_date": "YYYY-MM or Present",
      "bullets_source": ["...", "..."]
    }
  ],
  "educations": [
    {
      "school_name_source": "...",
      "major_source": "...",
      "degree_source": "...",
      "start_date": "YYYY-MM",
      "end_date": "YYYY-MM"
    }
  ],
  "skills": ["Skill 1", "Skill 2"], 
  "certifications": [{ "name_source": "...", "date": "..." }],
  "awards": [{ "name_source": "...", "date": "..." }],
  "languages": [{ "name_source": "...", "level": "..." }]
}
\`\`\`
`;
};

/**
 * 2. Refinement Prompt (Global: Polish source data for Global markets)
 */
export const getRefinementPromptGlobal = (
  extractedData: any,
  locale: AppLocale,
) => {
  const contextMap = {
    en: "Global/US Job Market",
    ja: "Japanese Job Market",
  };
  const context = contextMap[locale as "en" | "ja"] || "Global Job Market";

  return `
You are a **Resume Refinement Expert** tailored for the **${context}**.
Analyze the RAW extracted data (\`_source\` fields) and refine it for maximum clarity.

**⚠️ 3 CORE MISSIONS:**

1. **Alias Resolution (Merge Legal & Brand Names)**
   - If a **[Brand Name]** and **[Legal Entity Name]** are both present and their **dates overlap by >80%**, merge them.
   - Select the more formal **Legal Name** for the final output.
2. **Merge Split Sections**
   - If the same company is split into different sections due to promotions or role changes, merge them into a single block while preserving chronological order.
3. **Zero Deletion Policy**
   - Do **NOT** delete any company block unless it is a duplicate being merged.
   - Standardize date formats to YYYY-MM.

**SMART POLISHING & SELECTION:**
- **Bullet Polishing**: Polish the descriptions for clarity in the source language.
- **Condense**: Remove redundant narrative context like "Responsible for" or "Tasked with". Start with direct action verbs.
- **Maintain Metrics**: Ensure all quantifiable results (%, $, #) are preserved.

**INPUT DATA:**
${JSON.stringify(extractedData, null, 2)}

**OUTPUT FORMAT:**
Return the refined data using the same \`_source\` keys.

\`\`\`json
{
  "personal_info": { "name_source": "...", ... },
  "work_experiences": [...],
  ...
}
\`\`\`
`;
};

/**
 * 3. Translation Prompt (Global: EN/JA -> Korean 'Gae-jo-sik')
 */
export const getTranslationPromptGlobal = (
  refinedData: any,
  locale: AppLocale,
) => {
  let sourceLang = locale === "ja" ? "Japanese" : "English";
  let targetLang = "Korean";
  let strategy = "Professional Business Korean (Action-Oriented 'Gae-jo-sik')";

  return `
You are an **Elite Resume Consultant** specialized in the **Korean Job Market**.
Your goal is to translate and upgrade the resume from **${sourceLang}** to **${targetLang}**.

**STRATEGY:** ${strategy}

**⚠️ CRITICAL PROHIBITIONS:**
1. **NO OMISSION**: Every single company and experience from the input MUST be in the output.
2. **MAINTAIN ORDER**: Keep the chronological or original order exactly as provided.
3. **PROPER NOUNS**:
   - Use official Korean names for global brands if they exist (e.g., "Google" -> "구글", "Samsung" -> "삼성").
   - For names/companies with NO official Korean name, use **Standard Korean Transliteration**.

**CORE RULES:**
1. **Professional Korean Style (Gae-jo-sik)**:
   - Do NOT use full sentences. Use noun-ending (개조식) professional style.
   - ❌ "~를 개발하여 성능을 개선했습니다."
   - ✅ "~ 개발을 통한 성능 X% 개선"
2. **Action-Oriented**: Translate action verbs into strong Korean professional equivalents.
3. **Company Background (CRITICAL)**:
   - For foreign companies, add a brief one-line description in parentheses if necessary to help Korean recruiters understand the scale or industry.
   - Example: "Stripe" -> "Stripe (미국 최대 핀테크 유니콘 기업)"
4. **Title & Education Mapping**:
   - Map foreign job titles (e.g., Staff Engineer, Senior Associate) to appropriate Korean professional terminology.
   - Translate degrees to standard Korean equivalents (e.g., Bachelor -> 학사, Master -> 석사, Associate -> 전문학사).
5. **Industry Standardization**: Use standard Korean IT/Industry terminology for technical stacks and methodologies.
6. **Quantifiable Impact**: Ensure all numbers, percentages, and metrics are clearly translated and highlighted.
7. **Professional Summary**: Rewrite into a punchy 3-line summary (50-70 words equivalent in Korean).

**INPUT DATA (Source):**
${JSON.stringify(refinedData, null, 2)}

**OUTPUT FORMAT:**
Return the FULL JSON with both \`_source\` and \`_target\` fields.

\`\`\`json
{
  "personal_info": {
    "name_source": "...",
    "name_target": "홍길동",
    "summary_source": "...",
    "summary_target": "..."
  },
  "work_experiences": [
    {
      "company_name_source": "...",
      "company_name_target": "...",
      "bullets_source": ["..."],
      "bullets_target": ["... (Noun-ending Korean)"]
    }
  ],
  ...
}
\`\`\`
`;
};
