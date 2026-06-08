import type {
  InputStatus,
  LearningStatus,
  ProductDocumentType,
  ProductFactType,
  ProductStatus,
  ReviewDecision,
  RiskLevel,
  VerificationStatus,
} from '../types'

export const riskLabels: Record<RiskLevel, string> = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
}

export const decisionLabels: Record<ReviewDecision, string> = {
  APPROVED: '승인',
  CONDITIONALLY_APPROVED: '조건부 승인',
  REVISION_REQUESTED: '수정 요청',
  REJECTED: '반려',
  NEED_MORE_INFO: '추가 자료 요청',
}

export const verificationLabels: Record<VerificationStatus, string> = {
  SUPPORTED: '근거 일치',
  SUPPORTED_WITH_CONDITION_MISSING: '조건 누락',
  CONTRADICTED: '기준정보 불일치',
  NOT_FOUND: '근거 미확인',
  AMBIGUOUS: '표현 모호',
  NEEDS_DISCLOSURE: '고지 필요',
}

export const learningLabels: Record<LearningStatus, string> = {
  CANDIDATE_RAW: '비식별화 필요',
  REDACTION_REQUIRED: '비식별화 대기',
  REDACTED: '비식별화 완료',
  LABEL_VALIDATION_PENDING: '라벨 검수 대기',
  APPROVED_FOR_EVAL: '평가 데이터 승인',
  APPROVED_FOR_TRAINING: '학습 후보 승인',
  EXCLUDED: '제외',
}

export const productStatusLabels: Record<ProductStatus, string> = {
  ACTIVE: 'ACTIVE',
  SCHEDULED: 'SCHEDULED',
  INACTIVE: 'INACTIVE',
}

export const inputStatusLabels: Record<InputStatus, string> = {
  COMPLETE: '입력 완료',
  MISSING_REQUIRED: '필수값 누락',
}

export const documentTypeLabels: Record<ProductDocumentType, string> = {
  PRODUCT_DESCRIPTION: '상품설명서',
  TERMS: '약관',
  RATE_TABLE: '금리표',
  FEE_TABLE: '수수료표',
  DISCLOSURE_GUIDE: '고지 가이드',
  OTHER: '기타',
}

export const factTypeLabels: Record<ProductFactType, string> = {
  RATE: '금리',
  ELIGIBILITY: '가입 조건',
  LIMIT: '한도',
  FEE: '수수료',
  TERM: '기간',
  BENEFIT: '혜택',
  RISK_NOTICE: '위험 고지',
  CHANNEL: '채널',
  OTHER: '기타',
}

export function formatChannel(channel: string) {
  const labels: Record<string, string> = {
    APP_PUSH: '앱푸시',
    SMS: 'SMS',
    BANNER: '배너',
    HOMEPAGE: '홈페이지',
    SNS: 'SNS',
    EMAIL: '이메일',
  }
  return labels[channel] ?? channel
}
