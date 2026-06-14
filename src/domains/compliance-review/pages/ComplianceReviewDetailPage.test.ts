import { describe, expect, it } from 'vitest'

const pageSources = import.meta.glob('./ComplianceReviewDetailPage.tsx', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

describe('ComplianceReviewDetailPage', () => {
  it('shows claim original text and review item as separate columns', () => {
    const source = pageSources['./ComplianceReviewDetailPage.tsx']

    expect(source).toContain("type ClaimSortKey = 'statement' | 'reviewItem' | 'type' | 'verificationResult' | 'riskLevel'")
    expect(source).toContain("{ label: 'Claim 문구', sortKey: 'statement' }")
    expect(source).toContain("{ label: 'AI 판단', sortKey: 'reviewItem' }")
    expect(source).toContain('{claim.statement}')
    expect(source).toContain('{claim.reviewItem}')
    expect(source).toMatch(/<td className="min-w-\[210px\] px-5 py-4">\s*<span className=\{`text-xs font-bold/)
    expect(source).toMatch(/<td className="min-w-\[150px\] px-3 py-4">\s*<span className=\{`flex items-center gap-2/)
    expect(source).toMatch(/h-1\.5 w-1\.5 rounded-full[\s\S]*\{claim\.reviewItem\}/)
  })

  it('keeps fixed minimum widths for compact claim columns', () => {
    const source = pageSources['./ComplianceReviewDetailPage.tsx']

    expect(source).toContain('<td className="min-w-[112px] px-3 py-4">')
    expect(source).toContain('<td className="min-w-[124px] px-3 py-4">')
    expect(source).toContain('<td className="min-w-[104px] px-3 py-4">')
    expect(source).toContain('<td className="min-w-[124px] px-5 py-4">')
  })

  it('renders AI verification result as a chip without an icon', () => {
    const source = pageSources['./ComplianceReviewDetailPage.tsx']

    expect(source).toMatch(/<td className="min-w-\[124px\] px-3 py-4">\s*<TypePill label=\{claim\.verificationResult\} \/>/)
    expect(source).toMatch(/AI 검증결과[\s\S]*<TypePill label=\{claim\.verificationResult\} \/>/)
    expect(source).not.toContain('uiTokens.color.danger}`}>{claim.verificationResult}')
    expect(source).not.toContain('CheckCircle2')
  })

  it('keeps the evidence drawer risk label from wrapping when claim text spans lines', () => {
    const source = pageSources['./ComplianceReviewDetailPage.tsx']

    expect(source).toContain('shrink-0 whitespace-nowrap')
    expect(source).toContain('<div className="flex items-start gap-2">')
    expect(source).toContain('min-w-0 text-xs font-bold')
  })

  it('uses a text-only evidence action label in the claims table', () => {
    const source = pageSources['./ComplianceReviewDetailPage.tsx']

    expect(source).toContain('근거 확인')
    expect(source).not.toContain('PanelRightOpen')
  })

  it('labels product evidence as referenced product documents', () => {
    const source = pageSources['./ComplianceReviewDetailPage.tsx']

    expect(source).toContain('title="참고 상품문서"')
    expect(source).not.toContain('title="상품 기준정보"')
  })

  it('shows rule name and risk level in rule evidence details', () => {
    const source = pageSources['./ComplianceReviewDetailPage.tsx']

    expect(source).toContain('규칙 이름')
    expect(source).toContain('{claim.evidence.rule.ruleName}')
    expect(source).toContain('위험 등급')
    expect(source).toContain('{claim.evidence.rule.severity}')
    expect(source).not.toContain('중요도')
  })
  it('paginates detailed claim verification rows', () => {
    const source = pageSources['./ComplianceReviewDetailPage.tsx']

    expect(source).toContain('const claimPageSize = 5')
    expect(source).toContain('const [currentClaimPage, setCurrentClaimPage] = useState(1)')
    expect(source).toContain('const claimTotalPages = Math.max(1, Math.ceil(sortedClaims.length / claimPageSize))')
    expect(source).toContain('const visibleClaimPage = Math.min(currentClaimPage, claimTotalPages)')
    expect(source).toContain('const paginatedClaims = sortedClaims.slice((visibleClaimPage - 1) * claimPageSize, visibleClaimPage * claimPageSize)')
    expect(source).toContain('currentPage: visibleClaimPage')
    expect(source).toContain('onPageChange: setCurrentClaimPage')
    expect(source).toContain('pageSize: claimPageSize')
    expect(source).toContain('totalItems: sortedClaims.length')
    expect(source).toContain('totalPages: claimTotalPages')
    expect(source).toContain('{paginatedClaims.map((claim) => (')
    expect(source).not.toContain('totalPages: 1')
  })
})
