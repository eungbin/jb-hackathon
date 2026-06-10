import { describe, expect, it } from 'vitest'
import type { ComplianceReviewClaim } from './api'
import { appendReviewComment, buildClaimReviewComment, hasAppliedClaimReviewComment } from './reviewComment'

const claim: ComplianceReviewClaim = {
  claimId: 'CLM-001',
  statement: '우대금리 조건 미기재',
  type: '허위·과장 광고',
  verificationResult: '조건누락',
  riskLevel: 'HIGH',
  riskLabel: '높음',
  evidence: {
    productTruth: {},
    rule: {
      ruleId: 'FIN-2024-001',
      requiredItems: [],
      severity: 'HIGH',
      index: '금융광고심의규정.pdf',
      source: '우대금리 고지 의무',
    },
    aiSummary: '우대금리 조건이 광고 문구에 명시되지 않았습니다.',
    revision: {
      original: '최저 연 4.5%로 내 집 마련의 꿈을 이루세요.',
      suggested: '연 4.5%~8.2% (신용등급에 따라 상이)',
      additionalNotice: '실제 적용 금리는 고객 신용등급에 따라 상이합니다.',
      reason: '금리 표시 의무 위반',
    },
  },
}

describe('buildClaimReviewComment', () => {
  it('builds a review comment block from claim evidence', () => {
    expect(buildClaimReviewComment(claim)).toBe([
      '[CLM-001] 우대금리 조건 미기재',
      'AI 판단: 조건누락',
      'AI 요약: 우대금리 조건이 광고 문구에 명시되지 않았습니다.',
      '수정 요청 사유: 금리 표시 의무 위반',
      '권고 표현: 연 4.5%~8.2% (신용등급에 따라 상이)',
      '추가 고지 권장: 실제 적용 금리는 고객 신용등급에 따라 상이합니다.',
    ].join('\n'))
  })
})

describe('appendReviewComment', () => {
  it('appends a claim comment block with one blank line separator', () => {
    expect(appendReviewComment('기존 검토 의견', '새 검토 의견')).toBe('기존 검토 의견\n\n새 검토 의견')
  })

  it('does not add extra whitespace when existing comment is empty', () => {
    expect(appendReviewComment('', '새 검토 의견')).toBe('새 검토 의견')
  })
})

describe('hasAppliedClaimReviewComment', () => {
  it('detects when the same claim comment is already applied', () => {
    const comment = appendReviewComment('기존 의견', buildClaimReviewComment(claim))

    expect(hasAppliedClaimReviewComment(comment, claim)).toBe(true)
  })

  it('does not treat a different claim id as already applied', () => {
    expect(hasAppliedClaimReviewComment('[CLM-002] 다른 클레임', claim)).toBe(false)
  })
})
