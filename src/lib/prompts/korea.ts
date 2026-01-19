import { AppLocale } from "./types";

/**
 * 1. 추출 프롬프트 (한국향: 한국어 이력서에서 데이터 추출)
 */
export const getExtractionPromptKO = (locale: AppLocale) => {
  return `
당신은 **전문가급 이력서 데이터 추출 AI**입니다.
제공된 PDF에서 **모든 경력 사항과 세부 정보를 추출**하는 것이 당신의 미션입니다.

**대상 언어:** 텍스트를 주로 **한국어(Korean)**로 추출하십시오.
- 문서가 한국어로 되어 있다면 일관되게 한국어로 추출하십시오.
- 외국어가 섞여 있더라도 '_source' 필드에는 한국어 콘텐츠를 우선시하십시오.

**핵심 규칙:**
1. **모두 추출 (Greedy Capture)**: 누락 없이 모든 내용을 추출하십시오. 필터링하지 마십시오.
   - 날짜, 직함, 회사명은 필수 항목입니다.
2. **콘텍스트 격리**: 새로운 블록을 만들 때 이전 회사 이름을 복사하지 마십시오.
3. **원문 그대로 추출 (Verbatim Extraction)**:
   - 문서에 나타난 텍스트를 **정확히 그대로** 추출하십시오.
   - **이 단계에서는 번역하지 마십시오.**
4. **검증**:
   - 문서가 이력서/CV가 아닌 경우, \`{ "is_resume": false, "detected_language": "other" }\`를 반환하십시오.
   - 주 언어("en", "ja", "ko")를 감지하십시오.

**출력 형식 (JSON):**
\`_source\` 접미사가 붙은 필드에 추출하십시오.

\`\`\`json
{
  "is_resume": true,
  "detected_language": "ko",
  "personal_info": {
    "name_source": "...", 
    "email": "...",
    "phone": "...",
    "links": [
      { "label": "LinkedIn/포트폴리오 등...", "url": "..." }
    ],
    "summary_source": "..."
  },
  "work_experiences": [
    {
      "company_name_source": "...",
      "role_source": "...",
      "start_date": "YYYY-MM",
      "end_date": "YYYY-MM 또는 현재",
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
  "skills": ["스킬 1", "스킬 2"], 
  "certifications": [{ "name_source": "...", "date": "..." }],
  "awards": [{ "name_source": "...", "date": "..." }],
  "languages": [{ "name_source": "...", "level": "..." }]
}
\`\`\`
`;
};

/**
 * 2. 정제 프롬프트 (한국향: 한국 시장 상황에 맞게 원문 정제)
 */
export const getRefinementPromptKO = (extractedData: any) => {
  return `
당신은 **한국 취업 시장**에 최적화된 이력서 교정 전문가입니다.
추출된 원본 데이터(\`_source\` 필드)를 분석하고 정제하십시오.

**목표:**
1. **중복 병합**: 동일한 회사에 대해 분리된 섹션이 있다면 하나로 합치십시오.
2. **정리**: 오타를 수정하고 날짜 형식을 표준화(YYYY-MM)하십시오.
3. **스킬 표준화**: 콤마로 구분된 스킬들을 개별 항목으로 분리하십시오.
4. **삭제 금지**: 어떤 회사 블록도 임의로 삭제하지 마십시오.

**입력 데이터:**
${JSON.stringify(extractedData, null, 2)}

**출력 형식:**
동일한 \`_source\` 키를 사용하여 정제된 데이터를 반환하십시오.

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
 * 3. 번역 및 업그레이드 프롬프트 (한국향: 한국어 -> 영어 번역)
 */
export const getTranslationPromptKO = (refinedData: any) => {
  const sourceLang = "Korean";
  const targetLang = "English";
  const strategy =
    "미국/글로벌 표준 이력서 (Action Verbs 사용, 성과 지표 중심)";

  return `
당신은 **엘리트 이력서 컨설턴트**입니다.
당신의 목표는 이력서를 **${sourceLang}**에서 **${targetLang}**으로 번역하고 업그레이드하는 것입니다.

**전략:** ${strategy}

**핵심 규칙:**
1. **번역 (Translate)**: 모든 \`_source\` 필드를 \`_target\` 필드로 변환하십시오.
   - \`name_source\` -> \`name_target\`
   - \`company_name_source\` -> \`company_name_target\`
   - 등등.
2. **누락 금지**: 모든 항목을 번역하십시오. 순서를 정확히 유지하십시오.
3. **고유 명사 처리**:
   - 한국어/일본어 이름을 영어로 변환할 때 로마자 표기법을 따르십시오 (예: "홍길동" -> "Gildong Hong", "삼성" -> "Samsung").
4. **액션 버브(Action Verbs) 사용**: 영문 이력서 표준에 맞게 강한 동사로 시작하는 문장을 작성하십시오.

**입력 데이터 (Source):**
${JSON.stringify(refinedData, null, 2)}

**출력 형식:**
\`_source\`와 \`_target\` 필드가 모두 포함된 전체 JSON을 반환하십시오.

\`\`\`json
{
  "personal_info": {
    "name_source": "...",
    "name_target": "Translated Name",
    ...
  },
  "work_experiences": [
    {
      "company_name_source": "...",
      "company_name_target": "...",
      "bullets_source": ["..."],
      "bullets_target": ["Translated & Upgraded Bullet Point"]
    }
  ],
  ...
}
\`\`\`
`;
};
