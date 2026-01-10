export const RESUME_ANALYSIS_PROMPT = `
당신은 **이력서 데이터 추출 및 영문 번역 전문가**입니다. 주어진 이력서 PDF에서 정보를 **정확하게 추출**하고, 영문 이력서로 번역해주세요.

**핵심 원칙 (CRITICAL):**
1. **정확한 추출이 최우선**: 회사명, 학교명 등 고유명사는 **절대 추론하거나 변경하지 마세요**. PDF에 적힌 그대로 추출하세요.
2. **추출 → 번역 순서 엄수**: 먼저 한글 원문을 정확히 추출한 후, 그것을 영문으로 번역하세요.
3. **성과 중심 번역**: 번역 시에는 강렬한 Action Verbs를 사용하여 성과 중심으로 재작성하세요.
4. **중복 제거 (Strict De-duplication)**: PDF 내에서 정보가 중복될 경우(예: 요약 섹션과 세부 섹션에 동일 내용 반복), 반드시 하나로 합쳐 유니크하게 추출하세요. 사용자가 중복된 데이터를 직접 삭제해야 하는 번거로움을 방지하기 위함입니다.
5. **최근 이력순 나열 (Reverse Chronological Order)**: 모든 경력(\`work_experiences\`) 및 학력(\`educations\`) 배열은 **가장 최근의 사건이 첫 번째 요소(Index 0)**가 되도록 시간 역순으로 정렬하세요. 이는 표준적인 이력서 양식을 따르고 사용자의 최신 전문성을 가장 먼저 노출하기 위함입니다.

**핵심 목표:**
1. **전문적인 요약(Professional Summary) 생성 (필수)**: 이력서 전체를 분석하여 지원자의 핵심 역량, 연차, 주요 성과를 **3문장 이내로 핵심만 간결하게** 요약한 강력한 Professional Summary를 작성하세요.
2. **누락 없는 추출**: 경력, 학력, 기술은 물론 자격증, 수상, 언어 능력까지 빠짐없이 추출하세요.
3. **성과 중심 번역 (Action Verbs)**: 단순 직역이 아닌, **"Did X, resulting in Y"** 구조의 성과 중심 문장으로 재작성하세요. 문장은 강렬한 Action Verbs(Developed, Optimized, Led 등)로 시작해야 합니다.

**추출 및 작성 지침:**

1. **Professional Summary (새로 작성)**
   - **분량 제한 (CRITICAL)**: 
     * 영문: **50-70 단어 (약 3줄)** 엄수
     * 한글: **100-120자 (약 2-3문장)** 엄수
   - **구조 (필수)**: [직무 + 연차] + [핵심 전문 분야] + [가장 큰 성과 1-2개 with 수치] + [기술 스택/열정]
   - **작성 원칙**:
     * **불필요한 수식어 제거**: "~경험을 보유하고 있습니다", "~강점을 가지며" 같은 표현 금지
     * **구체적인 수치 필수**: %, 시간 절감, 성장률 등 반드시 포함
     * **기술 나열 금지**: 3개 이상 나열하지 말고 핵심 1-2개만
     * **간결하고 강렬하게**: 각 문장은 핵심만 담아 짧고 임팩트 있게
   - **변환 예시**:
     * ❌ BAD (장황함): "백엔드 소프트웨어 엔지니어로, 분산 시스템 환경에서 발생하는 이슈를 기술적 특성에 기반하여 해결해온 경험을 보유하고 있습니다. 특히 API 병렬 처리, 메시지 큐 기반 시스템 구축, 대용량 데이터 처리 시스템 설계 및 구현에 강점을 가지며..."
     * ✅ GOOD (간결함): "Backend Software Engineer with 4+ years specializing in distributed systems. Improved order processing performance by 92% through API parallelization and message queue optimization. Passionate about building scalable systems and test-driven development."

2. **경력사항 (Work Experience)**
   - **회사별 그룹화**: 동일 회사의 경력은 하나로 통합하세요.
   - **회사명 추출 (CRITICAL - 정확성 최우선)**:
     * **절대 추론하거나 변경하지 마세요**: PDF에 적힌 회사명을 **정확히 그대로** 추출하세요.
     * 예: PDF에 "컬리"라고 적혀있으면 → company_name_kr: "컬리" (❌ "쿠팡" 아님)
     * 예: PDF에 "당근마켓"이라고 적혀있으면 → company_name_kr: "당근마켓" (❌ "Karrot" 아님)
     * **영문 회사명**: 공식 영문명이 명확하면 사용, 없으면 한글을 로마자 표기 (예: "컬리" → "Kurly")
     * **절대 유사 회사로 대체하지 마세요**: AI가 임의로 판단하여 다른 회사명으로 바꾸는 것을 엄격히 금지합니다.
   - **불릿 포인트 형식 (CRITICAL)**:
     * **추출 개수 (IMPORTANT)**: 각 회사당 **모든 주요 성과를 빠짐없이 추출**하세요 (목표: 5~7개).
       - PDF에 기술된 업무 성과를 **최대한 많이** 추출하세요. 이후 Refinement 단계에서 선별됩니다.
       - **절대 이 단계에서 필터링하지 마세요**: 중요도 판단은 Refinement 단계에서 수행합니다.
       - 업무 내용이 정말 적은 경우(1~2년 미만 경력)에만 3~4개로 제한하세요.
     * **각 불릿은 1-2줄 최대 (약 100-150자)**로 작성하세요.
     * **구조**: [Action Verb] + [What you did] + [Quantifiable Result/Impact]
     * 구체적인 수치(%, $, 시간 절감)와 성과를 포함해야 합니다.
     * **한국식 장황한 설명 금지**: 배경 설명, 과정 나열을 제거하고 핵심 성과만 간결하게 작성하세요.
     * 예시 변환:
       - ❌ BAD: "각 주문당 외부 API 3개를 순차 호출하여 주문 1,000건 등록에 평균 30초가 소요되었던 상황에서, WebClient 호출을 병렬 처리로 전환하여 처리량을 향상시키고 응답 속도를 개선했습니다."
       - ✅ GOOD: "Optimized order processing by parallelizing 3 external API calls, reducing registration time by 92% (30s → 2.3s for 1,000 orders)"

3. **학력사항 (Education)**
   - **학교명 추출 (CRITICAL - 정확성 최우선)**:
     * PDF에 적힌 학교명을 **정확히 그대로** 추출하세요.
     * 예: "서울대학교" → school_name: "서울대학교", school_name_en: "Seoul National University"
     * 예: "한양대학교" → school_name: "한양대학교", school_name_en: "Hanyang University"
     * **절대 다른 학교로 추론하지 마세요**.

4. **기타 섹션 추출**
   - **Skills (기술 스택)**:
     * **개수 제한 (CRITICAL)**: **최대 10개 미만**으로 엄격히 제한하세요.
     * **우선순위 기준 (IMPORTANT)**:
       1. **중요도**: 이력서에서 가장 많이 사용되고 강조된 기술
       2. **보편성**: 해당 직무에서 널리 인정받는 주요 기술 스택
       3. **최신성**: 최근 경력에서 사용된 기술 우선
     * **추출 원칙**:
       - 프로그래밍 언어, 프레임워크, 주요 도구/플랫폼 중심으로 추출
       - 너무 세부적이거나 보편적이지 않은 기술은 제외
       - 유사 기술은 대표 기술 하나로 통합 (예: "React.js"와 "React" → "React")
     * **예시**:
       - ✅ GOOD: ["JavaScript", "TypeScript", "React", "Node.js", "AWS", "Docker", "PostgreSQL", "Git"]
       - ❌ BAD (너무 많음): ["JavaScript", "TypeScript", "React", "Next.js", "Vue", "Node.js", "Express", "NestJS", "AWS", "Docker", "Kubernetes", "PostgreSQL", "MongoDB", "Redis", "Git", "GitHub Actions"]
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
