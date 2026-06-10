import type { ComplianceProcessStatus } from './api'

export type Decision = '승인' | '조건부 승인' | '수정 요청' | '반려' | '추가 자료 요청'

export const decisions: Decision[] = ['승인', '조건부 승인', '수정 요청', '반려', '추가 자료 요청']

const processStatusByDecision: Record<Decision, ComplianceProcessStatus | null> = {
  승인: 'APPROVED',
  '조건부 승인': 'CONDITIONALLY_APPROVED',
  '수정 요청': 'REJECTED',
  반려: 'REJECTED',
  '추가 자료 요청': null,
}

export function getComplianceProcessStatus(decision: Decision) {
  return processStatusByDecision[decision]
}
