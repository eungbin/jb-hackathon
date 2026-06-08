# Codex Master Prompt

Implement the ClaimProof AI MVP frontend from the provided docs and mock data.

## Project

Build a Korean B2B financial compliance AI console named `ClaimProof AI`.

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
- real LLM/RAG/API calls

## Source of Truth

Use `docs/data` as the canonical mock data source. You may copy mock data into `src/data`, but do not change the values.

## Required Routes

Implement:

- `/dashboard`
- `/content/new`
- `/compliance-review`
- `/compliance-review/:reviewId`
- `/evidence-pack`
- `/evidence-pack/:packId`
- `/learning-loop`
- `/product-truth`
- `/product-truth/new`
- `/rules-sources`

Redirect `/` to `/dashboard`.

Do not implement `/pre-review`. If a user tries to access `/pre-review`, redirect to `/compliance-review`.

## Unified Sidebar

Use the same sidebar across all pages:

- Dashboard
- 콘텐츠 등록
- 준법 Review
- Evidence Pack
- Learning Loop
- Product Truth
- Rules & Sources
- 설정

Do not include `AI 사전 검토` in the sidebar.

## Pages

### Dashboard

Build a command center page with KPI cards, priority review table, risk distribution card, recurring risk list, learning candidate status, and system health.

### 콘텐츠 등록

Build a content submission page with:

- content title
- original content text
- product group
- product ID
- target customer chips
- language
- urgency
- channel chips
- planned publish date
- Product Truth summary side panel
- compliance checklist side panel

Primary CTA can be `AI 사전검토 요청`, but it must not navigate to a separate pre-review screen. It should mock-create a review request and route to `/compliance-review` or show a success state.

### 준법 Review List

Build a review queue page with summary cards, filters, review table, pagination, and `심의하기` buttons that route to `/compliance-review/:reviewId`.

### 준법 Review Detail

Build a compliance review workspace with:

- AI pre-review summary card
- evidence source summary cards
- claim verification table
- original content panel with highlighted claims
- compliance manager final decision panel
- claim evidence right drawer

The claim evidence drawer must use accordion sections, not tabs:

1. 상품 기준정보
2. 규칙·근거 문서
3. AI 판단 요약
4. 수정 권고

AI output must be framed as reference material. AI must not approve or reject.

### Evidence Pack List

Build an archive table with filters and detail buttons.

### Evidence Pack Detail

Build a read-only sealed review record page with audit timeline, integrity hash, product metadata, claim verification results, final comments, and digital signature/seal.

### Learning Loop

Build a learning candidate queue with a candidate details drawer. Show redaction/masking and label review before training approval. Do not imply direct training from raw Evidence Pack.

### Product Truth

Build a Product Truth management page with product selection, version management card, product fact filters, product fact table, and `신규 상품 등록` CTA to `/product-truth/new`.

### Product Truth New

Build a manual-input Product Truth registration page.

Important: this page must NOT include AI extraction or approval workflow.

Remove/avoid:

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

Final workflow:

```txt
direct manual input → 등록 → validation → ACTIVE or SCHEDULED
```

Main sections:

1. 상품 기본정보
2. 버전 및 적용기간
3. 근거 문서
4. Product Fact
5. 등록 확인

Buttons:

- 취소
- 등록

Drawers:

- 근거 문서 입력 / 수정
- Product Fact 입력 / 수정

### Rules & Sources

Build a rules and source document management page with rules table, source document cards, and a right-side rule detail editor drawer.

## Design Style

Match the uploaded PNG design direction:

- Korean enterprise SaaS console
- light gray / pale lavender app background
- white rounded cards
- subtle borders and shadows
- blue primary actions
- compact data-heavy layout
- risk badges and decision badges
- right-side drawers

## Quality Requirements

- Use TypeScript types for data.
- Keep components modular.
- Use mock data only.
- Implement routing and drawer states.
- Implement form validation for Product Create.
- Do not show AI as final decision maker.
- Do not confuse risk levels with final decisions.
