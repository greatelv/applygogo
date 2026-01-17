# 🌏 지원고고 다국어 지원 - AI 프로세싱 및 SEO 전략 (추가 문서)

> **연결 문서**: `i18n-separate-tables-plan.md`  
> **작성일**: 2026-01-17

---

## 🤖 AI 프로세싱 3단계 워크플로우

### 핵심 차이점: 한국향 vs 다국어

**한국향 (기존)**:

- 1단계 프로세싱: PDF 추출 + 번역 동시 진행
- 목표: 한국어 → 영어 (어필 톤)

**다국어 (신규)**:

- 3단계 프로세싱: 추출 → 번역 → 정제
- 목표: 영어/일본어 → 한국어 (겸손한 톤)

---

### Stage 1: 추출 (Extract)

**목적**: PDF에서 구조화된 데이터 추출 + 언어 자동 감지

```typescript
// src/lib/ai/extract.ts
export async function extractResumeData(pdfUrl: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `
    Extract structured data from this resume PDF.
    
    CRITICAL TASKS:
    1. **Detect Language**: Identify the primary language (English or Japanese)
    2. **Extract Structure**: Parse into sections (personal info, experience, education, skills)
    3. **Preserve Original**: Keep all text in original language
    
    Return JSON format:
    {
      "detectedLanguage": "en" | "ja",
      "confidence": 0.95,
      "personalInfo": { "name": "...", "email": "...", "phone": "..." },
      "workExperiences": [...],
      "educations": [...],
      "skills": [...]
    }
  `;

  const result = await model.generateContent([prompt, pdfFile]);
  const extracted = JSON.parse(result.response.text());

  // 🔍 언어 감지 검증
  if (extracted.detectedLanguage !== expectedLocale) {
    throw new Error(
      `Language mismatch: expected ${expectedLocale}, detected ${extracted.detectedLanguage}`,
    );
  }

  return extracted;
}
```

**저장**:

```typescript
await prisma.globalResume.create({
  data: {
    userId,
    sourceLocale: "en", // 사용자가 선택한 경로
    detectedLocale: extracted.detectedLanguage, // AI가 감지한 언어
    name_original: extracted.personalInfo.name,
    // ... 원본 데이터 저장
  },
});
```

---

### Stage 2: 번역 (Translate)

**목적**: 원본 언어 → 한국어 직역

```typescript
// src/lib/ai/translate.ts
export async function translateToKorean(
  originalData: ExtractedResume,
  sourceLocale: "en" | "ja",
) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt =
    sourceLocale === "en"
      ? ENGLISH_TO_KOREAN_TRANSLATION_PROMPT
      : JAPANESE_TO_KOREAN_TRANSLATION_PROMPT;

  const result = await model.generateContent(
    prompt.replace("{content}", JSON.stringify(originalData)),
  );

  return JSON.parse(result.response.text());
}

const ENGLISH_TO_KOREAN_TRANSLATION_PROMPT = `
Translate this English resume to Korean.

REQUIREMENTS:
- Direct translation (not adaptation yet)
- Maintain professional tone
- Preserve all numbers and dates
- Keep technical terms in English if commonly used in Korea

Source Data:
{content}

Return JSON with translated fields.
`;
```

**저장**:

```typescript
await prisma.globalResume.update({
  where: { id: resumeId },
  data: {
    name_translated: translated.personalInfo.name,
    summary_translated: translated.summary,
    // ... 번역된 데이터 저장
  },
});
```

---

### Stage 3: 정제 (Refine)

**목적**: 한국 기업 문화에 맞게 톤 조정 및 최적화

```typescript
// src/lib/ai/refine.ts
export async function refineForKoreanCulture(translatedData: TranslatedResume) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `
    Refine this Korean resume for Korean corporate culture.
    
    CRITICAL REQUIREMENTS:
    1. **Humble Tone**: Convert assertive statements to humble expressions
       - "Led team of 10" → "10명 규모의 팀에서 협업하며 프로젝트를 진행했습니다"
       - "Increased revenue by 30%" → "매출 30% 증가에 기여했습니다"
    
    2. **Team Focus**: Emphasize collaboration over individual achievement
       - "I developed..." → "팀과 함께 개발했습니다"
    
    3. **Formal Language**: Use 존댓말 (formal Korean)
       - "했다" → "했습니다"
    
    4. **Korean Resume Format**:
       - Education section FIRST
       - Add "학력" (Education) header
       - Use Korean date format (YYYY.MM)
    
    5. **Cultural Adaptation**:
       - Remove overly promotional language
       - Add context for foreign companies/universities
       - Translate job titles to Korean equivalents
    
    Translated Resume:
    ${JSON.stringify(translatedData)}
    
    Return refined JSON.
  `;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}
```

