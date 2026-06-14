import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, DataTable, Drawer, Field, PageHeader, SelectField } from '../../../components/ui'
import type { DataTableSortDirection } from '../../../components/ui'
import { uiTokens } from '../../../design/tokens'
import { fetchLearningList, processLearning } from '../api'
import type { LearningLoopRow, LearningProcessStatus } from '../api'

const pageSize = 5
type LearningSortKey = 'candidateId' | 'evidencePackId' | 'contentId' | 'productTitle' | 'loadStatus'
type LearningFilters = {
  query: string
  loadStatus: string
}

const initialFilters: LearningFilters = {
  query: '',
  loadStatus: 'ALL',
}

const loadStatusLabels = {
  APPROVED: '승인됨',
  REJECTED: '거절됨',
  PENDING: '대기중',
} as const

const learningTableHeaders = [
  { label: 'Candidate ID', sortKey: 'candidateId' },
  { label: 'Evidence Pack ID', sortKey: 'evidencePackId' },
  { label: '콘텐츠 ID', sortKey: 'contentId' },
  { label: '콘텐츠 제목', sortKey: 'productTitle' },
  { label: '적재 상태', sortKey: 'loadStatus' },
  { label: '액션', sortable: false },
]

function LearningLoadStatusText({ status }: { status: LearningLoopRow['loadStatus'] }) {
  const colorClass = status === 'APPROVED'
    ? uiTokens.color.success
    : status === 'REJECTED'
      ? uiTokens.color.danger
      : uiTokens.color.bodyText

  return <span className={`font-semibold ${colorClass}`}>{loadStatusLabels[status]}</span>
}

