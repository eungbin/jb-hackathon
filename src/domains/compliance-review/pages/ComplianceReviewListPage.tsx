import type { LucideIcon } from 'lucide-react'
import { AlertTriangle, CalendarCheck, ClipboardList, Search, UserCheck } from 'lucide-react'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, DataTable, PageHeader, RiskBadge } from '../../../components/ui'
import type { DataTableSortDirection } from '../../../components/ui'
import { reviewListData } from '../../../data/mockData'
import { uiTokens } from '../../../design/tokens'
import type { RiskLevel } from '../../../types'

type Filters = {
  query: string
  reviewer: string
  channel: string
  risk: string
  requestedStart: string
  requestedEnd: string
  publishStart: string
  publishEnd: string
}

const initialFilters: Filters = {
  query: '',
  reviewer: '',
  channel: 'ALL',
  risk: 'ALL',
  requestedStart: '',
  requestedEnd: '',
  publishStart: '',
  publishEnd: '',
}

const pageSize = 5
type ReviewSortKey = 'reviewId' | 'title' | 'productName' | 'channel' | 'riskLevel' | 'claimCount' | 'requester' | 'requestedAt' | 'plannedPublishDate'

const reviewTableHeaders = [
  { label: 'ID', sortKey: 'reviewId' },
  { label: '콘텐츠명', sortKey: 'title' },
  { label: '상품명', sortKey: 'productName' },
  { label: '채널', sortKey: 'channel' },
  { label: '위험등급', sortKey: 'riskLevel' },
  { label: 'Claim 수', sortKey: 'claimCount' },
  { label: '등록자', sortKey: 'requester' },
  { label: '요청일', sortKey: 'requestedAt' },
  { label: '배포 예정일', sortKey: 'plannedPublishDate' },
  { label: '액션', sortable: false },
]

const riskSortRank: Record<RiskLevel, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
}

const summaryCards: Array<{
  label: string
  value: string | number
  icon: LucideIcon
  tone: 'primary' | 'danger' | 'warning' | 'info'
}> = [
  { label: '전체 대기', value: reviewListData.summary.totalPending, icon: ClipboardList, tone: 'primary' },
  { label: '긴급 (Critical)', value: reviewListData.summary.critical, icon: AlertTriangle, tone: 'danger' },
  { label: '오늘 마감', value: reviewListData.summary.dueToday, icon: CalendarCheck, tone: 'warning' },
  { label: '내 요청', value: String(reviewListData.summary.myRequests).padStart(2, '0'), icon: UserCheck, tone: 'info' },
]

const summaryToneClasses: Record<(typeof summaryCards)[number]['tone'], string> = {
  primary: uiTokens.color.primary,
  danger: uiTokens.color.danger,
  warning: uiTokens.color.warning,
  info: uiTokens.color.info,
}

