// ============================================================================
// Resume Conversion Workflow Prompts
// Unified Source/Target Schema with Strict Locale Logic
// ============================================================================

type AppLocale = "ko" | "en" | "ja";

// ============================================================================
// 1. Extraction Prompt (Source)
// ============================================================================
export const getExtractionPrompt = (locale: AppLocale) => {
  const languageMap = {
    ko: "Korean",
    en: "English",
    ja: "Japanese",
  };
  const targetLanguage = languageMap[locale] || "Korean";

  return `
You are an **Expert Resume Data Extraction AI**.
Your mission is to extract **ALL career history and details** from the provided PDF.

**TARGET LANGUAGE:** Extract text primarily in **${targetLanguage}**.
- If the document is in ${targetLanguage}, extract it consistently.
- Even if mixed, prioritize ${targetLanguage} content for the '_source' fields.

**CRITICAL RULES:**
1. **Greedy Capture**: Extract EVERYTHING. Do not filter.
   - Dates, Job Titles, Company Names are must-haves.
2. **Context Isolation**: NEVER copy the previous company name for a new block.
3. **Verbatim Extraction**:
   - Extract text EXACTLY as it appears in the document.
   - **Do not translate**.
4. **Validation**:
   - If the document is NOT a resume/CV, return \`{ "is_resume": false, "detected_language": "other" }\`.
   - Detect the **Dominant Language** ("en", "ja", "ko").

**OUTPUT FORMAT (JSON):**
Extract into \`_source\` suffixed fields.

\`\`\`json
{
  "is_resume": true,
  "detected_language": "en",
  "personal_info": {
    "name_source": "...", 
    "email": "...",
    "phone": "...",
    "links": [
      { "label": "LinkedIn/Portfolio...", "url": "..." }
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

// ============================================================================
// 2. Refinement Prompt (Source Polish)
// ============================================================================
export const getRefinementPrompt = (extractedData: any, locale: AppLocale) => {
  const contextMap = {
    ko: "Korean Job Market",
    en: "Global/US Job Market",
    ja: "Japanese Job Market",
  };
  const context = contextMap[locale] || "Korean Job Market";

  return `
You are a **Resume Refinement Expert** tailored for the **${context}**.
Analyze the RAW extracted data (\`_source\` fields) and refine it.

**GOALS:**
1. **Merge Duplicates**: Combine split sections for the same company.
2. **Clean Up**: Fix typos, standardize date formats (YYYY-MM).
3. **Skill Normalization**: Split comma-separated skills into individual items.
4. **Zero Deletion**: Do NOT remove any company block.

**INPUT DATA:**
${JSON.stringify(extractedData, null, 2)}

**OUTPUT FORMAT:**
Return the refined data using the same \`_source\` keys.

\`\`\`json
{
  "personal_info": {
    "name_source": "...",
    "email": "...",
    "phone": "...",
    "links": [
      { "label": "...", "url": "..." }
    ],
    "summary_source": "..."
  },
  "work_experiences": [
    {
      "company_name_source": "Refined Name",
      "role_source": "Refined Role",
      "start_date": "YYYY-MM",
      "end_date": "YYYY-MM",
      "bullets_source": ["Refined Bullet 1", "Refined Bullet 2"]
    }
  ],
  "skills": ["Skill 1", ...],
  ...
}
\`\`\`
`;
};

// ============================================================================
// 3. Translation Prompt (Source -> Target)
// ============================================================================
export const getTranslationPrompt = (refinedData: any, locale: AppLocale) => {
  let sourceLang = "Korean";
  let targetLang = "English";
  let strategy = "Professional Business English";

  // Standardize Locale Logic
  if (locale === "ko") {
    sourceLang = "Korean";
    targetLang = "English";
    strategy = "US/Global Standard Resume (Action Verbs, Metric-driven)";
  } else if (locale === "en") {
    sourceLang = "English";
    targetLang = "Korean";
    strategy = "Professional Business Korean (High-Density 'Gae-jo-sik')";
  } else if (locale === "ja") {
    sourceLang = "Japanese";
    targetLang = "Korean";
    strategy = "Professional Business Korean (High-Density 'Gae-jo-sik')";
  }

  return `
You are an **Elite Resume Consultant**.
Your goal is to translate and upgrade the resume from **${sourceLang}** to **${targetLang}**.

**STRATEGY:** ${strategy}

**CRITICAL RULES:**
1. **Translate**: Convert all \`_source\` fields into \`_target\` fields.
   - \`name_source\` -> \`name_target\`
   - \`company_name_source\` -> \`company_name_target\`
   - etc.
2. **No Omission**: Translate ALL items. Keep the order exactly the same.
3. **Proper Nouns**:
   - If translating to English: Romanize Korean/Japanese names (e.g., "Hong Gildong", "Samsung").
   - If translating to Korean: Transliterate or use official Korean names for global brands (e.g., "Google" -> "구글").

**INPUT DATA (Source):**
${JSON.stringify(refinedData, null, 2)}

**OUTPUT FORMAT:**
Return the FULL JSON with both \`_source\` and \`_target\` fields.

\`\`\`json
{
  "personal_info": {
    "name_source": "...",
    "name_target": "Translated Name",
    "email": "...",
    "phone": "...",
    "links": [
      { "label": "...", "url": "..." }
    ],
    "summary_source": "...",
    "summary_target": "Translated Summary"
  },
  "work_experiences": [
    {
      "company_name_source": "...",
      "company_name_target": "...",
      "role_source": "...",
      "role_target": "...",
      "start_date": "...",
      "end_date": "...",
      "bullets_source": ["..."],
      "bullets_target": ["..."]
    }
  ],
  "educations": [
    {
      "school_name_source": "...",
      "school_name_target": "...",
      "major_source": "...",
      "major_target": "...",
      "degree_source": "...",
      "degree_target": "..."
      ...
    }
  ],
  "skills": ["..."],
  "certifications": [{ "name_source": "...", "name_target": "...", "date": "..." }],
  "awards": [{ "name_source": "...", "name_target": "...", "date": "..." }],
  "languages": [{ "name_source": "...", "name_target": "...", "level": "..." }]
}
\`\`\`
`;
};
