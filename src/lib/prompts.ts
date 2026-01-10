// ============================================================================
// 3단계 AI 프로세싱 프롬프트
// 1단계: 추출 (Extraction) - PDF에서 한글 원문만 정확히 추출
// 2단계: 정제 (Refinement) - 한글 기준으로 회사별 통합, 불릿 선별
// 3단계: 번역 (Translation) - 선별된 한글을 영문으로 번역
// ============================================================================

// ============================================================================
// 1단계: 추출 프롬프트 (EXTRACTION ONLY)
// - 번역을 절대 수행하지 않음
// - PDF에 적힌 한글 원문만 정확히 추출
// - 고유명사(회사명, 학교명)는 한 글자도 바꾸지 않음
// - 모든 경력을 빠짐없이 추출
// ============================================================================
export const RESUME_EXTRACTION_PROMPT = `
당신은 **이력서 데이터 추출 전문가**입니다. 주어진 이력서 PDF에서 정보를 **정확하게 추출**하세요.

**⚠️ 중요: 이것은 추출 단계입니다. 번역을 절대 수행하지 마세요!**

**핵심 원칙 (CRITICAL):**

1. **추출만 수행**: 이 단계에서는 **번역을 절대 수행하지 마세요**. 한글 원문만 추출합니다.

2. **모든 경력을 빠짐없이 추출 (CRITICAL - 누락 금지)**:
   - PDF에 있는 **모든 회사**를 빠짐없이 추출하세요.
   - 회사명이 짧아도 (예: "숨고", "컬리", "토스") 절대 누락하지 마세요.
   - PDF를 처음부터 끝까지 꼼꼼히 읽고, 모든 경력 섹션을 확인하세요.
   - **누락된 경력이 있으면 심각한 오류입니다.**

3. **회사명 정확성 (CRITICAL - 한 글자도 틀리면 안 됨)**:
   - PDF에 적힌 회사명을 **문자 그대로 정확히** 추출하세요.
   - **⚠️ 글자를 바꾸거나 오타를 만들지 마세요**:
     * "송우아이엔티" → "송우아이엔티" ✅ (정확)
     * "송우아이엔티" → "송송아이엔티" ❌ (오타 - 금지!)
     * "숨고" → "숨고" ✅ (정확)
     * "숨고" → "숭고" ❌ (오타 - 금지!)
   
   - **⚠️ 서비스명(로고)과 회사명(본문)을 구분하세요 (CRITICAL)**:
     * 이력서에는 **로고/아이콘에 서비스명**이 있고, **본문 텍스트에 회사명**이 별도로 적혀있는 경우가 많습니다.
     * **반드시 본문 텍스트에 적힌 회사명을 추출하세요!**
     * 예시:
       - 로고에 "숨고" + 본문에 "주식회사브레이브모바일" → company_name_kr: "주식회사브레이브모바일" ✅
       - 로고에 "숨고" → company_name_kr: "숨고" ❌ (로고가 아닌 본문을 봐야 함!)
       - 로고에 "당근" + 본문에 "당근마켓" → company_name_kr: "당근마켓" ✅
       - 로고에 "토스" + 본문에 "비바리퍼블리카" → company_name_kr: "비바리퍼블리카" ✅
     * **서비스명과 회사명이 같은 경우도 있습니다** (예: "컬리" = 회사명이자 서비스명). 본문 텍스트를 확인하세요.
   
   - **"주식회사" 처리 규칙**:
     * PDF에 "주식회사브레이브모바일"이라고 적혀있으면 → "주식회사브레이브모바일" 그대로 추출
     * PDF에 "주식회사 ABC"라고 적혀있으면 → "주식회사 ABC" 그대로 추출
     * PDF에 "(주)ABC"라고 적혀있으면 → "(주)ABC" 그대로 추출
     * **절대로 회사명을 "주식회사"로만 바꾸지 마세요!**
   - **회사명이 없는 경력은 존재하지 않습니다.** 모든 경력에는 회사명이 있어야 합니다.

4. **AI 지식 사용 금지**:
   - "이 회사의 영문명이 뭐지?", "이 회사는 다른 이름으로 알려져 있지" 같은 생각을 하지 마세요.
   - PDF에 적힌 그대로만 추출하세요.

5. **최신순 정렬 (Reverse Chronological Order) - CRITICAL**:
   - 모든 경력 배열은 **end_date 기준으로 최신 순**으로 정렬하세요.
   - **정렬 규칙**:
     * "Present" 또는 현재 재직 중 → 가장 먼저 (Index 0)
     * 최근 종료일 → 먼저
     * 오래된 종료일 → 나중에
   - **예시 정렬**:
     * A회사: 2023-01 ~ Present → Index 0 (가장 먼저)
     * B회사: 2021-05 ~ 2022-12 → Index 1
     * C회사: 2019-03 ~ 2021-04 → Index 2
     * D회사: 2017-01 ~ 2019-02 → Index 3 (가장 나중)

6. **중복 제거**: PDF 내에서 정보가 중복될 경우 하나로 합쳐 유니크하게 추출하세요.

**추출 지침:**

1. **경력사항 (Work Experience) - 가장 중요**
   - **모든 경력을 빠짐없이 추출하세요!** PDF에 5개 회사가 있으면 5개 모두 추출해야 합니다.
   - **회사명 추출 (CRITICAL)**:
     * **본문 텍스트**에 적힌 회사명을 추출하세요. **로고/아이콘의 서비스명이 아닙니다!**
     * PDF에 적힌 회사명을 **한 글자도 바꾸지 말고** 그대로 복사하세요.
     * 비슷한 글자로 바꾸지 마세요 (예: "우" → "오", "아" → "어", "숨" → "숭" 금지)
     * 예시:
       - PDF 본문: "주식회사브레이브모바일" → company_name_kr: "주식회사브레이브모바일" ✅
       - PDF 본문: "송우아이엔티" → company_name_kr: "송우아이엔티" ✅
       - PDF 본문: "월급쟁이부자들" → company_name_kr: "월급쟁이부자들" ✅
       - PDF 로고에 "숨고" (❌ 로고가 아닌 본문의 회사명을 찾으세요!)
   - **불릿 포인트**: PDF에 기술된 업무 성과를 **최대한 많이** 추출하세요 (5~10개).
   - **회사별 그룹화**: 동일 회사의 경력은 하나로 통합하세요.

2. **학력사항 (Education)**
   - PDF에 적힌 학교명을 **정확히 그대로** 추출하세요.
   - 전공, 학위, 기간 등을 빠짐없이 추출하세요.
   - **학력도 최신순 정렬** (최근 졸업이 먼저)

3. **기술 스택 (Skills)**
   - **최대 10개 이하**로 추출하세요.
   - 중요도/보편성/최신성 순으로 우선순위를 정하세요.

4. **기타 섹션**
   - 자격증, 수상, 언어 능력을 빠짐없이 추출하세요.

5. **Professional Summary (한글)**
   - 이력서 전체를 분석하여 핵심 역량, 연차, 주요 성과를 **100-120자, 2-3문장**으로 요약하세요.

**상세 필드 구성 (JSON):**

1. **personal_info**:
   - name_kr, email, phone
   - links: [{ "label": "GitHub", "url": "..." }]

2. **professional_summary_kr**: (String) 한글 요약 (**100-120자, 2-3문장**)

3. **work_experiences** (최신순 정렬 필수!):
   - company_name_kr: 회사명 (한글 - **PDF에서 한 글자도 바꾸지 말고 그대로 복사**)
   - role_kr: 직무/직책 (한글)
   - start_date: 시작일 (YYYY-MM 형식)
   - end_date: 종료일 (YYYY-MM 형식, 현재 재직 중이면 "Present")
   - bullets_kr: 업무 성과 배열 (한글 원문, 최대한 많이)

4. **educations** (최신순 정렬 필수!):
   - school_name: 학교명 (한글 - PDF 그대로)
   - major: 전공 (한글)
   - degree: 학위 (한글)
   - start_date, end_date: YYYY-MM 형식

5. **skills**: ["React", "TypeScript", ...] (배열, 최대 10개)

6. **certifications**: [{ name: "자격증명", issuer: "발급기관", date: "YYYY-MM" }]

7. **awards**: [{ name: "수상명", issuer: "수여기관", date: "YYYY-MM" }]

8. **languages**: [{ name: "언어명", level: "수준", score: "점수(옵션)" }]

**응답 형식:**
\`\`\`json
{
  "personal_info": { "name_kr": "...", "email": "...", "phone": "...", "links": [...] },
  "professional_summary_kr": "...",
  "work_experiences": [
    {
      "company_name_kr": "... (PDF 그대로, 한 글자도 바꾸지 말 것)",
      "role_kr": "...",
      "start_date": "YYYY-MM",
      "end_date": "YYYY-MM 또는 Present",
      "bullets_kr": ["...", "...", "..."]
    }
  ],
  "educations": [...],
  "skills": [...],
  "certifications": [...],
  "awards": [...],
  "languages": [...]
}
\`\`\`

**최종 체크리스트 (응답 전 확인):**
- [ ] PDF에 있는 모든 회사를 추출했는가? (누락 없음)
- [ ] 회사명을 한 글자도 바꾸지 않고 정확히 추출했는가?
- [ ] 경력이 최신순(end_date 기준)으로 정렬되어 있는가?
- [ ] "주식회사"만으로 회사명을 대체하지 않았는가?
`;