const reviewRows: Array<{
  reviewId: string
  title: string
  productName: string
  channel: string
  channelCode: string
  riskLevel: RiskLevel
  claimCount: number
  requester: string
  department: string
  requestedAt: string
  plannedPublishDate: string
}> = [
  {
    reviewId: 'REV-2024-00892',
    title: '[앱푸시] JB 청년우대 적금 출시 알림',
    productName: 'JB 청년우대 적금',
    channel: '앱푸시',
    channelCode: 'APP_PUSH',
    riskLevel: 'CRITICAL',
    claimCount: 24,
    requester: '김철수',
    department: '마케팅팀',
    requestedAt: '2024.11.18',
    plannedPublishDate: '2024.11.25',
  },
  {
    reviewId: 'REV-2024-00889',
    title: '[인스타] 마이핏 정기예금 홍보 이벤트',
    productName: '마이핏 정기예금',
    channel: 'SNS',
    channelCode: 'SNS',
    riskLevel: 'HIGH',
    claimCount: 12,
    requester: '이영희',
    department: '브랜드팀',
    requestedAt: '2024.11.17',
    plannedPublishDate: '2024.11.24',
  },
  {
    reviewId: 'REV-2024-00885',
    title: '[홈페이지] 퇴직연금 IRP 가입 가이드',
    productName: '퇴직연금 IRP',
    channel: '홈페이지',
    channelCode: 'BANNER',
    riskLevel: 'MEDIUM',
    claimCount: 18,
    requester: '박정민',
    department: '상품운영팀',
    requestedAt: '2024.11.17',
    plannedPublishDate: '2024.11.23',
  },
  {
    reviewId: 'REV-2024-00882',
    title: '[문자] 신규 서비스 약관 개정 안내',
    productName: '전체 서비스',
    channel: 'SMS',
    channelCode: 'SMS',
    riskLevel: 'LOW',
    claimCount: 8,
    requester: '최민수',
    department: '법무팀',
    requestedAt: '2024.11.16',
    plannedPublishDate: '2024.11.22',
  },
  {
    reviewId: 'REV-2024-00880',
    title: '[배너] 연금저축 펀드 수익률 랭킹',
    productName: '연금저축 펀드',
    channel: '배너',
    channelCode: 'BANNER',
    riskLevel: 'CRITICAL',
    claimCount: 15,
    requester: '정수아',
    department: '자산운용',
    requestedAt: '2024.11.16',
    plannedPublishDate: '2024.11.21',
  },
  {
    reviewId: 'REV-2024-00878',
    title: '[앱푸시] 직장인 신용대출 금리 안내',
    productName: '직장인 신용대출',
    channel: '앱푸시',
    channelCode: 'APP_PUSH',
    riskLevel: 'HIGH',
    claimCount: 10,
    requester: '한지우',
    department: '여신마케팅',
    requestedAt: '2024.11.15',
    plannedPublishDate: '2024.11.20',
  },
  {
    reviewId: 'REV-2024-00875',
    title: '[SNS] 카드 캐시백 이벤트 고지',
    productName: 'JB 캐시백 카드',
    channel: 'SNS',
    channelCode: 'SNS',
    riskLevel: 'MEDIUM',
    claimCount: 9,
    requester: '오세린',
    department: '카드사업팀',
    requestedAt: '2024.11.15',
    plannedPublishDate: '2024.11.19',
  },
  {
    reviewId: 'REV-2024-00872',
    title: '[문자] 보험료 자동이체 혜택 안내',
    productName: '생활안심 보험',
    channel: 'SMS',
    channelCode: 'SMS',
    riskLevel: 'LOW',
    claimCount: 6,
    requester: '강민재',
    department: '보험제휴팀',
    requestedAt: '2024.11.14',
    plannedPublishDate: '2024.11.18',
  },
]

function SummaryCard({ label, value, icon: Icon, tone }: (typeof summaryCards)[number]) {
  return (
    <article className={`${uiTokens.radius.panel} border ${uiTokens.color.border} ${uiTokens.color.surface} ${uiTokens.spacing.cardCompact} ${uiTokens.shadow.panel}`}>
      <div className="flex items-center justify-between">
        <p className={uiTokens.typography.label}>{label}</p>
        <Icon size={26} className={`opacity-20 ${summaryToneClasses[tone]}`} />
      </div>
      <div className="mt-2 flex items-end gap-1">
        <p className={uiTokens.typography.metricValue}>{value}</p>
        <span className={`pb-1 ${uiTokens.typography.label}`}>건</span>
      </div>
    </article>
  )
}

function FilterLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className={uiTokens.typography.label}>{label}</span>
      {children}
    </label>
  )
}

