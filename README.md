# 지원고고 (ApplyGogo)

> 한국어 이력서를 글로벌 스탠다드 영문 이력서로 변환하는 AI 기반 Micro SaaS

## ✨ 주요 기능

- 🎨 **다크모드 지원** - 시스템 설정 자동 연동 또는 수동 전환
- 🌍 **랜딩페이지** - Vercel/Linear 스타일의 모던한 디자인
- 🔐 **Google OAuth** - 간편한 소셜 로그인
- 📊 **대시보드** - 이력서 관리 및 상태 추적
- 💳 **구독 시스템** - Free/Standard/Pro 플랜
- 📱 **완전 반응형** - 모바일부터 데스크톱까지

## 🎨 테마 커스터마이징

지원고고는 쉬운 테마 변경을 지원합니다!

### 테마 전환 방법

자세한 가이드는 **[THEME_GUIDE.md](./THEME_GUIDE.md)** 파일을 참고하세요.

### 빠른 시작

1. `/src/styles/theme.css` 파일 열기
2. `:root` 섹션에서 라이트 모드 색상 변경
3. `.dark` 섹션에서 다크 모드 색상 변경

```css
:root {
  --primary: #2563eb; /* 원하는 색상으로 변경 */
  --background: #ffffff;
  /* ... */
}
```

### 사전 정의된 테마

- 🔵 **블루 테마** - 기본 테마
- 🟣 **퍼플 테마** - 고급스러운 느낌
- 🟢 **그린 테마** - 친환경적 이미지

자세한 코드는 THEME_GUIDE.md에서 확인하세요!

## 🚀 기술 스택

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS v4, CSS Variables
- **UI Components**: Radix UI, Shadcn UI
- **Icons**: Lucide React
- **Theme**: next-themes

## 📦 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 🎯 프로젝트 구조

```
src/
├── app/
│   ├── components/
│   │   ├── ui/              # 재사용 가능한 UI 컴포넌트
│   │   ├── landing-page.tsx # 랜딩페이지
│   │   ├── login-page.tsx   # 로그인 페이지
│   │   ├── dashboard-layout.tsx
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx # 다크모드 토글
│   └── App.tsx
├── styles/
│   ├── theme.css            # 🎨 테마 설정 파일
│   ├── tailwind.css
│   └── index.css
└── lib/
    └── utils.ts
```

## 🎨 디자인 철학

Vercel과 Linear에서 영감을 받은 **미니멀 & 모던** 디자인:

- ✅ 깔끔한 타이포그래피
- ✅ 모노크롬 + 액센트 색상
- ✅ 여백을 활용한 시각적 계층
- ✅ 부드러운 마이크로 인터랙션

## 📄 라이선스

MIT License

## 👨‍💻 개발자

지원고고 개발팀

---

**문의사항이 있으시면 이슈를 남겨주세요!** 🚀