**최종 저장**:

```typescript
await prisma.globalResume.update({
  where: { id: resumeId },
  data: {
    summary_translated: refined.summary, // 정제된 요약
    status: "COMPLETED",
    current_step: "EDIT_TRANSLATION",
  },
});

// WorkExperience도 정제된 버전으로 업데이트
await prisma.globalWorkExperience.updateMany({
  where: { resumeId },
  data: refined.workExperiences.map((exp) => ({
    bullets_translated: exp.bullets, // 정제된 업무 내용
  })),
});
```

---

### 전체 워크플로우 통합

```typescript
// src/lib/ai/process-global-resume.ts
export async function processGlobalResume(
  resumeId: string,
  pdfUrl: string,
  sourceLocale: "en" | "ja",
) {
  try {
    // Stage 1: 추출
    await updateResumeStatus(resumeId, "PROCESSING", "추출 중...");
    const extracted = await extractResumeData(pdfUrl, sourceLocale);

    // 언어 감지 검증
    if (extracted.detectedLanguage !== sourceLocale) {
      throw new Error(
        `언어 불일치: ${sourceLocale} 예상, ${extracted.detectedLanguage} 감지`,
      );
    }

    // Stage 2: 번역
    await updateResumeStatus(resumeId, "PROCESSING", "번역 중...");
    const translated = await translateToKorean(extracted, sourceLocale);

    // Stage 3: 정제
    await updateResumeStatus(resumeId, "PROCESSING", "정제 중...");
    const refined = await refineForKoreanCulture(translated);

    // 최종 저장
    await saveRefinedResume(resumeId, refined);
    await updateResumeStatus(resumeId, "COMPLETED", null);

    // 크레딧 차감
    await deductCredits(userId, 5, "Global Resume AI Processing (3-stage)");
  } catch (error) {
    await updateResumeStatus(resumeId, "FAILED", error.message);
    throw error;
  }
}
```

---

## 🔍 SEO 전략: 한국 취업 키워드 타겟팅

### 목표

외국인이 "한국 취업", "한국 이력서" 등을 검색할 때 `/en`, `/ja` 페이지가 상위 노출

---

### 영어 SEO 키워드

**Primary Keywords**:

- Jobs in Korea for foreigners
- Korean resume format
- Korea job application
- Working in Korea
- Korea employment visa

**Long-tail Keywords**:

- How to write a Korean resume
- Korean resume template for foreigners
- English to Korean resume translation
- Korea job search for expats
- Korean company resume requirements

**메타데이터**:

```typescript
// src/app/[locale]/page.tsx (locale = 'en')
export const metadata: Metadata = {
  title:
    "ApplyGoGo - AI Resume Translation for Korean Jobs | Get Hired in Korea",
  description:
    "Transform your English resume into a Korean-style resume with AI. Perfect for foreigners seeking jobs in Korea. Instant translation, Korean format, cultural adaptation.",
  keywords: [
    "jobs in Korea",
    "Korean resume",
    "Korea job application",
    "English to Korean resume",
    "working in Korea",
    "Korea employment",
    "Korean company resume",
    "expat jobs Korea",
  ],
  openGraph: {
    title: "Get Hired in Korea - AI Resume Translation",
    description: "AI-powered resume translation for Korean job market",
    locale: "en_US",
  },
};
```

**콘텐츠 전략**:

```tsx
// 랜딩페이지 H1
<h1>Land Your Dream Job in Korea with AI-Powered Resume Translation</h1>

// H2
<h2>Why Korean Companies Need a Different Resume Format</h2>

// 본문 키워드 자연스럽게 포함
<p>
  Looking for <strong>jobs in Korea</strong>? Korean companies expect a specific
  <strong>resume format</strong> that differs from Western standards. Our AI
  automatically adapts your English resume to <strong>Korean corporate culture</strong>,
  increasing your chances of getting hired.
</p>
```

---

### 일본어 SEO 키워드

**Primary Keywords**:

- 韓国 就職 (한국 취업)
- 韓国 履歴書 (한국 이력서)
- 韓国 転職 (한국 이직)
- 韓国 求人 (한국 구인)
- 韓国 企業 採用 (한국 기업 채용)

**Long-tail Keywords**:

