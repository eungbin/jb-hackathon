# ClaimProof AI — Codex Development Docs

이 패키지는 확정 PNG 디자인 시안과 ClaimProof AI v2 Context Pack을 기준으로 Codex 개발을 요청하기 위한 문서 묶음입니다.

## 기준

- UI 기준: 사용자가 제공한 최종 PNG 디자인 12개
- 제품 원칙 기준: ClaimProof AI v2 Context Pack
- 기술 기준: React + Vite + TypeScript + React Router DOM + Tailwind CSS
- 데이터 기준: Mock data only

## 주요 결정

- `AI 사전 검토` 단독 사이드바 메뉴와 `/pre-review` 라우트는 구현하지 않습니다.
- AI 사전검토 결과는 `준법 Review 상세` 내부의 AI 분석 섹션으로만 표현합니다.
- AI는 승인/반려/최종 판단을 수행하지 않습니다.
- 준법관리자가 최종 판단을 수행합니다.
- Evidence Pack은 승인 문서가 아니라 모든 최종 심의 판단의 확정 증적입니다.
- Product Truth 신규 등록 화면은 MVP 기준으로 수동 입력만 구현합니다.
- Product Truth 신규 등록 화면에서 AI 자동 추정, Draft, 임시저장, 검증하기, 검수 요청은 제외합니다.
