import { describe, expect, it } from 'vitest'
import { decisions, getComplianceProcessStatus } from './reviewDecision'

describe('getComplianceProcessStatus', () => {
  it.each([
    ['승인', 'APPROVED'],
    ['조건부 승인', 'CONDITIONALLY_APPROVED'],
    ['수정 요청', 'REJECTED'],
    ['반려', 'REJECTED'],
  ] as const)('maps %s to %s', (decision, status) => {
    expect(getComplianceProcessStatus(decision)).toBe(status)
  })

  it('only exposes actionable final decision options', () => {
    expect(decisions).toEqual(['승인', '조건부 승인', '수정 요청', '반려'])
    expect(decisions).not.toContain('추가 자료 요청')
  })
})
