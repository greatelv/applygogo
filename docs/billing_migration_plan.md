# 청구 모델 전면 개편: 구독제에서 기간제 이용권으로 전환 (Full Stack + Credit Refill)

## 목표

정기 구독(Recurring Subscription) 모델을 "기간제 이용권(Pre-paid Pass, 기간+크레딧 기반)" 시스템으로 대체합니다. 백엔드 로직뿐만 아니라 프론트엔드 UI/UX도 전면 개편하여 사용자에게 "이용권 구매" 경험을 제공합니다.
**추가**: 크레딧 소진 시 단건 충전(Refill) 기능 구현.

## 검토 필요 사항

> [!IMPORTANT] > **데이터 마이그레이션**: 기존 `Subscription` 데이터는 폐기됩니다.
> **스키마 변경**: `Subscription` 모델 **삭제**, `User` 모델 필드 확장.

---

## 변경 제안

### 1. 데이터베이스 스키마 (Prisma)

#### [수정] `prisma/schema.prisma`

- **User 모델**:
  - `planType` 추가: `String` `@default('FREE')` // 'FREE', 'PASS_7DAY', 'PASS_30DAY'
  - `planExpiresAt` 추가: `DateTime?` // Null이면 만료됨/Free
  - `credits` 추가: `Int` `@default(15)` // 크레딧 지갑
- **삭제/폐기**:
  - `Subscription` 모델 전체 삭제
  - `Plan` 모델 전체 삭제
- **PaymentHistory**:
  - 기존 필드 유지하되, `orderName`으로 상품 구분 ('7일 이용권', '30일 이용권', '크레딧 충전 50')

---

### 2. 비즈니스 로직

#### [수정] `src/lib/billing.ts`

**새로운 함수 추가:**

1. **`calculateCost(action: string, planType: string): number`**

   - `GENERATE`: 5 크레딧 (모든 사용자)
   - `RETRANSLATE`: **1 크레딧 (Free)**, **0 크레딧 (Paid - 무제한)**
   - `DOWNLOAD`: 0 크레딧

2. **`checkCredits(userId: string, cost: number): Promise<boolean>`**

   - `user.planExpiresAt`이 현재 시간보다 미래인지 확인
   - `user.credits >= cost` 확인

3. **`deductCredits(userId: string, amount: number, description: string): Promise<void>`**

   - `user.credits -= amount` 업데이트
   - `UsageLog` 기록 (선택사항, 기존 로직 유지 가능)

4. **`grantPass(userId: string, passType: 'PASS_7DAY' | 'PASS_30DAY'): Promise<void>`**

   - `passType`에 따라:
     - `PASS_7DAY`: `planExpiresAt = now + 7일`, `credits += 50`
     - `PASS_30DAY`: `planExpiresAt = now + 30일`, `credits += 300`
   - `planType` 업데이트
   - 기존 만료일이 미래라면 연장 정책 결정 (덮어쓰기 vs 누적)

5. **`refillCredits(userId: string, amount: number): Promise<void>` (NEW)**

   - `user.credits += amount`
   - **만료일/플랜타입 변경 없음**
   - `PaymentHistory`에 기록

6. **`checkLowCredit(userId: string): Promise<boolean>` (NEW)**
   - 유료 플랜 기간 내(`planExpiresAt > now`) && `credits < 5`이면 `true` 반환

---

### 3. API 라우트 & 결제 (PortOne)

#### [수정] `src/app/api/payment/complete/route.ts`

- 단건 결제 검증 로직으로 변경
- **결제 금액 분기 처리**:
  - `9,900원` → `grantPass(userId, 'PASS_7DAY')`
  - `12,900원` → `grantPass(userId, 'PASS_30DAY')`
  - `3,900원` → `refillCredits(userId, 50)` (크레딧 충전)
- `PaymentHistory` 기록

#### [삭제] 다음 파일들 전체 삭제:

- `src/app/api/billing/subscription/route.ts` (구독 관리)
- `src/app/api/billing/register/route.ts` (빌링키 등록)
- `src/app/api/billing/card/route.ts` (카드 변경)
- `src/app/api/billing/webhook/route.ts` (정기 결제 웹훅)

#### [신규] `src/app/api/user/status/route.ts` (선택사항)

- 사용자 상태 조회 API
- 응답에 `lowCreditAlert: boolean` 포함

---

### 4. Frontend UI/UX 전면 개편

#### [수정] `src/app/(authenticated)/settings/client-page.tsx` & `settings-page.tsx`

**삭제할 UI 요소:**

- "구독 해지하기" 버튼
- "구독 재개" 버튼
- "카드 변경" 버튼
- "다음 결제일" 표시
- `requestIssueBillingKey` 관련 모든 로직

**추가할 UI 요소:**

1. **내 이용권 상태 패널**

   - 현재 등급 표시 (Free / 7일 이용권 / 30일 이용권)
   - 만료일 D-Day 표시 (예: "D-3", "만료됨")
   - 잔여 크레딧 표시 (예: "125 크레딧")

