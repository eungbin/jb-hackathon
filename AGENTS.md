# AGENTS.md

## Project
ClaimProof AI v2

## Product Definition
ClaimProof AI is a financial compliance review assistant for customer-facing financial content such as ads, app push messages, SMS, and landing pages.

The system extracts Claims from content, compares them against Product Truth Layer and Rules & Sources, generates an AI Pre-Review Pack, lets a human compliance reviewer make the final decision, then seals a Final Evidence Pack. Validated packs can become Learning Candidates.

## Important Scope
Use v2 only.
Ignore v3.
This is not a chatbot, not a consumer banking app, and not a generic document review tool.

## Required Screens
1. Dashboard
2. Content Registration
3. AI Pre-Review Pack
4. Compliance Review
5. Final Evidence Pack
6. Learning Loop
7. Product Truth
8. Rules & Sources

## Core Flow
Content registration
→ Claim extraction
→ Product Truth Layer comparison
→ Rules & Sources evidence search
→ Risk scoring and rewrite suggestion
→ AI Pre-Review Pack
→ Human Compliance Review
→ Final Evidence Pack
→ Learning Candidate

## Terminology
- Claim / 검증 주장
- Product Truth Layer / 상품 기준정보
- Rules & Sources / 규칙·근거 문서
- AI Pre-Review Pack / AI 사전 검토 Pack
- Human Compliance Review / 준법관리자 검토
- Final Evidence Pack / 최종 Evidence Pack
- Learning Candidate / 학습 후보 데이터
- Risk Level / 위험등급
- Verification Status / 검증상태
- Review Decision / 최종 판단
- Audit Log / 감사 로그

## Critical Rules
- AI must not approve or reject content.
- AI can detect, compare, recommend, and suggest.
- The final decision is always made by the human compliance reviewer.
- Do not call the pre-review result “Final Evidence Pack.”
- Final Evidence Pack is created only after human review.
- Learning Candidate is not raw model training data. It requires redaction and label validation.

## Implementation Goal
Implement a static frontend MVP first using mock data.
Use clean, reusable React components.
Prioritize product clarity over pixel-perfect replication.
Use Korean UI copy.