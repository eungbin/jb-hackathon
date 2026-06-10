import type { ComplianceReviewClaim } from './api'

export function buildClaimReviewComment(claim: ComplianceReviewClaim) {
  return [
    `[${claim.claimId}] ${claim.statement}`,
    `AI 판단: ${claim.verificationResult}`,
    `AI 요약: ${claim.evidence.aiSummary}`,
    `수정 요청 사유: ${claim.evidence.revision.reason}`,
    `권고 표현: ${claim.evidence.revision.suggested}`,
    `추가 고지 권장: ${claim.evidence.revision.additionalNotice}`,
  ].join('\n')
}

export function appendReviewComment(currentComment: string, claimComment: string) {
  return [currentComment.trim(), claimComment.trim()].filter(Boolean).join('\n\n')
}

export function hasAppliedClaimReviewComment(currentComment: string, claim: ComplianceReviewClaim) {
  return currentComment.includes(`[${claim.claimId}]`)
}
