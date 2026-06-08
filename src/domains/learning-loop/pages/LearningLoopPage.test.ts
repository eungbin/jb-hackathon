import { describe, expect, it } from 'vitest'
import { learningData } from '../../../data/mockData'

const pageSources = import.meta.glob('./LearningLoopPage.tsx', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

const dataSources = import.meta.glob('../../../data/mockData.ts', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

describe('LearningLoopPage candidate details', () => {
  it('opens candidate details in a drawer from the detail action', () => {
    const source = pageSources['./LearningLoopPage.tsx']

    expect(source).toContain('Drawer')
    expect(source).toContain('selectedCandidateId')
    expect(source).toContain('openCandidateDetails(candidate.candidateId)')
    expect(source).toContain('open={selectedCandidate !== null}')
    expect(source).not.toContain('<aside className="grid content-start gap-5">')
  })

  it('renders evidence pack id and product name as separate table columns', () => {
    const source = pageSources['./LearningLoopPage.tsx']

    expect(source).toContain("'productTitle'")
    expect(source).toContain("{ label: 'Evidence Pack ID', sortKey: 'sourcePackId' }")
    expect(source).toContain("{ label: '상품명', sortKey: 'productTitle' }")
    expect(source).not.toContain("<p className={uiTokens.typography.helper}>{candidate.productTitle}</p>")
  })

  it('uses load status instead of dataset type and label status', () => {
    const source = pageSources['./LearningLoopPage.tsx']

    expect(source).toContain('loadStatus')
    expect(source).toContain('loadStatusLabels')
    expect(source).toContain("{ label: '적재 상태', sortKey: 'loadStatus' }")
    expect(source).toContain('승인')
    expect(source).toContain('거절')
    expect(source).toContain('대기')
    expect(source).not.toContain('datasetType')
    expect(source).not.toContain('Dataset Type')
    expect(source).not.toContain('labelStatus')
    expect(source).not.toContain('Label Status')
  })

  it('does not expose redaction status for loadable documents', () => {
    const source = pageSources['./LearningLoopPage.tsx']
    const dataSource = dataSources['../../../data/mockData.ts']

    expect(source).not.toContain('redactionStatus')
    expect(source).not.toContain('Redaction Status')
    expect(source).not.toContain('redaction_status')
    expect(dataSource).not.toContain('redactionStatus')
  })

  it('links evidence packs and product names to their detail screens', () => {
    const source = pageSources['./LearningLoopPage.tsx']

    expect(source).toContain("import { Link } from 'react-router-dom'")
    expect(source).toContain('to={`/evidence-pack/${candidate.sourcePackId}`}')
    expect(source).toContain('to="/product-truth"')
  })

  it('shows linked table text in primary blue with a persistent underline', () => {
    const source = pageSources['./LearningLoopPage.tsx']

    expect(source).toContain('className={uiTokens.typography.linkText}')
    expect(source).not.toContain('const linkedTableTextClass')
  })

  it('links the drawer source evidence pack and previews the loadable document', () => {
    const source = pageSources['./LearningLoopPage.tsx']

    expect(source).toContain('to={`/evidence-pack/${selectedCandidate.sourcePackId}`}')
    expect(source).toContain('적재 가능한 형태의 문서')
    expect(source).toContain('적재 문서 미리보기')
    expect(source).toContain('JSON.stringify')
    expect(source).toContain('masked_text')
    expect(source).not.toContain('dataset_type')
  })

  it('has enough rows to show pagination controls', () => {
    const source = pageSources['./LearningLoopPage.tsx']

    expect(source).toContain('const pageSize = 5')
    expect(source).toContain('pagination={{')
    expect(learningData.items.length).toBeGreaterThan(5)
  })
})