export function LearningLoopPage() {
  const [items, setItems] = useState<LearningLoopRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [filters, setFilters] = useState<LearningFilters>(initialFilters)
  const [appliedFilters, setAppliedFilters] = useState<LearningFilters>(initialFilters)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortKey, setSortKey] = useState<LearningSortKey | null>(null)
  const [sortDirection, setSortDirection] = useState<DataTableSortDirection>(null)
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null)
  const selectedCandidate = selectedCandidateId ? items.find((candidate) => candidate.candidateId === selectedCandidateId) ?? null : null
  const selectedCandidateProcessed = selectedCandidate ? selectedCandidate.loadStatus === 'APPROVED' || selectedCandidate.loadStatus === 'REJECTED' : false
  const openCandidateDetails = (candidateId: string) => setSelectedCandidateId(candidateId)
  const closeCandidateDetails = () => setSelectedCandidateId(null)
  const setFilter = (field: keyof LearningFilters, value: string) => {
    setFilters((current) => ({ ...current, [field]: value }))
  }

  useEffect(() => {
    let cancelled = false

    setIsLoading(true)
    fetchLearningList().then((nextItems) => {
      if (cancelled) {
        return
      }

      setItems(nextItems)
      setErrorMessage('')
    }).catch(() => {
      if (!cancelled) {
        setErrorMessage('Learning Loop 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')
      }
    }).finally(() => {
      if (!cancelled) {
        setIsLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const filteredItems = items.filter((candidate) => {
    const query = appliedFilters.query.trim().toLowerCase()
    const searchableText = [candidate.candidateId, candidate.evidencePackId, candidate.contentId, candidate.productTitle].join(' ').toLowerCase()

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
  const processSelectedCandidate = async (learningStatus: LearningProcessStatus) => {
    if (!selectedCandidate) {
      return
    }

    setIsProcessing(true)
    setErrorMessage('')

    try {
      await processLearning(selectedCandidate.learningId, learningStatus)
      setStatusMessage(learningStatus === 'APPROVED' ? 'Learning Loop 후보를 승인했습니다.' : 'Learning Loop 후보를 거절했습니다.')
      closeCandidateDetails()
      setReloadKey((current) => current + 1)
    } catch {
      setErrorMessage('Learning Loop 처리 요청에 실패했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className={uiTokens.spacing.stack}>
      <PageHeader
        eyebrow="Learning Loop > 적재 문서 Queue"
        title="Learning Loop - 적재 문서 Queue"
        description="Evidence Pack 기반 참조 문서의 적재 승인 상태를 관리합니다."
      />
      <Card className={`mb-6 ${uiTokens.color.primaryBorder} ${uiTokens.color.primarySurface}`} title="데이터 활용 가이드">
        <p className={`${uiTokens.typography.body} ${uiTokens.color.primary}`}>Evidence Pack 기반의 학습 후보 데이터를 검토하고 적재 승인 상태를 관리합니다.</p>
      </Card>
      {(isLoading || errorMessage || statusMessage) && (
        <div className={`${uiTokens.radius.panel} border ${errorMessage ? 'border-red-200 bg-red-50' : uiTokens.color.border} ${uiTokens.spacing.cardCompact}`}>
          <p className={`${uiTokens.typography.body} ${errorMessage ? uiTokens.color.danger : uiTokens.color.bodyText}`}>
            {errorMessage || statusMessage || 'Learning Loop 목록을 불러오는 중입니다.'}
          </p>
        </div>
      )}
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
              <Link className={uiTokens.typography.linkText} to={`/evidence-pack/${candidate.comId}`}>
                {candidate.evidencePackId}
              </Link>
            </td>
            <td className={uiTokens.spacing.tableCellRelaxed}>
              <Link className={uiTokens.typography.linkText} to="/product-truth">
                {candidate.contentId}
              </Link>
            </td>
            <td className={uiTokens.spacing.tableCellRelaxed}>
              <Link className={uiTokens.typography.linkText} to="/product-truth">
                {candidate.productTitle}
              </Link>
            </td>
            <td className={uiTokens.spacing.tableCellRelaxed}>
              <LearningLoadStatusText status={candidate.loadStatus} />
            </td>
            <td className={uiTokens.spacing.tableCellRelaxed}>
              <Button variant="secondary" onClick={() => openCandidateDetails(candidate.candidateId)}>상세보기</Button>
            </td>
          </tr>
        ))}
        {paginatedItems.length === 0 && (
          <tr>
            <td className={`px-5 py-10 text-center ${uiTokens.typography.body} ${uiTokens.color.mutedText}`} colSpan={6}>
              표시할 Learning Loop 후보가 없습니다.
            </td>
          </tr>
        )}
      </DataTable>
      <Drawer
        title="Candidate Details"
        open={selectedCandidate !== null}
        onClose={closeCandidateDetails}
        width="sm"
        footer={
          selectedCandidateProcessed && selectedCandidate ? (
            <Button className="w-full" disabled>{selectedCandidate.loadStatus === 'APPROVED' ? '승인됨' : '거절됨'}</Button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" disabled={isProcessing} onClick={() => processSelectedCandidate('REJECT')}>거절</Button>
              <Button disabled={isProcessing} onClick={() => processSelectedCandidate('APPROVED')}>승인</Button>
            </div>
          )
        }
      >
        {selectedCandidate && (
          <div className="grid gap-5">
            <Card title="Candidate Details">
              <p className={`font-mono text-sm font-bold ${uiTokens.color.primary}`}>{selectedCandidate.candidateId}</p>
              <p className={`mt-2 ${uiTokens.typography.helper}`}>Score {selectedCandidate.score}</p>
            </Card>
            <Card title="연결 콘텐츠">
              <dl className="grid gap-3 text-sm">
                <div>
                  <dt className={uiTokens.color.mutedText}>Evidence Pack ID</dt>
                  <dd>
                    <Link className={uiTokens.typography.linkText} to={`/evidence-pack/${selectedCandidate.comId}`}>
                      {selectedCandidate.evidencePackId}
                    </Link>
                  </dd>
                </div>
                <div>
                  <dt className={uiTokens.color.mutedText}>콘텐츠 ID</dt>
                  <dd>
                    <Link className={uiTokens.typography.linkText} to="/product-truth">
                      {selectedCandidate.contentId}
                    </Link>
                  </dd>
                </div>
              </dl>
            </Card>
            <Card title="적재 가능한 형태의 문서" subtitle="Evidence Pack에서 참조 문서로 적재된 형태의 미리보기입니다.">
              <div className={`${uiTokens.radius.panel} border ${uiTokens.color.border} ${uiTokens.color.surfaceMuted} p-4`}>
                <p className={`${uiTokens.typography.tableHeader} ${uiTokens.color.mutedText}`}>적재 문서 미리보기</p>
                <pre className={`mt-3 whitespace-pre-wrap break-words font-mono text-xs leading-5 ${uiTokens.color.headingText}`}>
                  {JSON.stringify({
                    candidate_id: selectedCandidate.candidateId,
                    evidence_pack_id: selectedCandidate.evidencePackId,
                    source_content_id: selectedCandidate.contentId,
                    compliance_id: selectedCandidate.comId,
                    document_type: 'learning_candidate',
                    load_status: loadStatusLabels[selectedCandidate.loadStatus],
                    learning_content: selectedCandidate.learningContent,
                  }, null, 2)}
                </pre>
              </div>
            </Card>
            <Card title="적재 문서 Metadata">
              <dl className="grid gap-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className={uiTokens.color.mutedText}>contentTitle</dt>
                  <dd className={`font-semibold ${uiTokens.color.headingText}`}>{selectedCandidate.productTitle}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className={uiTokens.color.mutedText}>learningId</dt>
                  <dd className={`font-semibold ${uiTokens.color.headingText}`}>{selectedCandidate.learningId}</dd>
                </div>
              </dl>
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  )
}
