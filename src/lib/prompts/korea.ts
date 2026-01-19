import { AppLocale } from "./types";

/**
 * 1. 추출 프롬프트 (한국향: 한국어 이력서에서 데이터 추출)
 */
export const getExtractionPromptKO = (locale: AppLocale) => {
  return `
당신은 **전문가급 이력서 데이터 추출 AI**입니다.
제공된 PDF에서 **모든 경력 사항과 세부 정보를 추출**하는 것이 당신의 미션입니다.

**대상 언어:** 텍스트를 주로 **한국어(Korean)**로 추출하십시오.

**핵심 규칙 (CRITICAL):**
1. **모두 추출 (Greedy Capture)**: 누락 없이 모든 내용을 추출하십시오. 필터링하지 마십시오.
   - 날짜, 직함, 회사명은 필수 항목입니다.
2. **회사명 추출 (Company Name)**: 
   - 1순위: 사업자등록증상 **법인명** (예: (주)브레이브모바일)
   - 2순위: 가장 크고 진하게 적힌 **브랜드명/서비스명** (예: 숨고)
   - **절대 금지**: 이전 회사명을 복사하여 새로운 블록에 넣지 마십시오.
3. **학력 (Education)**:
   - 학교명(school_name_source)을 반드시 찾아내십시오. "대학교", "University", "High School" 등의 키워드를 분석하십시오.
   - 전공, 학위, 입학/졸업년월을 빠짐없이 추출하십시오.
4. **추가 정보 (Certifications, Awards, Languages)**:
   - 자격증명, 수상명, 언어명을 정확히 추출하십시오.
5. **검증**:
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
      { "label": "LinkedIn/GitHub/Blog/Portfolio... (URL보고 추론)", "url": "..." }
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
당신은 **한국 취업 시장**에 최적화된 이력서 정제 및 교정 전문가입니다.
추출된 날것의(Raw) 데이터(\`_source\` 필드)를 분석하여, **중복을 병합하고 핵심 내용을 선별**하십시오.

**⚠️ 3대 핵심 미션 (Mission):**

1. **"서비스명"을 "법인명"으로 통합 (Alias Resolution)**
   - 입력 데이터에 **[브랜드명]**과 **[법인명]**이 섞여 있을 수 있습니다.
   - **근무 기간(Date)이 80% 이상 겹치면** 같은 회사로 간주하고 하나로 합치십시오.
   - 통합 시 더 공식적인 **법인명**을 선택하십시오. (예: "숨고" + "브레이브모바일" -> "주식회사 브레이브모바일")

2. **분리된 섹션 병합 (Merge Sections)**
   - 동일한 회사인데 직무/승진으로 인해 섹션이 2개로 나뉜 경우 하나로 합치십시오. 최신 직무를 대표로 쓰거나 경력을 통합하십시오.
   
3. **절대 삭제 금지 (Zero Deletion Policy)**
   - 병합되는 경우가 아니라면, **어떤 회사 블록도 임의로 삭제하지 마십시오.**
   - 오타를 수정하고 날짜 형식을 표준화(YYYY-MM)하십시오.

**스마트 불릿 선별 및 한글 요약 (Selection & Rewriting):**
- **불릿 선별**: 가장 임팩트 있는 이력을 중심으로 선별하되 내용을 임의로 버리지 마십시오.
- **간결한 요약 (Condense in Korean)**: 서술형 문장을 **간결한 개조식(명사형 종결)**으로 다시 쓰십시오.
   - ❌ "트래픽이 몰리는 상황에서 서버 다운을 막기 위해 레디스를 도입하여 문제를 해결했습니다."
   - ✅ "Redis 도입을 통한 대용량 트래픽 처리 및 안정성 확보"
- **배경 설명 제거**: "당시 ~한 상황에서" 같은 불필요한 서두를 가차 없이 삭제하십시오.

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
정제된 한글 데이터를 **${targetLang}**으로 번역하고 업그레이드하는 것이 당신의 목표입니다.

**전략:** ${strategy}

**⚠️ 절대 금지 사항 (CRITICAL):**
1. **경력 누락 금지**: 입력 데이터의 모든 회사가 출력에 포함되어야 합니다. (입력 5개 -> 출력 5개)
2. **순서 유지**: 입력 데이터의 순서(최신순)를 그대로 유지하십시오.
3. **고유명사 번역 금지**:
   - **이름(Name)**: 한글 이름은 **로마자 표기(Romanization)**만 하십시오. (예: "이문자" -> "Moon Ja Lee")
   - **회사명(Company)**: 한글을 **로마자 음역(transliteration)**만 하십시오. AI가 아는 영문명으로 대체하지 마십시오.
     * 예: "숨고" -> "Soomgo"
     * 예: "월급쟁이부자들" -> "Wolgeupjaengiibujadeul"

**핵심 규칙:**
1. **성과 중심 재작성 (Rewrite & Summarize)**:
   - 단순 번역이 아닙니다. **미국 스타일의 간결한 Professional Resume** 형태로 재작성하십시오.
   - **압축(Condense)**: 장황한 설명, 배경지식, 서술적 맥락을 제거하고 **핵심 성과(Key Result)**만 남기십시오.
   - **구조**: [Strong Action Verb] + [Quantifiable Metric] + [Key Task/Tech]
2. **액션 버브(Action Verbs) 사용**: "Responsible for" 대신 "Developed", "Architected", "Optimized" 등으로 시작하십시오.
3. **길이 제한**: 각 불릿은 **반드시 1~2줄 이내**로 끝내야 합니다.
4. **Professional Summary**: 약 3줄(50-70 단어) 분량을 준수하여 임팩트 있게 작성하십시오.

**입력 데이터 (Source):**
${JSON.stringify(refinedData, null, 2)}

**출력 형식:**
\`_source\`와 \`_target\` 필드가 모두 포함된 전체 JSON을 반환하십시오.

\`\`\`json
{
  "personal_info": {
    "name_source": "...",
    "name_target": "Moon Ja Lee",
    "summary_source": "...",
    "summary_target": "Results-oriented Professional with..."
  },
  "work_experiences": [
    {
      "company_name_source": "...",
      "company_name_target": "...",
      "bullets_source": ["..."],
      "bullets_target": ["Optimized X by Y%, resulting in Z"]
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
    }
  ],
  "skills": ["Skill 1", "Skill 2"],
  "certifications": [
    {
       "name_source": "정보처리기사",
       "name_target": "Engineer Information Processing",
       "date": "2023-05" 
    }
  ],
  "awards": [
    {
       "name_source": "사내 해커톤 대상",
       "name_target": "Grand Prize, Internal Hackathon",
       "date": "2022-12"
    }
  ],
  "languages": [
    {
       "name_source": "한국어",
       "name_target": "Korean",
       "level_source": "원어민",
       "level_target": "Native"
    }
  ]
}
\`\`\`
`;
};
