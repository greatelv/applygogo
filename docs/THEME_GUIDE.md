# 지원고고 테마 커스터마이징 가이드

## 📌 개요

지원고고는 **CSS 변수 기반 테마 시스템**을 사용하여 쉽게 색상과 스타일을 변경할 수 있습니다.
모든 테마 설정은 `/src/styles/theme.css` 파일에서 관리됩니다.

## 🎨 테마 변경 방법

### 1. 기본 구조 이해

`theme.css` 파일은 두 가지 테마를 정의합니다:

- `:root` - 라이트 모드 (기본)
- `.dark` - 다크 모드

```css
:root {
  --background: #ffffff;
  --foreground: oklch(0.145 0 0);
  /* ... */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... */
}
```

### 2. 주요 색상 변수

#### 🔹 기본 색상

- `--background` - 페이지 배경색
- `--foreground` - 기본 텍스트 색상
- `--border` - 테두리 색상
- `--ring` - 포커스 링 색상

#### 🔹 컴포넌트 색상

- `--card` / `--card-foreground` - 카드 배경 및 텍스트
- `--popover` / `--popover-foreground` - 팝오버 배경 및 텍스트
- `--primary` / `--primary-foreground` - 주요 버튼 및 강조 요소
- `--secondary` / `--secondary-foreground` - 보조 버튼
- `--muted` / `--muted-foreground` - 비활성화/보조 텍스트
- `--accent` / `--accent-foreground` - 호버 및 강조 영역
- `--destructive` / `--destructive-foreground` - 경고/삭제 버튼

### 3. 커스텀 테마 만들기

#### 예제 1: 블루 테마 (Blue Theme)

```css
:root {
  --background: #ffffff;
  --foreground: #0a0a0a;
  --primary: #2563eb; /* Blue-600 */
  --primary-foreground: #ffffff;
  --secondary: #dbeafe; /* Blue-100 */
  --secondary-foreground: #1e40af; /* Blue-800 */
  --accent: #eff6ff; /* Blue-50 */
  --accent-foreground: #1e3a8a;
  --border: #e5e7eb;
  --muted: #f3f4f6;
  --muted-foreground: #6b7280;
}

.dark {
  --background: #0a0a0a;
  --foreground: #f5f5f5;
  --primary: #3b82f6; /* Blue-500 */
  --primary-foreground: #ffffff;
  --secondary: #1e3a8a; /* Blue-900 */
  --secondary-foreground: #dbeafe;
  --accent: #1e293b;
  --accent-foreground: #f5f5f5;
  --border: #27272a;
  --muted: #1e293b;
  --muted-foreground: #94a3b8;
}
```

#### 예제 2: 퍼플 테마 (Purple Theme)

```css
:root {
  --background: #ffffff;
  --foreground: #0a0a0a;
  --primary: #9333ea; /* Purple-600 */
  --primary-foreground: #ffffff;
  --secondary: #f3e8ff; /* Purple-100 */
  --secondary-foreground: #6b21a8; /* Purple-800 */
  --accent: #faf5ff; /* Purple-50 */
  --accent-foreground: #581c87;
  --border: #e5e7eb;
  --muted: #f3f4f6;
  --muted-foreground: #6b7280;
}

.dark {
  --background: #0a0a0a;
  --foreground: #f5f5f5;
  --primary: #a855f7; /* Purple-500 */
  --primary-foreground: #ffffff;
  --secondary: #581c87; /* Purple-900 */
  --secondary-foreground: #f3e8ff;
  --accent: #1e1b4b;
  --accent-foreground: #f5f5f5;
  --border: #27272a;
  --muted: #1e1b4b;
  --muted-foreground: #94a3b8;
}
```

#### 예제 3: 그린 테마 (Green Theme)

```css
:root {
  --background: #ffffff;
  --foreground: #0a0a0a;
  --primary: #16a34a; /* Green-600 */
  --primary-foreground: #ffffff;
  --secondary: #dcfce7; /* Green-100 */
  --secondary-foreground: #14532d; /* Green-900 */
  --accent: #f0fdf4; /* Green-50 */
  --accent-foreground: #15803d;
  --border: #e5e7eb;
  --muted: #f3f4f6;
  --muted-foreground: #6b7280;
}

.dark {
  --background: #0a0a0a;
  --foreground: #f5f5f5;
  --primary: #22c55e; /* Green-500 */
  --primary-foreground: #ffffff;
  --secondary: #14532d; /* Green-900 */
  --secondary-foreground: #dcfce7;
  --accent: #1e293b;
  --accent-foreground: #f5f5f5;
  --border: #27272a;
  --muted: #1e293b;
  --muted-foreground: #94a3b8;
}
```

