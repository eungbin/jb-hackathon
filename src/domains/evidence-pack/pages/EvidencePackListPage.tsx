import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { evidencePackListData } from '../../../data/mockData'
import type { ReviewDecision, RiskLevel } from '../../../types'
import { Button, DataTable, DecisionBadge, Field, LearningBadge, PageHeader, RiskBadge, SelectField } from '../../../components/ui'
import type { DataTableSortDirection } from '../../../components/ui'
import { uiTokens } from '../../../design/tokens'
import { updateTextField } from '../../../utils/formState'
import { decisionLabels, formatChannel } from '../../../utils/labels'

const riskOptions: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const decisionOptions: ReviewDecision[] = ['APPROVED', 'CONDITIONALLY_APPROVED', 'REVISION_REQUESTED', 'REJECTED', 'NEED_MORE_INFO']
const pageSize = 5
type PackSortKey = 'packId' | 'contentId' | 'title' | 'productName' | 'channel' | 'finalDecision' | 'riskLevel' | 'finalizedAt' | 'reviewer' | 'learningStatus'
type PackFilters = {
  query: string
  reviewer: string
  channel: string
  decision: string
  risk: string
  finalizedAt: string
  learning: string
}

const initialFilters: PackFilters = {
  query: '',
  reviewer: '',
  channel: 'ALL',
  decision: 'ALL',
  risk: 'ALL',
  finalizedAt: '',
  learning: 'ALL',
}

const packTableHeaders = [
  { label: 'Pack ID', sortKey: 'packId' },
  { label: '콘텐츠 ID', sortKey: 'contentId' },
  { label: '콘텐츠명', sortKey: 'title' },
  { label: '상품명', sortKey: 'productName' },
  { label: '채널', sortKey: 'channel' },
  { label: '최종 판단', sortKey: 'finalDecision' },
  { label: '위험등급', sortKey: 'riskLevel' },
  { label: '확정 시각', sortKey: 'finalizedAt' },
  { label: '준법관리자', sortKey: 'reviewer' },
  { label: 'Learning', sortKey: 'learningStatus' },
  { label: '액션', sortable: false },
]

const riskSortRank: Record<RiskLevel, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
}

