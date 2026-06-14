import { describe, expect, it } from 'vitest'

const pageSources = import.meta.glob('../domains/**/pages/*.tsx', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

describe('table filter behavior', () => {
  it('uses submit-applied filters for Learning Loop', () => {
    const source = pageSources['../domains/learning-loop/pages/LearningLoopPage.tsx']

    expect(source).toContain('const [appliedFilters, setAppliedFilters]')
    expect(source).toContain('const applyFilters = (event?: FormEvent<HTMLFormElement>)')
    expect(source).toContain('onSubmit={applyFilters}')
    expect(source).toContain('appliedFilters.query')
    expect(source).toContain('appliedFilters.loadStatus')
    expect(source).toContain('type="submit">조회')
  })

  it('uses submit-applied filters for Evidence Pack archive', () => {
    const source = pageSources['../domains/evidence-pack/pages/EvidencePackListPage.tsx']

    expect(source).toContain('const [appliedFilters, setAppliedFilters]')
    expect(source).toContain('const applyFilters = (event?: FormEvent<HTMLFormElement>)')
    expect(source).toContain('onSubmit={applyFilters}')
    expect(source).toContain('appliedFilters.query')
    expect(source).toContain('appliedFilters.reviewer')
    expect(source).toContain('type="submit">조회')
  })

  it('loads Evidence Pack archive rows from the results API', () => {
    const source = pageSources['../domains/evidence-pack/pages/EvidencePackListPage.tsx']

    expect(source).toContain('fetchEvidencePackResults')
    expect(source).toContain('const [items, setItems]')
    expect(source).not.toContain('evidencePackListData')
    expect(source).toContain('comStatus')
    expect(source).toContain('learningStatus')
  })

  it('labels Evidence Pack archive finalized time as review time', () => {
    const source = pageSources['../domains/evidence-pack/pages/EvidencePackListPage.tsx']

    expect(source).toContain("{ label: '심사 시각', sortKey: 'finalizedAt' }")
    expect(source).toContain('<Field label="심사 시각" value={filters.finalizedAt} onChange={(value) => setFilter(\'finalizedAt\', value)} />')
    expect(source).not.toContain('확정 시각')
  })

  it('renders Evidence Pack learning status as an action button', () => {
    const source = pageSources['../domains/evidence-pack/pages/EvidencePackListPage.tsx']

    expect(source).toContain('function EvidenceLearningAction')
    expect(source).toContain('processLearning')
    expect(source).toContain('LearningProcessStatus')
    expect(source).toContain("if (status === 'PENDING')")
    expect(source).toContain("onProcessLearning(learningId, 'APPROVED')")
    expect(source).toContain("onProcessLearning(learningId, 'REJECT')")
    expect(source).toContain('<EvidenceLearningAction')
    expect(source).toContain('learningId={pack.learningId}')
    expect(source).toContain('status={pack.learningStatus}')
    expect(source).not.toContain('적재하기')
    expect(source).not.toContain('EvidenceLearningBadge')
  })

  it('links Evidence Pack detail with compliance id for the detail API', () => {
    const source = pageSources['../domains/evidence-pack/pages/EvidencePackListPage.tsx']

    expect(source).toContain('to={`/evidence-pack/${pack.comId}`}')
  })

  it('uses submit-applied filters for Rules & Sources', () => {
    const source = pageSources['../domains/rules-sources/pages/RulesSourcesPage.tsx']

    expect(source).toContain('const [appliedFilters, setAppliedFilters]')
    expect(source).toContain('const applyFilters = (event?: FormEvent<HTMLFormElement>)')
    expect(source).toContain('onSubmit={applyFilters}')
    expect(source).toContain('appliedFilters.query')
    expect(source).toContain('appliedFilters.triggerKeywords')
    expect(source).toContain('type="submit">조회')
  })

  it('labels the Compliance Review submit action as 조회', () => {
    const source = pageSources['../domains/compliance-review/pages/ComplianceReviewListPage.tsx']

    expect(source).toContain('const [appliedFilters, setAppliedFilters]')
    expect(source).toContain('onSubmit={applyFilters}')
    expect(source).toContain('type="submit">조회')
    expect(source).not.toContain('type="submit">적용하기')
  })
})
