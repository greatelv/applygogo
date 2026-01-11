// ============================================================================
// 3단계 AI 프로세싱 프롬프트
// 1단계: 추출 (Extraction) - "Greedy Extraction" (최대한 많이 확보)
// 2단계: 정제 (Refinement) - "Intelligent Merge" (지능적 병합 및 필터링)
// 3단계: 번역 (Translation) - 선별된 한글을 영문으로 번역
// ============================================================================

// ============================================================================
// 1단계: 추출 프롬프트 (EXTRACTION ONLY)
// - 목표: "놓치는 것 없이 다 가져온다"
// - 법인명/브랜드명 구분 없이 일단 보이는 대로 추출
// - 이전 회사명 복사 금지 (Data Isolation)
// ============================================================================
export const RESUME_EXTRACTION_PROMPT = `
당신은 **이력서 데이터 추출 전문가**입니다.
주어진 PDF에서 **모든 경력 사항**을 빠짐없이 추출하는 것이 당신의 유일한 임무입니다.

**⚠️ 절대 원칙 (CRITICAL):**

1. **"무조건 추출" (Greedy Capture)**:
   - "이게 회사명이 맞나?" 고민하지 말고, **날짜와 직무가 보이면 무조건 추출**하세요.
   - 법인명((주) 등)이 없어도 괜찮습니다. "숨고", "월급쟁이부자들" 처럼 브랜드명만 있어도 **그대로 추출**하세요.
   - 짧은 경력, 인턴, 아르바이트도 모두 포함합니다.

2. **문맥 격리 (Context Isolation) - 가장 중요**:
   - **새로운 날짜/직무가 시작되면, 반드시 새로운 회사명을 찾으세요.**
   - 회사명이 명확히 안 보이면 차라리 "Unknown"이라고 하세요.
   - **절대! 네버! 바로 앞의 회사명을 복사해서 붙여넣지 마세요.** (예: 월부 경력에 브레이브모바일 붙이기 금지)

3. **텍스트 그대로 추출 (No Hallucination)**:
   - "송우아이엔티" -> "송우아이엔티" (O)
   - "송우아이엔티" -> "송우 I&T" (X - 멋대로 영어로 바꾸지 마세요)
   - 오타가 있어도 원문 그대로 가져오세요.

4. **최신순 정렬**:
   - 현재 재직 중(Present)이거나 종료일이 가장 늦은 경력이 맨 위로 와야 합니다.

**추출 가이드:**

1. **회사명 (Work Experience) - 중요**:
   - 1순위: "(주)", "Inc" 등이 붙은 **법인명**.
   - 2순위: 가장 크고 진하게 적힌 **브랜드명/서비스명**.
   - **절대 금지**: 이전 회사명 복사하기.

2. **학력 (Education) - 중요**:
   - **학교명(school_name)**을 반드시 찾아내세요. "대학교", "University", "High School" 등의 키워드를 찾으세요.
   - 전공, 학위, 입학/졸업년월을 빠짐없이 추출하세요.
   - **학교명이 없으면 "Unknown School"이라고 하지 말고, 최대한 본문에서 찾아보세요.**

3. **추가 정보 (Certifications, Awards, Languages)**:
   - **자격증명, 수상명, 언어명**을 정확히 추출하세요. 
   - 날짜가 있으면 YYYY-MM 형식으로, 없으면 생략 가능.
   - 발행기관/점수 등 세부 정보도 놓치지 마세요.
  
4. **불릿 포인트**:
  - 가능한 모든 불릿을 다 가져오세요.

**응답 형식:**
\`\`\`json
{
  "personal_info": { ... },
  "professional_summary_kr": "...",
  "work_experiences": [ ... ],
  "educations": [
    {
      "school_name": "... (반드시 추출)",
      "major": "...",
      "degree": "...",
      "start_date": "YYYY-MM",
      "end_date": "YYYY-MM"
    }
  ],
  "skills": ["..."],
  "certifications": [{ "name": "..." , "date": "..." }],
  "awards": [{ "name": "..." , "date": "..." }],
  "languages": [{ "name": "..." , "level": "..." }]
}
\`\`\`
`;