### 4. 적용 방법

1. `/src/styles/theme.css` 파일을 엽니다
2. `:root` 섹션에서 라이트 모드 색상을 변경합니다
3. `.dark` 섹션에서 다크 모드 색상을 변경합니다
4. 브라우저를 새로고침하여 변경사항을 확인합니다

### 5. 고급 커스터마이징

#### 폰트 크기 변경

```css
:root {
  --font-size: 16px; /* 기본값 */
  --text-2xl: 1.5rem;
  --text-xl: 1.25rem;
  --text-lg: 1.125rem;
  --text-base: 1rem;
}
```

#### 테두리 반경 (Rounded Corners)

```css
:root {
  --radius: 0.625rem; /* 기본값 (10px) */
}

/* 더 둥글게 */
:root {
  --radius: 1rem; /* 16px */
}

/* 덜 둥글게 */
:root {
  --radius: 0.375rem; /* 6px */
}

/* 각지게 */
:root {
  --radius: 0;
}
```

## 🎯 색상 선택 팁

### 1. OKLCH 색상 사용 (권장)

OKLCH는 모던 브라우저에서 지원하는 색상 포맷으로, 더 일관된 밝기를 제공합니다.

```css
/* OKLCH 형식: oklch(명도 채도 색조) */
--primary: oklch(0.5 0.2 250); /* 파란색 */
--primary: oklch(0.6 0.25 320); /* 보라색 */
--primary: oklch(0.55 0.22 140); /* 녹색 */
```

### 2. HEX 색상 사용

일반적인 HEX 코드도 사용 가능합니다.

```css
--primary: #3b82f6;
--background: #ffffff;
--border: rgba(0, 0, 0, 0.1);
```

### 3. 색상 대비 확인

접근성을 위해 텍스트와 배경의 대비가 **4.5:1 이상**이 되도록 해주세요.

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Coolors Contrast Checker](https://coolors.co/contrast-checker)

## 🔧 다크모드 자동 전환

사용자의 시스템 설정을 따르거나 수동으로 전환 가능합니다:

```tsx
// App.tsx에서 설정
<ThemeProvider
  attribute="class"
  defaultTheme="system"  // "light" | "dark" | "system"
  enableSystem
>
```

## 📦 사전 정의된 테마 프리셋

지원고고는 여러 테마를 쉽게 전환할 수 있도록 설계되었습니다.
`/src/styles/theme.css` 파일을 백업하고 위의 예제를 복사하여 붙여넣으면 됩니다.

### 적용 순서

1. 기존 `theme.css` 백업 (예: `theme.css.backup`)
2. 원하는 테마 예제를 복사하여 `theme.css`의 `:root`와 `.dark` 섹션에 붙여넣기
3. 브라우저 새로고침
4. 마음에 들지 않으면 백업 파일 복원

## 💡 자주 묻는 질문

### Q1: 색상을 변경했는데 반영이 안 돼요

- 브라우저 캐시를 삭제하고 새로고침해보세요 (Ctrl + Shift + R)
- CSS 파일 저장을 확인하세요

### Q2: 일부 컴포넌트만 색상을 변경하고 싶어요

- 특정 컴포넌트 파일에서 Tailwind 클래스로 오버라이드 가능합니다
- 예: `className="bg-blue-500 text-white"`

### Q3: 기업 브랜드 색상을 적용하고 싶어요

- `--primary` 변수에 브랜드 색상을 설정하세요
- `--primary-foreground`는 primary 위에 올라갈 텍스트 색상입니다

### Q4: 3개 이상의 테마를 만들 수 있나요?

- 네! 예를 들어 `.blue-theme`, `.green-theme` 클래스를 추가로 만들 수 있습니다
- ThemeProvider의 설정을 변경하여 추가 테마를 활성화할 수 있습니다

## 🎨 디자인 철학

지원고고는 **Vercel과 Linear**에서 영감을 받은 미니멀 디자인을 추구합니다:

- ✅ 깔끔한 타이포그래피
- ✅ 모노크롬 + 액센트 색상
- ✅ 여백을 활용한 시각적 계층
- ✅ 부드러운 마이크로 인터랙션

테마를 변경할 때도 이 철학을 유지하면 더 세련된 결과를 얻을 수 있습니다!

---

**문의사항이 있으시면 이슈를 남겨주세요!** 🚀
