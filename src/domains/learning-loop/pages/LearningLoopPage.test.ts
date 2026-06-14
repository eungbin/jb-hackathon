import { describe, expect, it } from 'vitest'

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

  it('renders content id and title as separate table columns', () => {
    const source = pageSources['./LearningLoopPage.tsx']

    expect(source).toContain("'productTitle'")
    expect(source).toContain("'evidencePackId'")
    expect(source).toContain("'contentId'")
    expect(source).toContain("{ label: 'Evidence Pack ID', sortKey: 'evidencePackId' }")
    expect(source).toContain("{ label: '콘텐츠 ID', sortKey: 'contentId' }")
    expect(source).toContain("{ label: '콘텐츠 제목', sortKey: 'productTitle' }")
    expect(source).not.toContain("<p className={uiTokens.typography.helper}>{candidate.productTitle}</p>")
  })

  it('uses load status instead of dataset type and label status', () => {
    const source = pageSources['./LearningLoopPage.tsx']

    expect(source).toContain('loadStatus')
    expect(source).toContain('loadStatusLabels')
    expect(source).toContain("{ label: '적재 상태', sortKey: 'loadStatus' }")
    expect(source).toContain('승인됨')
    expect(source).toContain('거절됨')
    expect(source).toContain('대기중')
    expect(source).not.toContain('datasetType')
    expect(source).not.toContain('Dataset Type')
    expect(source).not.toContain('labelStatus')
    expect(source).not.toContain('Label Status')
  })

  it('colors approved and rejected load statuses', () => {
    const source = pageSources['./LearningLoopPage.tsx']

    expect(source).toContain('function LearningLoadStatusText')
    expect(source).toContain("status === 'APPROVED'")
    expect(source).toContain('uiTokens.color.success')
    expect(source).toContain("status === 'REJECTED'")
    expect(source).toContain('uiTokens.color.danger')
    expect(source).toContain('<LearningLoadStatusText status={candidate.loadStatus} />')
  })

  it('does not expose redaction status for loadable documents', () => {
    const source = pageSources['./LearningLoopPage.tsx']
    const dataSource = dataSources['../../../data/mockData.ts']

    expect(source).not.toContain('redactionStatus')
    expect(source).not.toContain('Redaction Status')
    expect(source).not.toContain('redaction_status')
    expect(dataSource).not.toContain('redactionStatus')
  })

  it('links evidence pack ids to evidence detail and content ids to product truth', () => {
    const source = pageSources['./LearningLoopPage.tsx']

    expect(source).toContain("import { Link } from 'react-router-dom'")
    expect(source).toContain('to={`/evidence-pack/${candidate.comId}`}')
    expect(source).toContain('{candidate.evidencePackId}')
    expect(source).toContain('{candidate.contentId}')
    expect(source).toContain('to="/product-truth"')
  })

  it('shows linked table text in primary blue with a persistent underline', () => {
    const source = pageSources['./LearningLoopPage.tsx']

    expect(source).toContain('className={uiTokens.typography.linkText}')
    expect(source).not.toContain('const linkedTableTextClass')
  })

  it('links the drawer source content and previews the loadable document', () => {
    const source = pageSources['./LearningLoopPage.tsx']

    expect(source).toContain('to={`/evidence-pack/${selectedCandidate.comId}`}')
    expect(source).toContain('{selectedCandidate.evidencePackId}')
    expect(source).toContain('{selectedCandidate.contentId}')
    expect(source).toContain('적재 가능한 형태의 문서')
    expect(source).toContain('적재 문서 미리보기')
    expect(source).toContain('JSON.stringify')
    expect(source).toContain('evidence_pack_id')
    expect(source).toContain('learning_content')
    expect(source).not.toContain('dataset_type')
  })

  it('has enough rows to show pagination controls', () => {
    const source = pageSources['./LearningLoopPage.tsx']

    expect(source).toContain('const pageSize = 5')
    expect(source).toContain('pagination={{')
  })

  it('loads learning loop rows from the list API', () => {
    const source = pageSources['./LearningLoopPage.tsx']

    expect(source).toContain('fetchLearningList')
    expect(source).toContain('const [items, setItems]')
    expect(source).not.toContain('learningData')
  })

  it('processes learning loop approval and rejection through the API', () => {
    const source = pageSources['./LearningLoopPage.tsx']

    expect(source).toContain('processLearning')
    expect(source).toContain("processSelectedCandidate('REJECT')")
    expect(source).toContain("processSelectedCandidate('APPROVED')")
    expect(source).toContain('>거절</Button>')
    expect(source).toContain('>승인</Button>')
    expect(source).not.toContain('수정 요청')
    expect(source).not.toContain('후보 승인')
  })

  it('disables processing actions for already approved or rejected candidates', () => {
    const source = pageSources['./LearningLoopPage.tsx']

    expect(source).toContain('selectedCandidate.loadStatus ===')
    expect(source).toContain('selectedCandidateProcessed')
    expect(source).toContain("selectedCandidate.loadStatus === 'APPROVED' ? '승인됨' : '거절됨'")
    expect(source).toContain('disabled>')
  })
})
