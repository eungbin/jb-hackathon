import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { learningData } from '../../../data/mockData'
import { Button, Card, DataTable, Drawer, Field, PageHeader, SelectField } from '../../../components/ui'
import type { DataTableSortDirection } from '../../../components/ui'
import { uiTokens } from '../../../design/tokens'

const pageSize = 5
type LearningSortKey = 'candidateId' | 'sourcePackId' | 'productTitle' | 'loadStatus'
type LearningFilters = {
  query: string
  loadStatus: string
}

const initialFilters: LearningFilters = {
  query: '',
  loadStatus: 'ALL',
}

const loadStatusLabels = {
  APPROVED: '승인',
  REJECTED: '거절',
  PENDING: '대기',
} as const

const learningTableHeaders = [
  { label: 'Candidate ID', sortKey: 'candidateId' },
  { label: 'Evidence Pack ID', sortKey: 'sourcePackId' },
  { label: '상품명', sortKey: 'productTitle' },
  { label: '적재 상태', sortKey: 'loadStatus' },
  { label: '액션', sortable: false },
]

function getSelectedCandidateDetails(selectedCandidateId: string | null) {
  if (!selectedCandidateId) {
    return null
  }

  const queueItem = learningData.items.find((candidate) => candidate.candidateId === selectedCandidateId)

  if (!queueItem) {
    return null
  }

  return {
    ...learningData.selectedCandidate,
    candidateId: queueItem.candidateId,
    sourcePackId: queueItem.sourcePackId,
    loadStatus: queueItem.loadStatus,
    metadata: learningData.selectedCandidate.metadata,
  }
}