function FilterInput({
  value,
  placeholder,
  onChange,
  icon,
}: {
  value: string
  placeholder: string
  onChange: (value: string) => void
  icon?: React.ReactNode
}) {
  return (
    <span className="relative block">
      {icon && <span className={`pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 ${uiTokens.color.mutedText}`}>{icon}</span>}
      <input
        className={`h-[30px] w-full ${uiTokens.radius.panel} border ${uiTokens.color.borderStrong} ${uiTokens.color.surface} text-sm leading-5 ${uiTokens.color.headingText} outline-none transition placeholder:text-slate-500 focus:border-blue-700 focus:ring-2 focus:ring-blue-50 ${icon ? 'pl-8 pr-2' : 'px-2'}`}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </span>
  )
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
}) {
  return (
    <select
      className={`h-[30px] w-full ${uiTokens.radius.panel} border ${uiTokens.color.borderStrong} ${uiTokens.color.surface} px-2 text-sm leading-5 ${uiTokens.color.headingText} outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-50`}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

function FilterDateInput({
  value,
  onChange,
  ariaLabel,
  min,
  max,
}: {
  value: string
  onChange: (value: string) => void
  ariaLabel: string
  min?: string
  max?: string
}) {
  return (
    <span className="relative block">
      <input
        aria-label={ariaLabel}
        className={`h-[30px] w-full ${uiTokens.radius.panel} border ${uiTokens.color.borderStrong} ${uiTokens.color.surface} px-2 text-sm leading-5 ${uiTokens.color.headingText} outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-50`}
        max={max}
        min={min}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </span>
  )
}

function DateRangeFilter({
  start,
  end,
  onStartChange,
  onEndChange,
  startLabel,
  endLabel,
}: {
  start: string
  end: string
  onStartChange: (value: string) => void
  onEndChange: (value: string) => void
  startLabel: string
  endLabel: string
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <FilterDateInput ariaLabel={startLabel} max={end || undefined} value={start} onChange={onStartChange} />
      <FilterDateInput ariaLabel={endLabel} min={start || undefined} value={end} onChange={onEndChange} />
    </div>
  )
}

function ReviewerCell({ name, department }: { name: string; department: string }) {
  return (
    <div className="flex min-w-[120px] items-center gap-2">
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center ${uiTokens.radius.pill} ${uiTokens.color.primarySurface} text-xs font-bold ${uiTokens.color.primary}`}>{name.slice(0, 1)}</span>
      <span className="text-sm font-medium leading-5 text-slate-700">
        {name}
        <span className="block text-xs font-normal text-slate-400">{department}</span>
      </span>
    </div>
  )
}

function toDateInputValue(date: string) {
  return date.replaceAll('.', '-')
}

function isWithinDateRange(date: string, start: string, end: string) {
  const comparableDate = toDateInputValue(date)

  if (start && comparableDate < start) {
    return false
  }

  if (end && comparableDate > end) {
    return false
  }

  return true
}

export function ComplianceReviewListPage() {
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [appliedFilters, setAppliedFilters] = useState<Filters>(initialFilters)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortKey, setSortKey] = useState<ReviewSortKey | null>(null)
  const [sortDirection, setSortDirection] = useState<DataTableSortDirection>(null)
  const setFilter = (field: keyof Filters, value: string) => {
    setFilters((current) => ({ ...current, [field]: value }))
  }
  const filteredRows = reviewRows.filter((item) => {
    const query = appliedFilters.query.trim().toLowerCase()
    const reviewer = appliedFilters.reviewer.trim().toLowerCase()
    const searchableText = [item.reviewId, item.title, item.productName].join(' ').toLowerCase()
    const reviewerText = [item.requester, item.department].join(' ').toLowerCase()

    return (
      (!query || searchableText.includes(query)) &&
      (!reviewer || reviewerText.includes(reviewer)) &&
      (appliedFilters.channel === 'ALL' || item.channelCode === appliedFilters.channel) &&
      (appliedFilters.risk === 'ALL' || item.riskLevel === appliedFilters.risk) &&
      isWithinDateRange(item.requestedAt, appliedFilters.requestedStart, appliedFilters.requestedEnd) &&
      isWithinDateRange(item.plannedPublishDate, appliedFilters.publishStart, appliedFilters.publishEnd)
    )
  })
  const sortedRows = !sortKey || !sortDirection ? filteredRows : [...filteredRows].sort((firstItem, secondItem) => {
    const directionMultiplier = sortDirection === 'asc' ? 1 : -1

    if (sortKey === 'riskLevel') {
      return (riskSortRank[firstItem.riskLevel] - riskSortRank[secondItem.riskLevel]) * directionMultiplier
    }

    if (sortKey === 'claimCount') {
      return (firstItem.claimCount - secondItem.claimCount) * directionMultiplier
    }

    return String(firstItem[sortKey]).localeCompare(String(secondItem[sortKey]), 'ko') * directionMultiplier
  })
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const visiblePage = Math.min(currentPage, totalPages)
  const paginatedRows = sortedRows.slice((visiblePage - 1) * pageSize, visiblePage * pageSize)
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
    <div className="w-full">
      <PageHeader
        eyebrow="Compliance Review > Review Queue"
        title="준법 Review 대기열"
        description="AI 분석 완료 후 최종적인 인간 검토 및 승인 결정이 필요한 콘텐츠 대기 목록입니다."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <SummaryCard key={card.label} {...card} />
        ))}
      </section>

      <DataTable
        className={`mt-6 overflow-hidden ${uiTokens.radius.panel} border ${uiTokens.color.border} ${uiTokens.color.surface} ${uiTokens.shadow.panel}`}
        filters={
          <form className="grid gap-x-6 gap-y-5 md:grid-cols-2 xl:grid-cols-4" onSubmit={applyFilters}>
            <FilterLabel label="검색어">
              <FilterInput value={filters.query} placeholder="ID, 콘텐츠명, 상품명 통합 검색" icon={<Search size={18} />} onChange={(value) => setFilter('query', value)} />
            </FilterLabel>
            <FilterLabel label="준법관리자 성명">
              <FilterInput value={filters.reviewer} placeholder="준법관리자 성명 검색" onChange={(value) => setFilter('reviewer', value)} />
            </FilterLabel>
            <FilterLabel label="채널">
              <FilterSelect
                value={filters.channel}
                onChange={(value) => setFilter('channel', value)}
                options={[
                  { value: 'ALL', label: '전체 채널' },
                  { value: 'APP_PUSH', label: '앱푸시' },
                  { value: 'SNS', label: 'SNS' },
                  { value: 'BANNER', label: '배너' },
                  { value: 'SMS', label: 'SMS' },
                ]}
              />
            </FilterLabel>
            <FilterLabel label="위험등급">
              <FilterSelect
                value={filters.risk}
                onChange={(value) => setFilter('risk', value)}
                options={[
                  { value: 'ALL', label: '전체 등급' },
                  { value: 'LOW', label: 'LOW' },
                  { value: 'MEDIUM', label: 'MEDIUM' },
                  { value: 'HIGH', label: 'HIGH' },
                  { value: 'CRITICAL', label: 'CRITICAL' },
                ]}
              />
            </FilterLabel>
            <FilterLabel label="요청일 (시작일 ~ 종료일)">
              <DateRangeFilter
                end={filters.requestedEnd}
                endLabel="요청일 종료일"
                start={filters.requestedStart}
                startLabel="요청일 시작일"
                onEndChange={(value) => setFilter('requestedEnd', value)}
                onStartChange={(value) => setFilter('requestedStart', value)}
              />
            </FilterLabel>
            <FilterLabel label="배포 예정일 (시작일 ~ 종료일)">
              <DateRangeFilter
                end={filters.publishEnd}
                endLabel="배포 예정일 종료일"
                start={filters.publishStart}
                startLabel="배포 예정일 시작일"
                onEndChange={(value) => setFilter('publishEnd', value)}
                onStartChange={(value) => setFilter('publishStart', value)}
              />
            </FilterLabel>
            <div className="flex items-end gap-2 xl:col-span-2 xl:justify-end">
              <Button variant="secondary" className="min-w-[129px]" type="button" onClick={resetFilters}>
                필터 초기화
              </Button>
              <Button className="min-w-[127px]" type="submit">조회</Button>
            </div>
          </form>
        }
        headers={reviewTableHeaders}
        pagination={{
          currentPage: visiblePage,
          itemLabel: '검토 항목',
          onPageChange: setCurrentPage,
          pageSize,
          totalItems: filteredRows.length,
          totalPages,
        }}
        sortDirection={sortDirection}
        sortKey={sortKey}
        tableContainerClassName="p-5 pb-0"
        onSortChange={(nextSortKey, nextSortDirection) => {
          setSortKey(nextSortKey as ReviewSortKey | null)
          setSortDirection(nextSortDirection)
        }}
      >
            {paginatedRows.map((item) => (
              <tr key={item.reviewId} className="transition-colors hover:bg-slate-50">
                <td className="px-3 py-4 font-mono text-xs text-slate-500">{item.reviewId}</td>
                <td className="min-w-[180px] px-3 py-4 font-semibold text-slate-900">{item.title}</td>
                <td className="px-3 py-4">{item.productName}</td>
                <td className="px-3 py-4">{item.channel}</td>
                <td className="px-3 py-4">
                  <RiskBadge level={item.riskLevel} />
                </td>
                <td className="px-3 py-4 text-center">{item.claimCount}</td>
                <td className="px-3 py-4">
                  <ReviewerCell name={item.requester} department={item.department} />
                </td>
                <td className="px-3 py-4">{item.requestedAt}</td>
                <td className="px-3 py-4">{item.plannedPublishDate}</td>
                <td className="px-3 py-4">
                  <Link to={`/compliance-review/${item.reviewId}`}>
                    <Button className="h-9 px-3">심의하기</Button>
                  </Link>
                </td>
              </tr>
            ))}
            {paginatedRows.length === 0 && (
              <tr>
                <td className={`px-3 py-10 text-center ${uiTokens.typography.body} ${uiTokens.color.mutedText}`} colSpan={10}>
                  조건에 맞는 검토 항목이 없습니다.
                </td>
              </tr>
            )}
      </DataTable>
    </div>
  )
}
