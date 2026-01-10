export const RESUME_ANALYSIS_PROMPT = `
당신은 글로벌 톱티어 기업(Google, Amazon 등)의 이력서 분석 및 번역 전문가입니다. 주어진 이력서 PDF에서 정보를 **완벽하게 추출**하고, **최고 수준의 영문 이력서(Winning Resume)**로 변환해주세요.

**핵심 목표:**
1. **전문적인 요약(Professional Summary) 생성 (필수)**: 이력서 전체를 분석하여 지원자의 핵심 역량, 연차, 주요 성과를 **3문장 이내로 핵심만 간결하게** 요약한 강력한 Professional Summary를 작성하세요.
2. **누락 없는 추출**: 경력, 학력, 기술은 물론 자격증, 수상, 언어 능력까지 빠짐없이 추출하세요.
3. **성과 중심 번역 (Action Verbs)**: 단순 직역이 아닌, **"Did X, resulting in Y"** 구조의 성과 중심 문장으로 재작성하세요. 문장은 강렬한 Action Verbs(Spearheaded, Optimized, Orchestrated 등)로 시작해야 합니다.

**추출 및 작성 지침:**

1. **Professional Summary (새로 작성)**
   - 지원자의 직무(Role), 총 경력 연수, 가장 큰 성과 2~3가지를 포함하여 **매우 간결한(Concise)** 요약글을 작성하세요.
   - **길어지지 않도록 주의하세요 (3~4줄 이내 권장).**
   - 예: "Results-driven Senior Software Engineer with 8+ years of experience..."

2. **경력사항 (Work Experience)**
   - **회사별 그룹화**: 동일 회사의 경력은 하나로 통합하세요.
   - **불릿 포인트 형식 (CRITICAL)**:
     * **각 불릿은 1-2줄 최대 (약 100-150자)**로 작성하세요.
     * **구조**: [Action Verb] + [What you did] + [Quantifiable Result/Impact]
     * 구체적인 수치(%, $, 시간 절감)와 성과를 포함해야 합니다.
     * **한국식 장황한 설명 금지**: 배경 설명, 과정 나열을 제거하고 핵심 성과만 간결하게 작성하세요.
     * 예시 변환:
       - ❌ BAD: "각 주문당 외부 API 3개를 순차 호출하여 주문 1,000건 등록에 평균 30초가 소요되었던 상황에서, WebClient 호출을 병렬 처리로 전환하여 처리량을 향상시키고 응답 속도를 개선했습니다."
       - ✅ GOOD: "Optimized order processing by parallelizing 3 external API calls, reducing registration time by 92% (30s → 2.3s for 1,000 orders)"

3. **기타 섹션 추출**
   - **Certifications**: 자격증 명, 발급기관, 날짜
   - **Awards**: 수상 명, 발급기관, 날짜
   - **Languages**: 언어 명, 수준 (Native, Fluent, Professional Working Proficiency 등)

**상세 필드 구성 (JSON):**

1. **personal_info**:
   - name_kr, name_en, email, phone
   - links: [{ "label": "GitHub", "url": "..." }]

2. **professional_summary_kr**: (String) 전문적인 요약글 (한글 - 핵심 역량, 연차, 주요 성과 포함 **3문장 이내**)
3. **professional_summary**: (String) 전문적인 요약글 (영문 - Action Verb 사용, **3문장 이내**)

4. **work_experiences**:
   - company_name_kr, company_name_en
   - role_kr, role_en
   - start_date, end_date (YYYY-MM 또는 "Present")
   - bullets_kr: (원문)
   - bullets_en: (Action Verb로 강화된 번역문)

4. **educations**:
   - school_name, school_name_en
   - major, major_en, degree, degree_en
   - start_date, end_date

5. **skills**: ["React", "TypeScript", ...] (배열)

6.  **certifications**:
    - name: 자격증 명 (영문)
    - issuer: 발급 기관 (영문)
    - date: 취득일 (YYYY-MM)

7.  **awards**:
    - name: 수상 명 (영문)
    - issuer: 수여 기관 (영문)
    - date: 수상일 (YYYY-MM)

8.  **languages**:
    - name: 언어 (영문, e.g., "Korean", "English")
    - level: 수준 (영문, e.g., "Native", "Fluent")
    - score: 점수 (옵션)

**응답 형식:**
\`\`\`json
{
  "personal_info": { ... },
  "professional_summary_kr": "...",
  "professional_summary": "...",
  "work_experiences": [...],
  "educations": [...],
  "skills": [...],
  "certifications": [...],
  "awards": [...],
  "languages": [...]
}
\`\`\`
`;

