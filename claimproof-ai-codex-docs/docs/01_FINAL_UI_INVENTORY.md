# 01. Final UI Inventory

## 공통 Shell

모든 주요 화면은 다음 공통 레이아웃을 사용합니다.

- 좌측 사이드바
- 상단 검색 바
- 알림 / 도움말 / 사용자 프로필 영역
- 중앙 콘텐츠 영역
- 필요 시 우측 패널 또는 Drawer

## 표준 사이드바 메뉴

개발 시 모든 화면의 사이드바는 아래 항목으로 통일합니다.

1. Dashboard
2. 콘텐츠 등록
3. 준법 Review
4. Evidence Pack
5. Learning Loop
6. Product Truth
7. Rules & Sources
8. 설정

구현 제외:

- AI 사전 검토 메뉴
- Compliance Insights
- Review History
- Audit Logs
- Risk Models
- 통계 및 리포트

화면 이미지에 남아 있어도 이번 MVP 개발 기준에서는 제외합니다.

---

## 1. Dashboard

### Route

`/dashboard`

### 목적

오늘의 준법 검토 현황과 리스크 상태를 요약하는 Command Center입니다.

### 주요 영역

- KPI 카드
  - AI 사전 검토 대기
  - AI 사전 검토 완료
  - 준법 검토 대기
  - 조건부 승인
  - 수정 요청/반려
  - 최종 Evidence Pack 확정
- 우선 검토 대상 테이블
  - 제목
  - 상품군
  - 위험등급
  - 제출일
- Risk Distribution 도넛 카드
- 반복 리스크 Top 5
- Learning Candidate 현황
- System Health

### 구현 메모

Dashboard에서 AI 사전검토 수치는 보여줄 수 있으나, 별도 `AI 사전 검토` 메뉴나 `/pre-review` 화면으로 연결하지 않습니다.

---

## 2. 콘텐츠 등록

### Route

`/content/new`

### 목적

콘텐츠 생산자가 심의 요청할 콘텐츠를 등록하는 화면입니다.

### 주요 영역

- 콘텐츠 제목
- 원문 입력
- 상품군
- 상품 ID
- 대상 고객 chip 선택
- 언어 선택
- 긴급도
- 채널 chip 선택
- 배포 예정일
- 우측 Product Truth 요약
- 우측 주요 준법 체크리스트
- 하단 CTA

### CTA

- 임시 저장
- AI 사전검토 요청

### 동작

`AI 사전검토 요청` 클릭 시 별도 사전검토 화면으로 이동하지 않고, Mock 처리 후 준법 Review List 또는 완료 상태로 이동합니다.

---

## 3. 준법 Review List

### Route

`/compliance-review`

### 목적

준법관리자가 검토 대기 건을 우선순위 기반으로 조회하는 업무 큐입니다.

### 주요 영역

- 상단 Queue / History / Insights 탭 형태 영역은 디자인 참고용입니다. MVP에서는 Queue 중심으로 구현합니다.
- Summary 카드
  - 전체 대기
  - 긴급(CRITICAL)
  - 오늘 마감
  - 내 요청
- 검색/필터 영역
  - 검색어
  - 준법관리자 성명
  - 채널
  - 위험등급
  - 요청일 기간
  - 배포 예정일 기간
- Review Queue 테이블
  - ID
  - 콘텐츠명
  - 상품명
  - 채널
  - 위험등급
  - Claim 수
  - 등록자
  - 요청일
  - 배포 예정일
  - 액션
- 페이지네이션
- AI Insight toast는 Mock UI로 구현 가능

### 액션

`심의하기` 클릭 시 `/compliance-review/:reviewId`로 이동합니다.

---

## 4. 준법 Review 상세

### Route

`/compliance-review/:reviewId`

### 목적

AI 분석 결과와 Claim별 근거를 바탕으로 준법관리자가 최종 판단을 입력하는 Workspace입니다.

### 주요 영역

#### 좌측

- AI 사전 검토 요약
  - Risk Score
  - Critical Claim 포함 여부
  - 주요 리스크 요약
- 심의 근거 자료
  - Product Truth
  - 관련 규정/근거 문서
  - 각 근거가 연결된 Claim 수

#### 중앙

- 세부 클레임 검증 테이블
  - Claim 문구
  - 유형
  - AI 검증결과
  - 위험등급
  - 근거 확인 액션
- 원문 영역
  - 원문 콘텐츠
  - 문제 Claim 하이라이트

#### 우측

- 준법관리자 최종 판단
  - 승인
  - 조건부 승인
  - 수정 요청
  - 반려
  - 추가 자료 요청
- 검토 의견 입력
- 최종 판단 저장 버튼

### Claim 근거 상세 Drawer

우측 Drawer로 구현합니다. 탭이 아니라 아코디언 구조를 사용합니다.

섹션:

1. 상품 기준정보
2. 규칙·근거 문서
3. AI 판단 요약
4. 수정 권고

액션:

- 검토 의견에 추가
- 수정 요청 사유로 반영
- 닫기

---

## 5. Evidence Pack List

### Route

`/evidence-pack`

### 목적

최종 심의 판단 후 확정된 Evidence Pack을 조회하는 증적 아카이브입니다.

### 주요 영역

