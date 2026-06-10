import { describe, expect, it } from 'vitest'
import { getComplianceProcessStatus } from './reviewDecision'

describe('getComplianceProcessStatus', () => {
  it.each([
    ['승인', 'APPROVED'],
    ['조건부 승인', 'CONDITIONALLY_APPROVED'],
    ['수정 요청', 'REJECTED'],
    ['반려', 'REJECTED'],
  ] as const)('maps %s to %s', (decision, status) => {
    expect(getComplianceProcessStatus(decision)).toBe(status)
  })

  it('does not map additional material requests to an unsupported status', () => {
    expect(getComplianceProcessStatus('추가 자료 요청')).toBeNull()
  })
})