export function LearningLoopPage() {
  const [filters, setFilters] = useState<LearningFilters>(initialFilters)
  const [appliedFilters, setAppliedFilters] = useState<LearningFilters>(initialFilters)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortKey, setSortKey] = useState<LearningSortKey | null>(null)
  const [sortDirection, setSortDirection] = useState<DataTableSortDirection>(null)
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null)
  const selectedCandidate = getSelectedCandidateDetails(selectedCandidateId)
  const openCandidateDetails = (candidateId: string) => setSelectedCandidateId(candidateId)
  const closeCandidateDetails = () => setSelectedCandidateId(null)
  const setFilter = (field: keyof LearningFilters, value: string) => {
    setFilters((current) => ({ ...current, [field]: value }))
  }
  const filteredItems = learningData.items.filter((candidate) => {
    const query = appliedFilters.query.trim().toLowerCase()
    const searchableText = [candidate.candidateId, candidate.sourcePackId, candidate.productTitle].join(' ').toLowerCase()

    return (
      (!query || searchableText.includes(query)) &&
      (appliedFilters.loadStatus === 'ALL' || candidate.loadStatus === appliedFilters.loadStatus)
    )
  })
  const sortedItems = !sortKey || !sortDirection ? filteredItems : [...filteredItems].sort((firstCandidate, secondCandidate) => {
    const directionMultiplier = sortDirection === 'asc' ? 1 : -1

    return String(firstCandidate[sortKey]).localeCompare(String(secondCandidate[sortKey]), 'ko') * directionMultiplier
  })
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize))
  const visiblePage = Math.min(currentPage, totalPages)
  const paginatedItems = sortedItems.slice((visiblePage - 1) * pageSize, visiblePage * pageSize)
  const applyFilters = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    setAppliedFilters(filters)
    setCurrentPage(1)
  }
  const resetFilters = () => {
    setFilters(initialFilters)
    setAppliedFilters(initialFilters)
    setCurrentPage(1)
  }

  return (
    <div className={uiTokens.spacing.stack}>
      <PageHeader
        eyebrow="Learning Loop > 적재 문서 Queue"
        title="Learning Loop - 적재 문서 Queue"
        description="Evidence Pack 기반 참조 문서의 적재 승인 상태를 관리합니다."
      />
      <Card className={`mb-6 ${uiTokens.color.primaryBorder} ${uiTokens.color.primarySurface}`} title="데이터 활용 가이드">
        <p className={`${uiTokens.typography.body} ${uiTokens.color.primary}`}>{learningData.guide}</p>
      </Card>
      <DataTable
        className={`overflow-hidden ${uiTokens.radius.panel} border ${uiTokens.color.border} ${uiTokens.color.surface} ${uiTokens.shadow.panel}`}
        filters={
          <form className="grid gap-4 md:grid-cols-3" onSubmit={applyFilters}>
            <Field label="통합 검색" value={filters.query} onChange={(value) => setFilter('query', value)} />
            <SelectField
              label="적재 상태"
              value={filters.loadStatus}
              onChange={(value) => setFilter('loadStatus', value)}
              options={[
                { value: 'ALL', label: '전체' },
                ...Object.entries(loadStatusLabels).map(([value, label]) => ({ value, label })),
              ]}
            />
            <div className="flex items-end gap-2">
              <Button variant="secondary" type="button" onClick={resetFilters}>
                초기화
              </Button>
              <Button type="submit">조회</Button>
            </div>
          </form>
        }
        headers={learningTableHeaders}
        pagination={{
          currentPage: visiblePage,
          itemLabel: '적재 문서',
          onPageChange: setCurrentPage,
          pageSize,
          totalItems: sortedItems.length,
          totalPages,
        }}
        sortDirection={sortDirection}
        sortKey={sortKey}
        onSortChange={(nextSortKey, nextSortDirection) => {
          setSortKey(nextSortKey as LearningSortKey | null)
          setSortDirection(nextSortDirection)
        }}
      >
          {paginatedItems.map((candidate) => (
            <tr key={candidate.candidateId}>
              <td className={`${uiTokens.spacing.tableCellRelaxed} font-mono text-xs`}>{candidate.candidateId}</td>
              <td className={uiTokens.spacing.tableCellRelaxed}>
                <Link className={uiTokens.typography.linkText} to={`/evidence-pack/${candidate.sourcePackId}`}>
                  {candidate.sourcePackId}
                </Link>
              </td>
              <td className={uiTokens.spacing.tableCellRelaxed}>
                <Link className={uiTokens.typography.linkText} to="/product-truth">
                  {candidate.productTitle}
                </Link>
              </td>
              <td className={uiTokens.spacing.tableCellRelaxed}>{loadStatusLabels[candidate.loadStatus]}</td>
              <td className={uiTokens.spacing.tableCellRelaxed}>
                <Button variant="secondary" onClick={() => openCandidateDetails(candidate.candidateId)}>상세보기</Button>
              </td>
            </tr>
          ))}
      </DataTable>
      <Drawer
        title="Candidate Details"
        open={selectedCandidate !== null}
        onClose={closeCandidateDetails}
        width="sm"
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={closeCandidateDetails}>수정 요청</Button>
            <Button>후보 승인</Button>
          </div>
        }
      >
        {selectedCandidate && (
          <div className="grid gap-5">
            <Card title="Candidate Details">
              <p className={`font-mono text-sm font-bold ${uiTokens.color.primary}`}>{selectedCandidate.candidateId}</p>
              <p className={`mt-2 ${uiTokens.typography.helper}`}>Score {selectedCandidate.score}</p>
            </Card>
            <Card title="Source Evidence Pack">
              <Link className={uiTokens.typography.linkText} to={`/evidence-pack/${selectedCandidate.sourcePackId}`}>
                {selectedCandidate.sourcePackId}
              </Link>
            </Card>
            <Card title="적재 가능한 형태의 문서" subtitle="Evidence Pack에서 참조 문서로 적재된 형태의 미리보기입니다.">
              <div className={`${uiTokens.radius.panel} border ${uiTokens.color.border} ${uiTokens.color.surfaceMuted} p-4`}>
                <p className={`${uiTokens.typography.tableHeader} ${uiTokens.color.mutedText}`}>적재 문서 미리보기</p>
                <pre className={`mt-3 whitespace-pre-wrap break-words font-mono text-xs leading-5 ${uiTokens.color.headingText}`}>
                  {JSON.stringify({
                    candidate_id: selectedCandidate.candidateId,
                    source_evidence_pack_id: selectedCandidate.sourcePackId,
                    document_type: 'reference_document',
                    load_status: loadStatusLabels[selectedCandidate.loadStatus],
                    masked_text: selectedCandidate.maskedText,
                  }, null, 2)}
                </pre>
              </div>
            </Card>
            <Card title="적재 문서 Metadata">
              <dl className="grid gap-2 text-sm">
                {Object.entries(selectedCandidate.metadata).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4">
                    <dt className={uiTokens.color.mutedText}>{key}</dt>
                    <dd className={`font-semibold ${uiTokens.color.headingText}`}>{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  )
}