- 검색/필터
  - 통합 검색
  - 준법관리자 성명
  - 전체 채널
  - 최종 판단
  - 최고 위험등급
  - 확정 시각 기간
  - Learning Loop 상태
- Evidence Pack 테이블
  - Pack ID
  - 콘텐츠 ID
  - 콘텐츠명
  - 상품명
  - 채널
  - 최종 판단
  - 위험등급
  - 확정 시각
  - 준법관리자
  - Learning Loop 상태
  - 액션
- 페이지네이션

### 액션

`상세보기` 클릭 시 `/evidence-pack/:packId`로 이동합니다.

---

## 6. Evidence Pack 상세

### Route

`/evidence-pack/:packId`

### 목적

확정된 심의 증적을 읽기 전용으로 조회하는 상세 화면입니다.

### 주요 영역

- Pack ID / Immutable / Source of Truth / Sealed Record badge
- JSON 내보내기
- PDF 리포트 다운로드
- Audit Timeline
- Record Integrity Hash
- Product Metadata
- Claim Verification Results 테이블
- Compliance Review Final Comments
- Digital Signature / Sealed 상태

### 구현 메모

Evidence Pack은 수정 불가 상태로 구현합니다.

---

## 7. Learning Loop

### Route

`/learning-loop`

### 목적

Evidence Pack에서 생성된 Learning Candidate를 비식별화 및 라벨 검수 후 학습/평가 데이터로 승인하는 화면입니다.

### 주요 영역

- 데이터 활용 가이드
- Candidate Queue 테이블
  - Candidate ID
  - Source Pack ID
  - Dataset Type
  - Redaction Status
  - Label Status
- Candidate Details Drawer
  - Source Evidence Pack
  - 비식별화 마스킹 내역
  - 원문/마스킹 비교
  - Dataset Metadata
  - 학습 데이터 승인 토글
  - 수정 요청 / 최종 승인 버튼

### 구현 메모

Evidence Pack 원본을 바로 학습 데이터로 쓰는 흐름으로 보이면 안 됩니다.

---

## 8. Product Truth 조회

### Route

`/product-truth`

### 목적

등록된 금융상품의 Product Truth 기준정보를 조회하고 신규 상품 등록으로 진입하는 화면입니다.

### 주요 영역

- 상품 선택 카드 목록
- Product Version Management 카드
- 변경 이력 보기
- Product Fact 필터
- Product Fact 테이블
  - Product Fact
  - Value/Data
  - Condition
  - Source Locator
  - Effective Date
- 신규 상품 등록 CTA

### 액션

`신규 상품 등록` 클릭 시 `/product-truth/new`로 이동합니다.

---

## 9. 상품 신규 등록

### Route

`/product-truth/new`

### 목적

준법관리자가 Claim 검증에 사용할 Product Truth 기준정보를 직접 입력하여 등록하는 화면입니다.

### 최종 MVP 정책

구현 제외:

- AI 자동 추정
- AI 추출 완료
- AI 초안
- AI 문서 분석
- Draft 상태
- 임시저장
- 검증하기 버튼
- 검수 요청
- 승인요청자
- 승인권자

구현 방식:

- 사용자가 직접 입력
- 등록 버튼 클릭
- 필수값 검증
- 등록 성공 시 ACTIVE 또는 SCHEDULED

### 주요 영역

- 좌측 등록 단계
  1. 상품 기본정보
  2. 버전 및 적용기간
  3. 근거 문서
  4. Product Fact
  5. 등록 확인
- 중앙 입력 카드
- 우측 등록 요약 패널

### 최종 버튼

- 취소
- 등록

---

## 10. 상품 신규 등록 — 근거 문서 Drawer

### 화면 상태

`/product-truth/new` 내부 Drawer 상태입니다.

### Drawer명

근거 문서 입력 / 수정

### 입력 항목

- 파일명
- 문서 유형
- 버전
- 적용 시작일
- 문서 설명
- 비고

### 액션

- 닫기
- 변경 적용

---

## 11. 상품 신규 등록 — Product Fact Drawer

### 화면 상태

`/product-truth/new` 내부 Drawer 상태입니다.

### Drawer명

Product Fact 입력 / 수정

### 입력 항목

#### 1. Fact 기본정보

- Fact Type
- Product Fact
- 상품명
- 상품 코드
- Product Truth 버전

#### 2. 값 / 조건

- Value
- Unit
- 표시값
- Condition
- 적용 시작일
- 적용 종료일

#### 3. 근거 문서 및 Source Locator

- 근거 문서
- 문서 유형
- 문서 버전
- 페이지
- 섹션 / 조항
- Source Locator 표시값
- 근거 원문 메모

### 액션

- 닫기
- 변경 적용

---

## 12. Rules & Sources

### Route

`/rules-sources`

### 목적

심의 규칙과 근거 문서를 조회하고 규칙 상세를 편집하는 관리 화면입니다.

### 주요 영역

- 규칙 검색/필터
- Rules 테이블
  - Rule ID
  - 규칙명
  - 탐지 키워드 및 필수 고지
- Source Documents 카드 목록
- 규칙 상세 편집 Drawer
  - Severity
  - Rule ID / Rule명
  - Trigger Keywords
  - Required Disclosures
  - Rule Engine Logic
  - 변경사항 저장
