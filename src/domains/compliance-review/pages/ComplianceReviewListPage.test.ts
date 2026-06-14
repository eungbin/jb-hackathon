import { describe, expect, it } from 'vitest'

const pageSources = import.meta.glob('./ComplianceReviewListPage.tsx', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

describe('ComplianceReviewListPage', () => {
  it('disables review actions while AI review is not actionable', () => {
    const source = pageSources['./ComplianceReviewListPage.tsx']

    expect(source).toContain('reviewActionLabels')
    expect(source).toContain("PENDING: '심사하기'")
    expect(source).toContain("REVIEWING: '리뷰중...'")
    expect(source).toContain("AI_FAILED: '리뷰불가'")
    expect(source).toContain('reviewActionDisabledStatuses')
    expect(source).toContain("new Set<ComplianceReviewRow['status']>(['REVIEWING', 'AI_FAILED'])")
    expect(source).toContain('disabled={reviewActionDisabledStatuses.has(item.status)}')
  })

  it('shows a spinner beside the reviewing action label', () => {
    const source = pageSources['./ComplianceReviewListPage.tsx']

    expect(source).toContain('Loader2')
    expect(source).toContain("item.status === 'REVIEWING'")
    expect(source).toContain('animate-spin')
  })
})