- 韓国で働く方法 (한국에서 일하는 방법)
- 韓国式履歴書の書き方 (한국식 이력서 작성법)
- 日本語から韓国語 履歴書翻訳 (일본어→한국어 이력서 번역)
- 韓国企業の採用文化 (한국 기업 채용 문화)

**메타데이터**:

```typescript
// src/app/[locale]/page.tsx (locale = 'ja')
export const metadata: Metadata = {
  title: "ApplyGoGo - AI韓国履歴書翻訳 | 韓国就職をサポート",
  description:
    "日本語の履歴書を韓国企業向けにAI翻訳。韓国式フォーマット、文化適応、即座に変換。韓国就職・転職をスムーズに。",
  keywords: [
    "韓国 就職",
    "韓国 履歴書",
    "韓国 転職",
    "韓国 求人",
    "韓国企業 採用",
    "韓国で働く",
    "履歴書 翻訳",
  ],
  openGraph: {
    title: "韓国就職をAIでサポート - 履歴書翻訳",
    description: "AI韓国履歴書翻訳で韓国就職を成功させよう",
    locale: "ja_JP",
  },
};
```

---

### Structured Data (JSON-LD)

```typescript
// src/app/[locale]/layout.tsx
export default function LocaleLayout({ params }: { params: { locale: string } }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": params.locale === 'en' ? "ApplyGoGo - Korea Job Resume AI" : "ApplyGoGo - 韓国就職AI",
    "description": params.locale === 'en'
      ? "AI-powered resume translation for Korean job market"
      : "AI韓国履歴書翻訳サービス",
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "Offer",
      "price": params.locale === 'en' ? "9" : "1200",
      "priceCurrency": params.locale === 'en' ? "USD" : "JPY",
    },
    "inLanguage": [params.locale, "ko"],
    "audience": {
      "@type": "Audience",
      "audienceType": "Job Seekers in Korea",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {children}
    </>
  );
}
```

---

### 블로그 콘텐츠 전략 (향후)

**영어 블로그 주제**:

1. "Complete Guide to Korean Resume Format for Foreigners"
2. "Top 10 Mistakes Foreigners Make on Korean Resumes"
3. "How to Adapt Your Western Resume for Korean Companies"
4. "Korea Work Visa Guide: E-7 vs E-9 Explained"
5. "Korean Corporate Culture: What Employers Look For"

**일본어 블로그 주제**:

1. "韓国企業が求める履歴書の書き方完全ガイド"
2. "日本と韓国の採用文化の違い"
3. "韓国就職ビザ取得ステップバイステップ"

---

## 📊 SEO 성과 측정

### Google Search Console 설정

```typescript
// public/robots.txt
User-agent: *
Allow: /
Allow: /en
Allow: /ja
Disallow: /api/
Disallow: /resumes/
Disallow: /global-resume/

Sitemap: https://applygogo.com/sitemap.xml
```

```typescript
// src/app/sitemap.ts
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://applygogo.com",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
      alternates: {
        languages: {
          ko: "https://applygogo.com",
          en: "https://applygogo.com/en",
          ja: "https://applygogo.com/ja",
        },
      },
    },
    {
      url: "https://applygogo.com/en",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://applygogo.com/ja",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];
}
```

### 추적 지표

**3개월 목표**:

- `/en` 페이지: "jobs in Korea" 키워드 Top 20
- `/ja` 페이지: "韓国 就職" 키워드 Top 20
- Organic 트래픽: 월 500 방문
- 전환율: 5% (방문 → 회원가입)

---

## 🎯 베타 테스트 전략

### 무제한 이용권 제공

**대상**: 모든 가입 유저
**기간**: 내일부터 (2026-01-18) ~ 베타 종료 시까지
**혜택**:

- 무제한 크레딧
- 모든 템플릿 접근
- 다국어 기능 전체 사용

**구현**:

```typescript
// src/lib/beta-access.ts
export function isBetaUser(user: User): boolean {
  // 모든 유저가 베타 유저
  return true;
}

export function getBetaCredits(user: User): number {
  if (isBetaUser(user)) {
    return 999999; // 무제한
  }
  return user.credits;
}

// API에서 사용
const availableCredits = getBetaCredits(user);
if (availableCredits < 5) {
  throw new Error("Insufficient credits");
}
```

**베타 종료 후**:

- 베타 기간 동안 생성한 이력서는 유지
- 정식 요금제로 전환
- 베타 유저에게 특별 할인 제공 (예: 30% 할인)

---

준비 완료! 🚀