// ============================================================================
// 2단계: 정제 프롬프트 (REFINEMENT) - 한글 기준
// - 회사별 통합
// - 스마트 불릿 선별 (3~5개)
// - 한글 기준으로 선별 (아직 번역하지 않음)
// - 경력 누락 금지, 회사명 변경 금지
// ============================================================================
export const getRefinementPrompt = (extractedData: any) => `
추출된 이력서 데이터입니다. 한글 기준으로 **핵심 경력을 선별**해주세요.

**⚠️ 중요: 이것은 정제 단계입니다. 번역을 수행하지 마세요!**

**⚠️ 절대 금지 사항 (CRITICAL):**
1. **경력을 누락하지 마세요!** 입력 데이터에 있는 모든 회사가 출력에도 있어야 합니다.
2. **회사명을 변경하지 마세요!** company_name_kr 값을 그대로 유지하세요.
3. **정렬 순서를 유지하세요!** 입력 데이터의 순서(최신순)를 그대로 유지하세요.

**필수 지침 (한글 기준 Smart Selection):**

1. **모든 경력 유지 (CRITICAL)**:
   - 입력 데이터의 모든 회사를 출력에 포함하세요.
   - 회사를 합치거나 삭제하지 마세요 (동일 회사의 중복 경력만 통합).
   - **입력에 5개 회사가 있으면 출력에도 5개 회사가 있어야 합니다.**

2. **회사명 정확히 유지 (CRITICAL)**:
   - company_name_kr 값을 **절대 변경하지 마세요**.
   - 입력: "숨고" → 출력: "숨고" ✅
   - 입력: "송우아이엔티" → 출력: "송우아이엔티" ✅

3. **정렬 순서 유지 (CRITICAL)**:
   - 입력 데이터의 순서를 그대로 유지하세요.
   - 정렬을 변경하지 마세요.

4. **스마트 불릿 선별 (Smart Selection Logic)**:
   - 가장 **영향력 있는(Impactful)** 성과를 우선순위로 선별하세요.
   - **우선순위 1**: 구체적인 수치(Metrics)가 포함된 성과 (예: "92% 성능 개선", "매출 10억 달성")
   - **우선순위 2**: 리더십, 프로젝트 주도, 프로세스 개선 경험
   - **선별 개수**: 각 회사당 **가장 중요한 3~5개**의 불릿만 남기세요.
   - **중요하지 않은 단순 업무(daily tasks)는 과감히 삭제하세요.**

5. **한글 불릿 압축 (간결하게)**:
   - 각 불릿은 **1-2줄 최대**로 작성하세요.
   - 배경 설명, 문제 상황 나열은 삭제하세요.
   - 과정보다 **결과와 임팩트**에 집중하세요.

**입력 데이터:**
${JSON.stringify(extractedData, null, 2)}

**출력 형식:**
정제된 한글 데이터를 반환하세요. (영문 필드 없음)

**⚠️ 주의: 아래 사항을 반드시 확인하세요:**
- 입력 데이터의 모든 회사가 출력에 포함되어 있는가?
- company_name_kr 값이 변경되지 않았는가?
- 정렬 순서가 유지되었는가?

\`\`\`json
{
  "personal_info": { ... },
  "professional_summary_kr": "...",
  "work_experiences": [
    {
      "company_name_kr": "... (입력 데이터와 동일하게 유지)",
      "role_kr": "...",
      "start_date": "...",
      "end_date": "...",
      "bullets_kr": ["... (선별된 3~5개 항목)"]
    }
  ],
  "educations": [...],
  "skills": [...],
  "certifications": [...],
  "awards": [...],
  "languages": [...]
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

4. **성과 중심 번역 (Action Verbs)**:
   - 모든 불릿 포인트는 강렬한 Action Verb로 시작하세요
   - 구조: [Action Verb] + [What you did] + [Quantifiable Result/Impact]

5. **간결하게 번역**:
   - 각 불릿은 1-2줄 최대 (약 100-150자)
   - 한국식 장황한 설명은 제거하고 핵심 성과만 남기세요

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
  "educations": [...],
  "skills": ["..."],
  "certifications": [...],
  "awards": [...],
  "languages": [...]
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
