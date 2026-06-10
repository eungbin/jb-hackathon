import { describe, expect, it } from 'vitest'

const sources = import.meta.glob([
  '../domains/evidence-pack/pages/EvidencePackDetailPage.tsx',
  '../data/mockData.ts',
], {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

describe('evidence pack detail design', () => {
  it('uses Figma-aligned timeline and metadata sections', () => {
    const detailSource = sources['../domains/evidence-pack/pages/EvidencePackDetailPage.tsx']
    const mockDataSource = sources['../data/mockData.ts']
    const finalEvidenceSource = mockDataSource.slice(mockDataSource.indexOf('export const finalEvidencePackData'), mockDataSource.indexOf('export const learningData'))

    expect(detailSource).toContain('function AuditTimeline')
    expect(detailSource).toContain('function ProductMetadataPanel')
    expect(detailSource).toContain('fetchEvidencePackResultDetail')
    expect(detailSource).toContain('product.productName')
    expect(detailSource).not.toContain('finalEvidencePackData')
    expect(detailSource).not.toContain('Record Integrity Hash')
    expect(detailSource).not.toContain('finalEvidencePackData.hash')
    expect(detailSource).not.toContain('Object.entries(finalEvidencePackData.productMetadata)')

    expect(finalEvidenceSource).toContain('securityGrade')
    expect(finalEvidenceSource).not.toContain('hash:')
    expect(finalEvidenceSource).not.toContain('ruleVersion')
    expect(finalEvidenceSource).not.toContain('sourceDocument:')
    expect(finalEvidenceSource).not.toContain('productFact')
    expect(finalEvidenceSource).not.toContain('retentionGrade')
    expect(finalEvidenceSource).not.toContain('Blockchain Ledger Timestamped')
  })

  it('uses Figma-aligned final comments without rendering the signature hash code', () => {
    const detailSource = sources['../domains/evidence-pack/pages/EvidencePackDetailPage.tsx']

    expect(detailSource).toContain('function FinalNotesSection')
    expect(detailSource).toContain('Compliance Review Final Comments')
    expect(detailSource).toContain('finalComment')
    expect(detailSource).not.toContain('<Card title="Compliance Review Final Comments">')
    expect(detailSource).not.toContain('<Card title="Signature & Final Decision">')
    expect(detailSource).not.toContain('Sig:')
    expect(detailSource).not.toContain('DecisionBadge')
  })
})
