## 경력 데이터 미표시 문제 해결 가이드

### 문제 상황

- 편집 화면과 템플릿 화면에서 경력(work_experiences)이 표시되지 않음
- API 응답에서 `work_experiences: []` (빈 배열)
- 데이터베이스에 경력 데이터가 저장되지 않음

### 원인 분석

이력서 처리 과정은 다음 3단계를 거칩니다:

1. **Extract (추출)**: PDF에서 데이터 추출
2. **Refine (정제)**: 데이터 정제 및 중복 제거
3. **Translate (번역)**: 번역 및 데이터베이스 저장

문제는 다음 중 하나일 수 있습니다:

- Extract 단계에서 경력 데이터를 찾지 못함
- Refine 단계에서 데이터가 필터링됨
- Translate 단계에서 저장 실패

### 해결 방법

#### 방법 1: 이력서 재처리 (권장)

1. 이력서 목록으로 이동: http://localhost:3000/ko/resumes
2. 문제가 있는 이력서 삭제
3. 이력서를 다시 업로드하여 처리

#### 방법 2: 수동으로 경력 추가

1. 편집 화면으로 이동: http://localhost:3000/ko/resumes/d036287c-aa31-4823-96ba-2e9e57c206b1/edit
2. "경력" 섹션에서 "+ 항목 추가" 버튼 클릭
3. 경력 정보를 수동으로 입력
4. 저장 후 템플릿 선택

#### 방법 3: 디버깅 (개발자용)

터미널에서 다음 명령어로 로그 확인:

```bash
# 개발 서버 재시작하여 로그 확인
pnpm dev
```

이력서를 다시 업로드하면서 터미널에서 다음 로그를 확인:

- `[Extract API] Complete. Found X experiences`
- `[Refine API] Complete. X companies, Y bullets selected`
- `[Translate API] All data saved successfully`

### 예상 결과

- Extract 단계에서 경력을 찾지 못했다면: "Found 0 experiences"
- 정상적으로 처리되었다면: "Found 3 experiences, 15 total bullets" 등

### 추가 확인사항

- 업로드한 PDF가 올바른 형식인지 확인
- PDF에 실제로 경력 정보가 포함되어 있는지 확인
- PDF가 스캔본이 아닌 텍스트 기반 PDF인지 확인
