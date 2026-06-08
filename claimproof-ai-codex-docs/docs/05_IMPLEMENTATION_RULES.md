# 05. Implementation Rules

## Tech Stack

Use:

- React
- Vite
- TypeScript
- React Router DOM
- Tailwind CSS
- shadcn/ui if available
- Mock data only

Do not use:

- Next.js
- Next.js App Router
- Server Components
- API Routes
- server actions
- next/link
- next/navigation
- real LLM/RAG/API integrations

## MVP Scope Rules

### Navigation

- Use a unified sidebar across all pages.
- Do not implement the `AI 사전 검토` sidebar menu.
- Do not implement `/pre-review`.
- `/pre-review` may redirect to `/compliance-review` if needed.

### AI Behavior

- AI may be represented as analysis text inside 준법 Review 상세.
- AI must not approve, reject, activate, or finalize anything.
- AI output must be framed as reference material for the compliance manager.

### Product Truth 신규 등록

The Product Create page is manual-input only.

Remove from implementation even if visible in screenshots:

- AI 자동 추정
- AI 추출 완료
- AI 초안
- AI 문서 분석
- Draft status
- 임시저장
- 검증하기 button
- 검수 요청 button
- 승인요청자
- 승인권자

Final Product Create workflow:

```txt
사용자 직접 입력
→ 등록 클릭
→ 필수값 검증
→ ACTIVE 또는 SCHEDULED 생성
```

Registration state:

- If `effectiveStartDate <= today`, status becomes `ACTIVE`.
- If `effectiveStartDate > today`, status becomes `SCHEDULED`.

### Evidence Pack

- Evidence Pack is read-only after finalization.
- Evidence Pack is not only for approved cases.
- It represents all final review outcomes.

### Learning Loop

- Do not imply direct model training from raw Evidence Pack.
- Always show redaction/masking and label review steps.

## Validation Rules

### Product Create Registration Blocking Rules

Block registration if any of the following are missing:

- 상품명
- 상품 코드
- 상품 대분류
- 상품 중분류
- 담당 부서
- 상품 담당자
- 버전명
- 기준일
- 적용 시작일
- 변경 사유
- At least one source document
- Source document documentType
- Source document version
- Source document effectiveStartDate
- At least one Product Fact
- Product Fact factType
- Product Fact factName
- Product Fact value
- Product Fact unit
- Product Fact sourceDocumentId
- Product Fact sourceLocator
- Product Fact effectiveStartDate

## Formatting Rules

- Use Korean UI labels where shown in screenshots.
- Use ISO-ish date display consistently where possible: `YYYY.MM.DD` or `YYYY-MM-DD`.
- Do not mix `06/01/2026`, `2026.06.01`, and `2026-06-01` in the same screen.
- Prefer `YYYY.MM.DD` for display UI.

## Risk and Decision Distinction

Risk levels:

- LOW
- MEDIUM
- HIGH
- CRITICAL

Final review decisions:

- APPROVED
- CONDITIONALLY_APPROVED
- REVISION_REQUESTED
- REJECTED
- NEED_MORE_INFO

Do not mix risk levels and final review decisions.