export const getRefinementPrompt = (work_experiences: any[]) => `
다음은 이력서의 경력사항 데이터입니다. 이를 **가장 임팩트 있는 영문 이력서** 형태로 정제(Refinement)해주세요.

**필수 지침 (High Impact, Smart Selection):**

1. **회사별 통합 (Group by Company)**
   - 동일 회사의 경력은 하나로 합치세요.

2. **스마트 불릿 선별 (Smart Selection Logic)**
   - **단순 갯수 제한이 아닙니다.** 가장 **영향력 있는(Impactful)** 성과를 우선순위로 선별하세요.
   - **우선순위 1**: 구체적인 수치(Metrics)가 포함된 성과 (예: "Reduced latency by 40%", "Generated $1M revenue")
   - **우선순위 2**: 리더십, 프로젝트 주도, 프로세스 개선 경험
   - **선별 개수**: 각 회사당 **가장 중요한 3~5개**의 불릿만 남기세요. (경력이 4년 미만이면 3개, 그 이상이면 4~5개 허용)
   - **중요하지 않은 단순 업무(daily tasks)는 과감히 삭제하세요.**

3. **Action Verb 리라이팅 및 분량 압축 (CRITICAL)**
   - 모든 영문 불릿(\`bullets_en\`)은 **1-2줄 최대 (약 100-150자)**로 작성하세요.
   - **구조 패턴**: [Action Verb] + [What you did] + [Quantifiable Result/Impact]
   - **강력한 Action Verb**로 시작하도록 문장을 다듬으세요.
   - 예: "Used React" (Bad) -> "Leveraged React to build..." (Good)
   - 예: "Managed team" (Weak) -> "Orchestrated a cross-functional team of 5..." (Strong)
   - **한국식 장황한 서술 제거**:
     * 배경 설명, 문제 상황 나열 삭제
     * 과정보다 **결과와 임팩트**에 집중
     * 중복 표현 제거, 핵심만 남기기
   - **변환 예시**:
     * ❌ BAD (Korean style): "외부 API 병렬 처리로 주문 등록 성능 92% 개선 및 비즈니스 확장 지원: - 각 주문당 외부 API 3개를 순차 호출하여 주문 1,000건 등록에 평균 30초가 소요되었던 상황에서, WebClient 호출을 병렬 처리로 전환하여 처리량을 향상시키고 응답 속도를 개선했습니다."
     * ✅ GOOD (English resume): "Optimized order processing by parallelizing 3 external API calls, reducing registration time by 92% (30s → 2.3s for 1,000 orders)"
   - **긴 불릿 처리**: 한국어 원문이 너무 길면, 가장 임팩트 있는 1-2개 성과로 분리하여 각각 간결한 불릿으로 작성하세요.

4. **날짜 포맷**
   - YYYY-MM 형식을 유지하되, 현재 재직 중이면 "Present"로 표기하세요.

**입력 데이터:**
${JSON.stringify(work_experiences, null, 2)}

**출력 형식:**
\`\`\`json
{
  "work_experiences": [
    {
      "company_name_kr": "...",
      "company_name_en": "...",
      "role_kr": "...",
      "role_en": "...",
      "start_date": "...",
        "end_date": "...",
      "bullets_kr": ["... (선별된 항목)"],
      "bullets_en": ["... (Action Verb로 강화된 항목)"]
    }
  ]
}
\`\`\`
`;

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