2. **이용권 구매 섹션 (Shop)**

   - 카드형 UI로 3개 상품 배치:
     - **7일 이용권** (9,900원) - 50 크레딧 포함
     - **30일 이용권** (12,900원) - 300 크레딧 포함 (추천 뱃지)
     - **크레딧 충전 50** (3,900원) - 기간 연장 없음 명시
   - 각 카드에 "구매하기" 버튼
   - 클릭 시 `PortOne.requestPayment()` 호출

3. **크레딧 부족 알림 (Low Credit Alert)**
   - 유료 플랜 사용 중 + 크레딧 < 5일 때 상단에 배너 표시
   - "크레딧이 부족합니다. 충전하시겠습니까?" + 충전 버튼

---

#### [수정] `src/app/components/resume-preview-page.tsx` (Upgrade Modal)

**변경 사항:**

- 기존 텍스트 "구독하고 무제한 혜택 받기" → "이용권 구매하고 템플릿 잠금 해제"
- 모달 내부에 7일/30일 이용권 선택 버튼 배치
- 각 버튼 클릭 시 바로 결제창 호출

---

#### [수정] `src/app/(public)/page.tsx` (Landing Page)

**가격 정책 섹션(Pricing) 업데이트:**

- "월 12,900원 정기 결제" 문구 삭제
- **"필요할 때만 쓰는 합리적인 이용권"** 컨셉으로 변경
- 3단 가격표:
  - **Free**: 15 크레딧 (체험용), Modern 템플릿만
  - **7일 이용권**: 9,900원, 50 크레딧, 모든 템플릿, 재번역 무제한
  - **30일 이용권**: 12,900원, 300 크레딧, 모든 템플릿, 재번역 무제한 (추천)
- 하단에 "크레딧 충전 옵션도 있어요!" 문구 추가

---

### 5. 크레딧 충전(Refill) 기능 상세

#### 5.1 상품 정보

| 상품명             | 가격    | 효과       | 제약                  |
| ------------------ | ------- | ---------- | --------------------- |
| **크레딧 충전 50** | 3,900원 | +50 크레딧 | 만료일/플랜 변경 없음 |

#### 5.2 구매 로직

- 결제 성공 시: `user.credits += 50`
- `planExpiresAt`, `planType` 변경 **절대 금지**
- `PaymentHistory`에 `orderName: '크레딧 충전 50'` 기록

#### 5.3 환불 정책

- 결제 후 크레딧을 1회라도 사용한 경우 환불 불가
- 시스템상 별도 환불 로직 없음 (고객센터 수동 처리)

#### 5.4 UI 노출 조건

- **설정 페이지**: 항상 노출 (3번째 상품 카드)
- **크레딧 부족 알림**: `planExpiresAt > now` && `credits < 5`일 때 배너 표시
- **이력서 생성 실패 시**: "크레딧이 부족합니다" 에러 메시지와 함께 충전 버튼 표시

---

## 검증 계획

### 수동 검증 시나리오

1. **Free 사용자 플로우**

   - 신규 가입 → 초기 15 크레딧 확인
   - 이력서 생성 (5 크레딧 차감) → 잔여 10 크레딧
   - 재번역 (1 크레딧 차감) → 잔여 9 크레딧
   - Classic 템플릿 선택 시도 → 업그레이드 모달 표시

2. **7일 이용권 구매**

   - 설정 페이지에서 "7일 이용권" 구매 버튼 클릭
   - 포트원 결제창 → 9,900원 결제 완료
   - 페이지 새로고침 → 플랜: "7일 이용권", 만료일: "D-7", 크레딧: +50
   - Classic 템플릿 선택 → 성공
   - 재번역 10회 → 크레딧 차감 없음 (무제한)

3. **30일 이용권 구매**

   - 12,900원 결제 → 플랜: "30일 이용권", 만료일: "D-30", 크레딧: +300

4. **크레딧 충전 (Refill)**

   - 유료 플랜 사용 중 크레딧 < 5 상태 만들기
   - 상단 배너 "크레딧 부족" 알림 표시 확인
   - "크레딧 충전 50" 구매 (3,900원)
   - 크레딧 +50 확인
   - **만료일 변경 없음** 확인
   - **플랜 타입 변경 없음** 확인

5. **만료 처리**
   - 만료일 경과 시뮬레이션 (DB 직접 수정)
   - 플랜 자동 FREE 전환 확인
   - 재번역 시 1 크레딧 차감 확인
   - Classic 템플릿 접근 차단 확인

---

## 마이그레이션 순서

1. **Schema 변경 & Migration**

   - `User` 모델에 필드 추가
   - `Subscription`, `Plan` 모델 삭제
   - `prisma migrate dev` 실행

2. **Backend 로직 구현**

   - `billing.ts` 함수들 구현
   - `payment/complete` API 수정
   - 구독 관련 API 삭제

3. **Frontend 개편**

   - Settings 페이지 UI 전면 개편
   - Upgrade Modal 수정
   - Landing Page Pricing 섹션 수정

4. **테스트 & 검증**

   - 위 검증 시나리오 전체 수행

5. **배포**
   - DB 마이그레이션 먼저 실행
   - 애플리케이션 배포