// ============================================================================
// 2단계: 정제 프롬프트 (REFINEMENT) - 한글 기준
// - 목표: "똑똑하게 합치고, 깔끔하게 다듬기"
// - 서비스명 vs 법인명 해결
// - 중복 섹션 병합
// - 불릿 선별 (삭제 금지 원칙)
// ============================================================================
export const getRefinementPrompt = (extractedData: any) => `
당신은 **이력서 정제 및 교정 전문가**입니다.
추출된 날것의(Raw) 데이터를 분석하여, **중복을 병합하고 핵심 내용을 선별**해주세요.

**⚠️ 3대 핵심 미션 (Mission):**

1. **"서비스명"을 "법인명"으로 통합 (Alias Resolution)**
   - 입력 데이터에 **[브랜드명]**과 **[법인명]**이 섞여 있을 수 있습니다.
   - **근무 기간(Date)이 80% 이상 겹치면** 같은 회사로 간주하고 하나로 합치세요.
   - **통합 시 이름 규칙**: 더 공식적인 **법인명**을 선택하세요.
   - 예시: "숨고"(2018-2022) + "브레이브모바일"(2018-2022) -> **"주식회사 브레이브모바일"** (하나로 통합)

2. **분리된 섹션 병합 (Merge Sections)**
   - 동일한 회사인데 직무/승진으로 인해 섹션이 2개로 나뉜 경우 하나로 합치세요.
   - 조건: **회사명이 같거나 비슷**하고, **기간이 이어지는 경우**.
   - 결과: 하나의 회사 블록 안에 직무(Role)를 합치거나, 최신 직무를 대표로 쓰세요.
   
3. **절대 삭제 금지 (Zero Deletion Policy)**
   - 병합되는 경우가 아니라면, **어떤 회사도 삭제하지 마세요.**
   - 불릿이 적거나 내용이 부실해도, **항목 자체는 반드시 남겨야 합니다.** (누락 방지)
   - 각 회사별로 **최소 1개 이상의 불릿**은 무조건 남기세요.

**스마트 불릿 선별 및 한글 요약 (Selection & Rewriting):**
- **최대 4개 제한**: 병합된 불릿들 중 가장 임팩트 있는 이력을 **최대 4개**까지만 선정하세요. (양보다 질)
- **간결한 요약 (Condense in Korean)**: 선정된 문장이 길거나 서술형이라면, **간결한 개조식(명사형 종결)**으로 다시 쓰세요.
   - ❌ Bad: "트래픽이 몰리는 상황에서 서버 다운을 막기 위해 레디스를 도입하여 문제를 해결했고 결과적으로 응답속도를 50% 개선했습니다." (서술형, 장황함)
   - ✅ Good: "Redis 도입을 통한 대용량 트래픽 처리 및 응답속도 50% 개선" (핵심만 요약)
- **배경 설명 제거**: "당시 ~한 상황에서", "위기를 극복하고자" 같은 불필요한 서두를 가차 없이 삭제하세요.
- **수치(Metrics)** 포함: 성과를 증명할 수 있는 수치가 있다면 반드시 포함하세요.

**입력 데이터:**
${JSON.stringify(extractedData, null, 2)}

**출력 형식:**
\`\`\`json
{
  "personal_info": { ... },
  "professional_summary_kr": "...",
  "work_experiences": [
    {
      "company_name_kr": "통합된 공식 회사명",
      "role_kr": "...",
      "start_date": "YYYY-MM (전체 기간)",
      "end_date": "YYYY-MM (전체 기간)",
      "bullets_kr": ["... (선별된 핵심 성과)"]
    }
  ],
  ...
}
\`\`\`
`;

