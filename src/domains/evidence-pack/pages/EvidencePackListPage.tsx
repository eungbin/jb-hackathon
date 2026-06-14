import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { RiskLevel } from '../../../types'
import { Badge, Button, DataTable, Field, PageHeader, RiskBadge, SelectField } from '../../../components/ui'
import type { DataTableSortDirection } from '../../../components/ui'
import { uiTokens } from '../../../design/tokens'
import { updateTextField } from '../../../utils/formState'
import { formatChannel } from '../../../utils/labels'
import { fetchEvidencePackResults } from '../api'
import type { EvidencePackComplianceStatus, EvidencePackLearningStatus, EvidencePackRow } from '../api'

const riskOptions: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const statusOptions: EvidencePackComplianceStatus[] = ['CONDITIONALLY_APPROVED', 'REJECTED', 'APPROVED']
const pageSize = 5
type PackSortKey = 'packId' | 'contentId' | 'title' | 'productName' | 'channel' | 'comStatus' | 'riskLevel' | 'finalizedAt' | 'reviewer' | 'learningStatus'
type PackFilters = {
  query: string
  reviewer: string
  channel: string
  status: string
  risk: string
  finalizedAt: string
  learning: string
}

const initialFilters: PackFilters = {
  query: '',
  reviewer: '',
  channel: 'ALL',
  status: 'ALL',
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
  { label: '심사 상태', sortKey: 'comStatus' },
  { label: '위험등급', sortKey: 'riskLevel' },
  { label: '심사 시각', sortKey: 'finalizedAt' },
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

const complianceStatusLabels: Record<EvidencePackComplianceStatus, string> = {
  CONDITIONALLY_APPROVED: '조건부 승인',
  REJECTED: '거절',
  APPROVED: '승인',
}

const complianceStatusTones: Record<EvidencePackComplianceStatus, 'blue' | 'green' | 'red'> = {
  CONDITIONALLY_APPROVED: 'blue',
  REJECTED: 'red',
  APPROVED: 'green',
}

const learningStatusLabels: Record<Exclude<EvidencePackLearningStatus, null>, string> = {
  PENDING: '러닝루프 대기',
  REJECT: '러닝루프 거절',
  APPROVED: '러닝루프 승인',
}

const learningStatusTones: Record<Exclude<EvidencePackLearningStatus, null>, 'green' | 'orange' | 'red'> = {
  PENDING: 'orange',
  REJECT: 'red',
  APPROVED: 'green',
}

function ComplianceStatusBadge({ status }: { status: EvidencePackComplianceStatus }) {
  return <Badge tone={complianceStatusTones[status]}>{complianceStatusLabels[status]}</Badge>
}

function EvidenceLearningBadge({ status }: { status: EvidencePackLearningStatus }) {
  if (!status) {
    return <Badge tone="gray">러닝루프 미생성</Badge>
  }

  return <Badge tone={learningStatusTones[status]}>{learningStatusLabels[status]}</Badge>
}

function NullableRiskBadge({ level }: { level: RiskLevel | null }) {
  return level ? <RiskBadge level={level} /> : <Badge tone="gray">미정</Badge>
}

export function EvidencePackListPage() {
  const [items, setItems] = useState<EvidencePackRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [filters, setFilters] = useState<PackFilters>(initialFilters)
  const [appliedFilters, setAppliedFilters] = useState<PackFilters>(initialFilters)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortKey, setSortKey] = useState<PackSortKey | null>(null)
  const [sortDirection, setSortDirection] = useState<DataTableSortDirection>(null)
  const setFilter = (field: keyof typeof filters, value: string) => {
    setFilters((current) => updateTextField(current, field, value))
  }

  useEffect(() => {
    let cancelled = false

    setIsLoading(true)
    fetchEvidencePackResults().then((nextItems) => {
      if (cancelled) {
        return
      }

      setItems(nextItems)
      setErrorMessage('')
    }).catch(() => {
      if (!cancelled) {
        setErrorMessage('Evidence Pack 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')
      }
    }).finally(() => {
      if (!cancelled) {
        setIsLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  const filteredItems = items.filter((pack) => {
    const query = appliedFilters.query.trim().toLowerCase()
    const reviewer = appliedFilters.reviewer.trim().toLowerCase()
    const searchableText = [pack.packId, String(pack.comId), pack.contentId, pack.title, pack.productName].join(' ').toLowerCase()
    const reviewerText = pack.reviewer.toLowerCase()

    return (
      (!query || searchableText.includes(query)) &&
      (!reviewer || reviewerText.includes(reviewer)) &&
      (appliedFilters.channel === 'ALL' || pack.channel === appliedFilters.channel) &&
      (appliedFilters.status === 'ALL' || pack.comStatus === appliedFilters.status) &&
      (appliedFilters.risk === 'ALL' || (appliedFilters.risk === 'NONE' ? pack.riskLevel === null : pack.riskLevel === appliedFilters.risk)) &&
      (!appliedFilters.finalizedAt.trim() || pack.finalizedAt.includes(appliedFilters.finalizedAt.trim())) &&
      (appliedFilters.learning === 'ALL' || (appliedFilters.learning === 'NONE' ? pack.learningStatus === null : pack.learningStatus === appliedFilters.learning))
    )
  })
  const sortedItems = !sortKey || !sortDirection ? filteredItems : [...filteredItems].sort((firstPack, secondPack) => {
    const directionMultiplier = sortDirection === 'asc' ? 1 : -1

    if (sortKey === 'riskLevel') {
      const firstRank = firstPack.riskLevel ? riskSortRank[firstPack.riskLevel] : 0
      const secondRank = secondPack.riskLevel ? riskSortRank[secondPack.riskLevel] : 0

      return (firstRank - secondRank) * directionMultiplier
    }

    return String(firstPack[sortKey] ?? '').localeCompare(String(secondPack[sortKey] ?? ''), 'ko') * directionMultiplier
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
      {(isLoading || errorMessage) && (
        <div className={`mb-6 ${uiTokens.radius.panel} border ${errorMessage ? 'border-red-200 bg-red-50' : uiTokens.color.border} ${uiTokens.spacing.cardCompact}`}>
          <p className={`${uiTokens.typography.body} ${errorMessage ? uiTokens.color.danger : uiTokens.color.bodyText}`}>
            {errorMessage || 'Evidence Pack 목록을 불러오는 중입니다.'}
          </p>
        </div>
      )}
      <DataTable
        className={`${uiTokens.spacing.section} overflow-hidden ${uiTokens.radius.panel} border ${uiTokens.color.border} ${uiTokens.color.surface} ${uiTokens.shadow.panel}`}
        filters={
          <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" onSubmit={applyFilters}>
            <Field label="통합 검색" value={filters.query} onChange={(value) => setFilter('query', value)} />
            <Field label="준법관리자" value={filters.reviewer} onChange={(value) => setFilter('reviewer', value)} />
            <SelectField label="채널" value={filters.channel} onChange={(value) => setFilter('channel', value)} options={[{ value: 'ALL', label: '전체 채널' }, { value: 'APP_PUSH', label: '앱푸시' }, { value: 'SNS', label: 'SNS' }, { value: 'BANNER', label: '배너' }, { value: 'SMS', label: 'SMS' }]} />
            <SelectField label="심사 상태" value={filters.status} onChange={(value) => setFilter('status', value)} options={[{ value: 'ALL', label: '전체' }, ...statusOptions.map((status) => ({ value: status, label: complianceStatusLabels[status] }))]} />
            <SelectField label="최고 위험등급" value={filters.risk} onChange={(value) => setFilter('risk', value)} options={[{ value: 'ALL', label: '전체' }, ...riskOptions.map((risk) => ({ value: risk, label: risk })), { value: 'NONE', label: '미정' }]} />
            <Field label="심사 시각" value={filters.finalizedAt} onChange={(value) => setFilter('finalizedAt', value)} />
            <SelectField label="Learning Loop 상태" value={filters.learning} onChange={(value) => setFilter('learning', value)} options={[{ value: 'ALL', label: '전체' }, { value: 'PENDING', label: '러닝루프 대기' }, { value: 'APPROVED', label: '러닝루프 승인' }, { value: 'REJECT', label: '러닝루프 거절' }, { value: 'NONE', label: '미생성' }]} />
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
              <ComplianceStatusBadge status={pack.comStatus} />
            </td>
            <td className={uiTokens.spacing.tableCell}>
              <NullableRiskBadge level={pack.riskLevel} />
            </td>
            <td className={uiTokens.spacing.tableCell}>{pack.finalizedAt}</td>
            <td className={uiTokens.spacing.tableCell}>{pack.reviewer}</td>
            <td className={uiTokens.spacing.tableCell}>
              <EvidenceLearningBadge status={pack.learningStatus} />
            </td>
            <td className={uiTokens.spacing.tableCell}>
              <Link to={`/evidence-pack/${pack.comId}`}>
                <Button variant="secondary">상세보기</Button>
              </Link>
            </td>
          </tr>
        ))}
        {paginatedItems.length === 0 && (
          <tr>
            <td className={`px-5 py-10 text-center ${uiTokens.typography.body} ${uiTokens.color.mutedText}`} colSpan={11}>
              표시할 Evidence Pack이 없습니다.
            </td>
          </tr>
        )}
      </DataTable>
    </div>
  )
}
