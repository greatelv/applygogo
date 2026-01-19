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

**CRITICAL RULES:**
1. **Greedy Capture**: Extract EVERYTHING. Do not filter.
   - Dates, Job Titles, Company Names are must-haves.
2. **Context Isolation**: NEVER copy the previous company name for a new block.
3. **Verbatim Extraction**:
   - Extract text EXACTLY as it appears in the document.
   - **Do not translate** at this stage.
4. **Validation**:
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
  ...
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
  let strategy = "Professional Business Korean (High-Density 'Gae-jo-sik')";

  return `
You are an **Elite Resume Consultant** specialized in the **Korean Job Market**.
Your goal is to translate and upgrade the resume from **${sourceLang}** to **${targetLang}**.

**STRATEGY:** ${strategy}

**CRITICAL RULES:**
1. **Translate**: Convert all \`_source\` fields into \`_target\` fields.
   - \`name_source\` -> \`name_target\`
   - \`company_name_source\` -> \`company_name_target\`
2. **No Omission**: Translate ALL items. Keep the order exactly the same.
3. **Proper Nouns**:
   - Transliterate or use official Korean names for global brands (e.g., "Google" -> "구글").
4. **Style**: Use professional Korean business style (Noun-ending, high-density bullet points).

**INPUT DATA (Source):**
${JSON.stringify(refinedData, null, 2)}

**OUTPUT FORMAT:**
Return the FULL JSON with both \`_source\` and \`_target\` fields.
`;
};
