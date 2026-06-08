# 00. Product Context

## 프로젝트

- 서비스명: ClaimProof AI
- 목적: 금융 대고객 콘텐츠의 Claim을 상품 기준정보와 규칙·근거 문서에 대조하여 준법심의를 보조하는 AI Compliance Console
- MVP 성격: 정적 프론트엔드 콘솔 + Mock data 기반 데모

## 핵심 역할

### 콘텐츠 생산자

- 콘텐츠 등록
- 상품, 채널, 대상 고객, 배포 예정일 입력
- 심의 요청 제출
- 최종 결과 확인

콘텐츠 생산자는 준법 리스크를 직접 판단하지 않습니다.

### 준법관리자

- AI 분석 결과 확인
- Claim별 근거 확인
- 최종 판단 입력
- Evidence Pack 확정
- Product Truth / Rules & Sources 관리

### 시스템/AI Agent

- 콘텐츠 Claim 추출
- Product Truth 대조
- Rules & Sources 대조
- 위험등급 산정
- 수정 권고 제안

AI는 최종 판단을 하지 않습니다.

## 핵심 개념

### Claim

고객이 사실로 받아들일 수 있는 검증 가능한 주장입니다.

예:

- 누구나 받을 수 있다
- 최고 연 7%
- 수수료 없음
- 대출 가능
- 업계 최고

### Product Truth

상품설명서, 약관, 금리표, 수수료표 등에서 정리한 금융상품 기준정보입니다.

예:

- 가입 대상
- 기본금리
- 최고금리
- 월 납입 한도
- 중도해지 조건
- 수수료 조건

### Rules & Sources

준법 판단에 사용하는 규칙과 근거 문서 저장소입니다.

### Evidence Pack

준법관리자의 최종 판단 이후 확정되는 심의 증적입니다. 승인, 조건부 승인, 수정 요청, 반려, 추가 자료 요청 모두 Evidence Pack으로 확정될 수 있습니다.

### Learning Candidate

Evidence Pack 원본을 바로 학습하지 않고, 비식별화와 라벨 검수 후 학습 후보로 관리하는 데이터입니다.
