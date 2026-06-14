import type { ComplianceProcessStatus } from './api'

export type Decision = '승인' | '조건부 승인' | '수정 요청' | '반려'

export const decisions: Decision[] = ['승인', '조건부 승인', '수정 요청', '반려']

const processStatusByDecision: Record<Decision, ComplianceProcessStatus> = {
  승인: 'APPROVED',
  '조건부 승인': 'CONDITIONALLY_APPROVED',
  '수정 요청': 'REJECTED',
  반려: 'REJECTED',
}

export function getComplianceProcessStatus(decision: Decision) {
  return processStatusByDecision[decision]
}
