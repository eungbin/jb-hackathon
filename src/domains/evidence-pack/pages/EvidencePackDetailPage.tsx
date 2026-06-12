import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Bot, CheckCircle2, Clock3, Download, FileCheck2, FileJson, FileText, ShieldCheck, User } from 'lucide-react'
import { Badge, Button, DataTable, PageHeader, RiskBadge } from '../../../components/ui'
import type { DataTableSortDirection } from '../../../components/ui'
import { uiTokens } from '../../../design/tokens'
import type { RiskLevel } from '../../../types'
import { fetchEvidencePackResultDetail } from '../api'
import type { EvidencePackClaimResult, EvidencePackComplianceStatus, EvidencePackResultDetail } from '../api'

type ClaimResultSortKey = 'claim' | 'basis' | 'riskLevel' | 'source' | 'locator'

const emptyDetail: EvidencePackResultDetail = {
  registeredAt: '-',
  registrantName: '-',
  aiReviewedAt: '-',
  approvedAt: '-',
  approverName: '-',
  product: {
    productId: 0,
    productName: '-',
    productCode: '-',
    productCategory: '-',
  },
  claimResults: [],
  finalComment: '-',
  comStatus: null,
}

const claimResultHeaders = [
  { label: 'Claim', sortKey: 'claim' },
  { label: 'Basis', sortKey: 'basis' },
  { label: 'Risk', sortKey: 'riskLevel' },
  { label: 'Source', sortKey: 'source' },
  { label: 'Locator', sortKey: 'locator' },
]

const riskSortRank: Record<RiskLevel, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
}

const statusLabels: Record<EvidencePackComplianceStatus, string> = {
  CONDITIONALLY_APPROVED: '조건부 승인',
  REJECTED: '거절',
  APPROVED: '승인',
}

const statusTones: Record<EvidencePackComplianceStatus, 'blue' | 'green' | 'red'> = {
  CONDITIONALLY_APPROVED: 'blue',
  REJECTED: 'red',
  APPROVED: 'green',
}

const timelineMarkerStyles = [
  { icon: CheckCircle2, markerClass: `${uiTokens.color.successSurface} ${uiTokens.color.success}` },
  { icon: Bot, markerClass: `${uiTokens.color.primarySurface} ${uiTokens.color.primary}` },
  { icon: FileCheck2, markerClass: 'bg-blue-100 text-blue-700' },
]

function StatusBadge({ status }: { status: EvidencePackComplianceStatus | null }) {
  return status ? <Badge tone={statusTones[status]}>{statusLabels[status]}</Badge> : <Badge tone="gray">미정</Badge>
}

function NullableRiskBadge({ level }: { level: RiskLevel | null }) {
  return level ? <RiskBadge level={level} /> : <Badge tone="gray">미정</Badge>
}