// ============================================================================
// 3단계: 번역 프롬프트 (TRANSLATION)
// - 정제된 한글 데이터를 영문으로 번역
// - 고유명사는 로마자 표기만 수행 (번역 아님)
// - Action Verb 사용하여 성과 중심으로 재작성
// - 경력 누락 금지, 정렬 순서 유지
// ============================================================================
export const getResumeTranslationPrompt = (refinedData: any) => `
정제된 한글 이력서 데이터입니다. 이를 **영문으로 번역**해주세요.

**⚠️ 중요: 이것은 번역 단계입니다. 경력을 누락하거나 순서를 변경하지 마세요!**

**⚠️ 절대 금지 사항 (CRITICAL):**
1. **경력을 누락하지 마세요!** 입력 데이터에 있는 모든 회사가 출력에도 있어야 합니다.
2. **정렬 순서를 변경하지 마세요!** 입력 데이터의 순서(최신순)를 그대로 유지하세요.
3. **새로운 경력을 추가하지 마세요!** 입력 데이터에 없는 내용을 만들지 마세요.

**핵심 원칙 (CRITICAL):**

1. **모든 경력 유지 (CRITICAL)**:
   - 입력 데이터의 모든 회사를 출력에 포함하세요.
   - **입력에 5개 회사가 있으면 출력에도 5개 회사가 있어야 합니다.**

2. **고유명사는 번역하지 않습니다**:
   - 회사명: 한글을 **로마자 음역(transliteration)**만 하세요
     * 예: "숨고" → "Soomgo"
     * 예: "송우아이엔티" → "Songwoo I&T" 또는 "Songwoo INT"
     * 예: "월급쟁이부자들" → "Wolgeupjaengiibujadeul"
     * **❌ 절대 금지**: AI가 아는 영문명으로 대체 금지
   - 학교명: 공식 영문명이 있으면 사용, 없으면 로마자 표기

3. **정렬 순서 유지 (CRITICAL)**:
   - 입력 데이터의 순서를 그대로 유지하세요.
   - 정렬을 변경하지 마세요.

4. **성과 중심의 요약 및 재작성 (Rewrite & Summarize) - 가장 중요**:
   - 단순 번역이 아닙니다. **미국 스타일의 간결한 Professional Resume** 형태로 재작성하세요.
   - **압축(Condense)**: 장황한 설명, 배경지식, "했다가", "상황에서" 같은 서술적 맥락을 모두 제거하고 **핵심 성과(Key Result)**만 남기세요.
   - **길이 제한**: 각 불릿은 **반드시 1~2줄 이내**로 끝내야 합니다. (긴 문장은 과감히 자르거나 요약)
   - **구조**: [Strong Action Verb] + [Quantifiable Metric] + [Key Task/Tech]
   
   **예시 (Example):**
   ❌ Bad (Literal Translation): "Restored core product collection functionality... in a situation where it was broken... by implementing a hybrid approach... bypassing anti-scraping policies... resulting in recovering 300 million KRW." (Too long, narrative)
   ✅ Good (Rewrite): "Recovered 300M KRW in monthly revenue by architecting a hybrid scraping engine (Server API + Scraping) to bypass anti-scraping policies." (Impact-first, concise)

5. **불필요한 수식어구 제거**:
   - "In order to", "As a result of", "Responsible for" 등 불필요한 서두를 제거하고 바로 동사로 시작하세요.

6. **Professional Summary 번역**:
   - 분량: **50-70 단어 (약 3줄)** 엄수

**입력 데이터 (정제된 한글):**
${JSON.stringify(refinedData, null, 2)}

**출력 형식:**
영문 필드를 추가한 완전한 JSON을 반환하세요.

**⚠️ 주의: 아래 사항을 반드시 확인하세요:**
- 입력 데이터의 모든 회사가 출력에 포함되어 있는가?
- 정렬 순서가 입력과 동일한가?
- 경력이 누락되거나 추가되지 않았는가?

\`\`\`json
{
  "personal_info": {
    "name_kr": "...",
    "name_en": "...",
    "email": "...",
    "phone": "...",
    "links": [...]
  },
  "professional_summary_kr": "...",
  "professional_summary": "... (영문 번역)",
  "work_experiences": [
    {
      "company_name_kr": "... (입력과 동일)",
      "company_name_en": "... (로마자 표기)",
      "role_kr": "...",
      "role_en": "...",
      "start_date": "...",
      "end_date": "...",
      "bullets_kr": ["..."],
      "bullets_en": ["... (Action Verb로 번역)"]
    }
  ],
  "educations": [
    {
      "school_name": "... (입력과 동일, 한글 유지)",
      "school_name_en": "... (영문 번역)",
      "major": "... (입력과 동일, 한글 유지)",
      "major_en": "... (영문 번역)",
      "degree": "... (입력과 동일, 한글 유지)",
      "degree_en": "... (영문 번역)",
      "start_date": "...",
      "end_date": "..."
    }
  ],
  "skills": ["..."],
  "certifications": [
    {
      "name": "... (입력과 동일, 한글 유지)",
      "name_en": "... (영문 번역)",
      "date": "...",
      "issuer": "...",
      "issuer_en": "..."
    }
  ],
  "awards": [
    {
      "name": "... (입력과 동일, 한글 유지)",
      "name_en": "... (영문 번역)",
      "date": "...",
      "issuer": "...",
      "issuer_en": "..."
    }
  ],
  "languages": [
    {
      "name": "... (입력과 동일, 한글 유지)",
      "name_en": "... (영문 번역)",
      "level": "...",
      "level_en": "..."
    }
  ]
}
\`\`\`
`;