export function EvidencePackListPage() {
  const [filters, setFilters] = useState<PackFilters>(initialFilters)
  const [appliedFilters, setAppliedFilters] = useState<PackFilters>(initialFilters)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortKey, setSortKey] = useState<PackSortKey | null>(null)
  const [sortDirection, setSortDirection] = useState<DataTableSortDirection>(null)
  const setFilter = (field: keyof typeof filters, value: string) => {
    setFilters((current) => updateTextField(current, field, value))
  }
  const filteredItems = evidencePackListData.items.filter((pack) => {
    const query = appliedFilters.query.trim().toLowerCase()
    const reviewer = appliedFilters.reviewer.trim().toLowerCase()
    const searchableText = [pack.packId, pack.contentId, pack.title, pack.productName].join(' ').toLowerCase()
    const reviewerText = [pack.reviewer, pack.reviewerRole].join(' ').toLowerCase()

    return (
      (!query || searchableText.includes(query)) &&
      (!reviewer || reviewerText.includes(reviewer)) &&
      (appliedFilters.channel === 'ALL' || pack.channel === appliedFilters.channel) &&
      (appliedFilters.decision === 'ALL' || pack.finalDecision === appliedFilters.decision) &&
      (appliedFilters.risk === 'ALL' || pack.riskLevel === appliedFilters.risk) &&
      (!appliedFilters.finalizedAt.trim() || pack.finalizedAt.includes(appliedFilters.finalizedAt.trim())) &&
      (appliedFilters.learning === 'ALL' || pack.learningStatus === appliedFilters.learning)
    )
  })
  const sortedItems = !sortKey || !sortDirection ? filteredItems : [...filteredItems].sort((firstPack, secondPack) => {
    const directionMultiplier = sortDirection === 'asc' ? 1 : -1

    if (sortKey === 'riskLevel') {
      return (riskSortRank[firstPack.riskLevel] - riskSortRank[secondPack.riskLevel]) * directionMultiplier
    }

    return String(firstPack[sortKey]).localeCompare(String(secondPack[sortKey]), 'ko') * directionMultiplier
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
    <div>
      <PageHeader
        eyebrow="Compliance Archive > Evidence Pack Archive"
        title="Evidence Pack 아카이브"
        description="준법 심의가 완료되어 봉인된 최종 증적 기록 목록입니다."
      />
      <DataTable
        className={`${uiTokens.spacing.section} overflow-hidden ${uiTokens.radius.panel} border ${uiTokens.color.border} ${uiTokens.color.surface} ${uiTokens.shadow.panel}`}
        filters={
          <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" onSubmit={applyFilters}>
            <Field label="통합 검색" value={filters.query} onChange={(value) => setFilter('query', value)} />
            <Field label="준법관리자" value={filters.reviewer} onChange={(value) => setFilter('reviewer', value)} />
            <SelectField label="채널" value={filters.channel} onChange={(value) => setFilter('channel', value)} options={[{ value: 'ALL', label: '전체 채널' }, { value: 'APP_PUSH', label: '앱푸시' }, { value: 'SNS', label: 'SNS' }, { value: 'BANNER', label: '배너' }, { value: 'SMS', label: 'SMS' }]} />
            <SelectField label="최종 판단" value={filters.decision} onChange={(value) => setFilter('decision', value)} options={[{ value: 'ALL', label: '전체' }, ...decisionOptions.map((decision) => ({ value: decision, label: decisionLabels[decision] }))]} />
            <SelectField label="최고 위험등급" value={filters.risk} onChange={(value) => setFilter('risk', value)} options={[{ value: 'ALL', label: '전체' }, ...riskOptions.map((risk) => ({ value: risk, label: risk }))]} />
            <Field label="확정 시각" value={filters.finalizedAt} onChange={(value) => setFilter('finalizedAt', value)} />
            <SelectField label="Learning Loop 상태" value={filters.learning} onChange={(value) => setFilter('learning', value)} options={[{ value: 'ALL', label: '전체' }, { value: 'CANDIDATE_RAW', label: '후보 원천' }, { value: 'REDACTED', label: '비식별화 완료' }, { value: 'EXCLUDED', label: '제외' }]} />
            <div className="flex items-end gap-2 xl:justify-end">
              <Button variant="secondary" className="min-w-24" type="button" onClick={resetFilters}>초기화</Button>
              <Button className="min-w-24" type="submit">조회</Button>
            </div>
          </form>
        }
        headers={packTableHeaders}
        pagination={{
          currentPage: visiblePage,
          itemLabel: 'Evidence Pack',
          onPageChange: setCurrentPage,
          pageSize,
          totalItems: sortedItems.length,
          totalPages,
        }}
        sortDirection={sortDirection}
        sortKey={sortKey}
        onSortChange={(nextSortKey, nextSortDirection) => {
          setSortKey(nextSortKey as PackSortKey | null)
          setSortDirection(nextSortDirection)
        }}
      >
          {paginatedItems.map((pack) => (
            <tr key={pack.packId}>
              <td className={`${uiTokens.spacing.tableCell} font-mono text-xs`}>{pack.packId}</td>
              <td className={uiTokens.spacing.tableCell}>{pack.contentId}</td>
              <td className={`${uiTokens.spacing.tableCell} font-semibold ${uiTokens.color.headingText}`}>{pack.title}</td>
              <td className={uiTokens.spacing.tableCell}>{pack.productName}</td>
              <td className={uiTokens.spacing.tableCell}>{formatChannel(pack.channel)}</td>
              <td className={uiTokens.spacing.tableCell}>
                <DecisionBadge decision={pack.finalDecision} />
              </td>
              <td className={uiTokens.spacing.tableCell}>
                <RiskBadge level={pack.riskLevel} />
              </td>
              <td className={uiTokens.spacing.tableCell}>{pack.finalizedAt}</td>
              <td className={uiTokens.spacing.tableCell}>{pack.reviewer}</td>
              <td className={uiTokens.spacing.tableCell}>
                <LearningBadge status={pack.learningStatus} />
              </td>
              <td className={uiTokens.spacing.tableCell}>
                <Link to={`/evidence-pack/${pack.packId}`}>
                  <Button variant="secondary">상세보기</Button>
                </Link>
              </td>
            </tr>
          ))}
      </DataTable>
    </div>
  )
}
