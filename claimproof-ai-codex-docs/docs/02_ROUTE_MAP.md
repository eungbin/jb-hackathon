# 02. Route Map

## Routes

| Route | Page | Role | Notes |
|---|---|---|---|
| `/` | Redirect | System | `/dashboard`로 이동 |
| `/dashboard` | Dashboard | All | Command Center |
| `/content/new` | 콘텐츠 등록 | 콘텐츠 생산자 | 심의 요청 생성 |
| `/compliance-review` | 준법 Review List | 준법관리자 | Review Queue |
| `/compliance-review/:reviewId` | 준법 Review 상세 | 준법관리자 | Claim 검증 및 최종 판단 |
| `/evidence-pack` | Evidence Pack List | 준법관리자 | 증적 아카이브 |
| `/evidence-pack/:packId` | Evidence Pack 상세 | 준법관리자 | 확정 증적 조회 |
| `/learning-loop` | Learning Loop | 준법관리자 | 학습 후보 관리 |
| `/product-truth` | Product Truth 조회 | 준법관리자 | 상품 기준정보 조회 |
| `/product-truth/new` | 상품 신규 등록 | 준법관리자 | Product Truth 직접 등록 |
| `/rules-sources` | Rules & Sources | 준법관리자 | 규칙/근거 문서 관리 |

## Removed Route

| Route | Action |
|---|---|
| `/pre-review` | 구현하지 않음. 접근 시 `/compliance-review`로 redirect 가능 |

## Drawer State

Drawer는 별도 URL 라우트로 만들지 않습니다. 각 화면 내부 state로 처리합니다.

| Parent Route | Drawer | Trigger |
|---|---|---|
| `/compliance-review/:reviewId` | Claim 근거 상세 | Claim 테이블의 `근거 확인` |
| `/product-truth/new` | 근거 문서 입력 / 수정 | 근거 문서 테이블의 `수정` |
| `/product-truth/new` | Product Fact 입력 / 수정 | Product Fact 테이블의 `수정`, `+ Product Fact 추가` |
| `/rules-sources` | 규칙 상세 편집 | Rule 테이블 row 클릭 또는 신규 규칙 생성 |
| `/learning-loop` | Candidate Details | Candidate row 클릭 |

## Navigation Behavior

- 사이드바의 `준법 Review`는 `/compliance-review`로 이동합니다.
- 사이드바의 `Evidence Pack`은 `/evidence-pack`으로 이동합니다.
- 사이드바의 `Product Truth`는 `/product-truth`로 이동합니다.
- `AI 사전 검토` 메뉴는 존재하지 않습니다.