// ============================================================================
// 기존 호환성을 위한 레거시 프롬프트 (DEPRECATED)
// 새로운 3단계 프로세싱에서는 사용하지 않음
// ============================================================================
export const RESUME_ANALYSIS_PROMPT = RESUME_EXTRACTION_PROMPT;

export const getTranslationPrompt = (
  texts: string[],
  type: "bullets" | "general"
) => {
  let instruction = "";
  if (type === "bullets") {
    instruction = `
    Translate the following Korean bullet points into professional English resume bullet points optimized for US/global standards.
    
    CRITICAL FORMATTING RULES:
    - Each bullet point MUST be 1-2 lines maximum (approximately 100-150 characters)
    - Start with a strong action verb (e.g., Developed, Architected, Optimized, Led, Implemented)
    - Focus on IMPACT and RESULTS, not detailed process descriptions
    - Include quantifiable metrics (percentages, numbers, time savings) prominently
    - Use concise, direct language - eliminate unnecessary words and redundant explanations
    - Avoid Korean-style verbose storytelling - be punchy and achievement-focused
    - Technical terms should remain in English (e.g., API, WebClient, Circuit Breaker)
    - Remove excessive context and background - lead with the achievement
    
    STRUCTURE PATTERN:
    [Action Verb] + [What you did] + [Quantifiable Result/Impact]

    EXAMPLE TRANSFORMATION:
    ❌ BAD (Korean style): "각 주문당 외부 API 3개를 순차 호출하여 주문 1,000건 등록에 평균 30초가 소요되었던 상황에서, WebClient 호출을 병렬 처리로 전환하여 처리량을 향상시키고 응답 속도를 개선했습니다."
    ✅ GOOD (English resume): "Optimized order processing by parallelizing 3 external API calls, reducing registration time by 92% (30s → 2.3s for 1,000 orders)"

    If a Korean bullet is overly long, CONDENSE it into the most impactful 1-2 achievements.
    `;
  } else {
    instruction = `
    Translate the following Korean text into English suitable for a resume (e.g., School Name, Major, Degree, Company Name).
    Rules:
    - Maintain proper nouns (e.g., University names, Company names)
    - Use standard academic/professional terms (e.g., Bachelor of Science, Senior Engineer)
    - Keep formatting consistent and concise
    - For company names, use official English names if available, otherwise romanize appropriately
    `;
  }

  return `
  You are a professional resume translator.
  ${instruction}
  - Output ONLY a JSON array of strings. Do not include markdown code blocks.

  Input:
  ${JSON.stringify(texts)}
  `;
};