function AuditTimeline({ detail }: { detail: EvidencePackResultDetail }) {
  const timeline = [
    { event: '콘텐츠 등록', timestamp: detail.registeredAt, actor: detail.registrantName },
    { event: 'AI 심사 완료', timestamp: detail.aiReviewedAt, actor: 'ClaimProof AI' },
    { event: '준법 심사 처리', timestamp: detail.approvedAt, actor: detail.approverName },
  ]

  return (
    <section className={`${uiTokens.radius.panel} border ${uiTokens.color.primaryBorder} ${uiTokens.color.surface} ${uiTokens.spacing.card} ${uiTokens.shadow.panel}`}>
      <div className={`flex items-center gap-1 text-sm font-medium uppercase leading-6 ${uiTokens.color.bodyText}`}>
        <Clock3 size={16} />
        <h2>Audit Timeline (Immutable Log)</h2>
      </div>

      <div className={`ml-2 mt-5 border-l-2 ${uiTokens.color.borderStrong}`}>
        <div className="grid gap-6 py-1">
          {timeline.map((item, index) => {
            const marker = timelineMarkerStyles[index] ?? timelineMarkerStyles[0]
            const Icon = marker.icon

            return (
              <article key={item.event} className="relative pl-8">
                <span className={`absolute -left-2.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full border-4 border-white ${marker.markerClass}`}>
                  <Icon size={10} />
                </span>
                <p className={`text-base font-bold leading-6 ${uiTokens.color.headingText}`}>{item.event}</p>
                <p className={`mt-0.5 text-sm leading-6 ${uiTokens.color.bodyText}`}>
                  {item.timestamp} · {item.actor}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function ProductMetadataPanel({ detail }: { detail: EvidencePackResultDetail }) {
  return (
    <aside className={`${uiTokens.radius.panel} border ${uiTokens.color.border} bg-white/80 ${uiTokens.spacing.card} ${uiTokens.shadow.panel}`}>
      <h2 className={`pb-4 text-base font-medium leading-6 ${uiTokens.color.headingText}`}>Product Metadata</h2>

      <dl>
        {[
          ['Product Name', detail.product.productName],
          ['Product Code', detail.product.productCode],
          ['Category', detail.product.productCategory],
          ['Product ID', String(detail.product.productId)],
        ].map(([label, value]) => (
          <div key={label} className={`flex items-start justify-between gap-4 border-b ${uiTokens.color.borderStrong} py-2`}>
            <dt className={`text-base leading-6 ${uiTokens.color.bodyText}`}>{label}</dt>
            <dd className={`text-right text-base font-bold leading-6 ${uiTokens.color.primary}`}>{value}</dd>
          </div>
        ))}
      </dl>

      <div className={`mt-6 ${uiTokens.radius.panel} border ${uiTokens.color.primaryBorder} ${uiTokens.color.primarySurface} ${uiTokens.spacing.cardCompact}`}>
        <div className="flex items-center gap-2">
          <ShieldCheck size={22} className={uiTokens.color.primary} />
          <p className={`text-base font-bold leading-6 ${uiTokens.color.primary}`}>심사 처리 상태</p>
        </div>
        <div className="mt-3">
          <StatusBadge status={detail.comStatus} />
        </div>
      </div>
    </aside>
  )
}

function FinalNotesSection({ detail }: { detail: EvidencePackResultDetail }) {
  return (
    <section className={`${uiTokens.spacing.section} ${uiTokens.radius.panel} border ${uiTokens.color.border} ${uiTokens.color.surface} ${uiTokens.spacing.card} ${uiTokens.shadow.panel}`}>
      <div className={`flex items-center gap-2 text-base font-medium leading-6 ${uiTokens.color.headingText}`}>
        <FileText size={18} />
        <h2>Compliance Review Final Comments</h2>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <article className={`relative min-h-[214px] overflow-hidden ${uiTokens.radius.panel} ${uiTokens.color.surfaceSubtle} p-4`}>
          <FileText className={`absolute right-3 top-2 h-16 w-16 opacity-20 ${uiTokens.color.subtleText}`} />
          <p className={`relative text-base leading-6 ${uiTokens.color.bodyText}`}>최종 심사 결과</p>
          <p className={`relative mt-2 text-base italic leading-7 ${uiTokens.color.headingText}`}>"{detail.finalComment}"</p>
          <div className={`relative mt-4 flex flex-col gap-2 border-t border-slate-300/60 pt-3 sm:flex-row sm:items-center sm:justify-between`}>
            <div className="flex items-center gap-2">
              <span className={`flex h-6 w-6 items-center justify-center ${uiTokens.radius.chip} bg-blue-100 ${uiTokens.color.primary}`}>
                <User size={14} />
              </span>
              <span className={`text-xs font-bold leading-5 ${uiTokens.color.headingText}`}>{detail.approverName}</span>
            </div>
            <span className={`font-mono text-xs leading-5 ${uiTokens.color.bodyText}`}>{detail.approvedAt}</span>
          </div>
        </article>

        <article className={`flex min-h-[214px] flex-col items-center justify-center ${uiTokens.radius.panel} border-2 border-dashed ${uiTokens.color.primaryBorder} bg-blue-50/30 px-5 py-11 text-center`}>
          <span className={`flex h-16 w-16 items-center justify-center ${uiTokens.radius.chip} ${uiTokens.color.surface} ${uiTokens.shadow.panel}`}>
            <ShieldCheck size={40} className={uiTokens.color.info} />
          </span>
          <p className={`mt-4 text-lg font-bold leading-7 ${uiTokens.color.headingText}`}>{detail.comStatus ? statusLabels[detail.comStatus] : '심사 상태 미정'}</p>
          <p className={`mt-1 text-sm leading-5 ${uiTokens.color.bodyText}`}>Sealed Review Record</p>
        </article>
      </div>
    </section>
  )
}

export function EvidencePackDetailPage() {
  const { packId } = useParams()
  const comId = Number(packId)
  const [detail, setDetail] = useState<EvidencePackResultDetail>(emptyDetail)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [sortKey, setSortKey] = useState<ClaimResultSortKey | null>(null)
  const [sortDirection, setSortDirection] = useState<DataTableSortDirection>(null)
  const sortedClaimResults = !sortKey || !sortDirection ? detail.claimResults : [...detail.claimResults].sort((firstResult, secondResult) => {
    const directionMultiplier = sortDirection === 'asc' ? 1 : -1

    if (sortKey === 'riskLevel') {
      const firstRank = firstResult.riskLevel ? riskSortRank[firstResult.riskLevel] : 0
      const secondRank = secondResult.riskLevel ? riskSortRank[secondResult.riskLevel] : 0

      return (firstRank - secondRank) * directionMultiplier
    }

    return String(firstResult[sortKey]).localeCompare(String(secondResult[sortKey]), 'ko') * directionMultiplier
  })

  useEffect(() => {
    if (!Number.isInteger(comId) || comId <= 0) {
      setErrorMessage('준법심사 ID가 올바르지 않습니다.')
      setIsLoading(false)
      return
    }

    let cancelled = false

    setIsLoading(true)
    fetchEvidencePackResultDetail(comId).then((nextDetail) => {
      if (cancelled) {
        return
      }

      setDetail(nextDetail)
      setErrorMessage('')
    }).catch(() => {
      if (!cancelled) {
        setErrorMessage('Evidence Pack 상세 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')
      }
    }).finally(() => {
      if (!cancelled) {
        setIsLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [comId])

  return (
    <div className="w-full">
      <PageHeader
        eyebrow={`Compliance Archive > COM-${Number.isInteger(comId) && comId > 0 ? comId : '-'}`}
        title="최종 Evidence Pack - Sealed Review Record"
        description="확정 이후 수정할 수 없는 준법 심의 증적입니다."
        actions={
          <>
            <Button variant="secondary">
              <FileJson size={16} />
              JSON 내보내기
            </Button>
            <Button variant="secondary">
              <Download size={16} />
              PDF 리포트 다운로드
            </Button>
          </>
        }
      />
      {(isLoading || errorMessage) && (
        <div className={`mb-6 ${uiTokens.radius.panel} border ${errorMessage ? 'border-red-200 bg-red-50' : uiTokens.color.border} ${uiTokens.spacing.cardCompact}`}>
          <p className={`${uiTokens.typography.body} ${errorMessage ? uiTokens.color.danger : uiTokens.color.bodyText}`}>
            {errorMessage || 'Evidence Pack 상세 정보를 불러오는 중입니다.'}
          </p>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Badge tone="green">IMMUTABLE</Badge>
        <Badge tone="blue">SOURCE OF TRUTH</Badge>
        <Badge tone="purple">Sealed Record</Badge>
      </div>
      <div className={`${uiTokens.spacing.section} ${uiTokens.spacing.stack} xl:grid-cols-[2fr_1fr]`}>
        <AuditTimeline detail={detail} />
        <ProductMetadataPanel detail={detail} />
      </div>
      <DataTable
        className={`${uiTokens.spacing.section} overflow-hidden ${uiTokens.radius.panel} border ${uiTokens.color.border} ${uiTokens.color.surface} ${uiTokens.shadow.panel}`}
        headers={claimResultHeaders}
        pagination={{
          currentPage: 1,
          itemLabel: 'Claim',
          onPageChange: () => undefined,
          pageSize: sortedClaimResults.length || 1,
          totalItems: sortedClaimResults.length,
          totalPages: 1,
        }}
        sortDirection={sortDirection}
        sortKey={sortKey}
        onSortChange={(nextSortKey, nextSortDirection) => {
          setSortKey(nextSortKey as ClaimResultSortKey | null)
          setSortDirection(nextSortDirection)
        }}
      >
        {sortedClaimResults.map((result: EvidencePackClaimResult) => (
          <tr key={result.claim}>
            <td className={`${uiTokens.spacing.tableCellRelaxed} font-semibold ${uiTokens.color.headingText}`}>
              <div>{result.claim}</div>
              <p className={`mt-1 ${uiTokens.typography.helper}`}>기존: {result.original}</p>
              <p className={`mt-1 ${uiTokens.typography.helper}`}>권고: {result.suggested}</p>
            </td>
            <td className={uiTokens.spacing.tableCellRelaxed}>
              <p>{result.basis}</p>
              <p className={`mt-2 ${uiTokens.typography.helper}`}>사유: {result.reason}</p>
              <p className={`mt-1 ${uiTokens.typography.helper}`}>고지: {result.disclaimer}</p>
              <p className={`mt-1 ${uiTokens.typography.helper}`}>키워드: {result.keywords}</p>
            </td>
            <td className={uiTokens.spacing.tableCellRelaxed}>
              <NullableRiskBadge level={result.riskLevel} />
            </td>
            <td className={uiTokens.spacing.tableCellRelaxed}>{result.source}</td>
            <td className={uiTokens.spacing.tableCellRelaxed}>{result.locator}</td>
          </tr>
        ))}
        {sortedClaimResults.length === 0 && (
          <tr>
            <td className={`px-5 py-10 text-center ${uiTokens.typography.body} ${uiTokens.color.mutedText}`} colSpan={5}>
              표시할 Claim이 없습니다.
            </td>
          </tr>
        )}
      </DataTable>
      <FinalNotesSection detail={detail} />
    </div>
  )
}
