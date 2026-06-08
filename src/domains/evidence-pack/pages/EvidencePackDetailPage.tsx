import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Bot, CheckCircle2, Clock3, Download, FileCheck2, FileJson, FileText, ShieldCheck, User } from 'lucide-react'
import { finalEvidencePackData } from '../../../data/mockData'
import { Badge, Button, DataTable, PageHeader, RiskBadge } from '../../../components/ui'
import type { DataTableSortDirection } from '../../../components/ui'
import { uiTokens } from '../../../design/tokens'
import type { RiskLevel } from '../../../types'

type ClaimResultSortKey = 'claim' | 'basis' | 'riskLevel' | 'source' | 'locator'

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

const timelineMarkerStyles = [
  { icon: CheckCircle2, markerClass: `${uiTokens.color.successSurface} ${uiTokens.color.success}` },
  { icon: Bot, markerClass: `${uiTokens.color.primarySurface} ${uiTokens.color.primary}` },
  { icon: FileCheck2, markerClass: 'bg-blue-100 text-blue-700' },
]

function AuditTimeline() {
  return (
    <section className={`${uiTokens.radius.panel} border ${uiTokens.color.primaryBorder} ${uiTokens.color.surface} ${uiTokens.spacing.card} ${uiTokens.shadow.panel}`}>
      <div className={`flex items-center gap-1 text-sm font-medium uppercase leading-6 ${uiTokens.color.bodyText}`}>
        <Clock3 size={16} />
        <h2>Audit Timeline (Immutable Log)</h2>
      </div>

      <div className={`ml-2 mt-5 border-l-2 ${uiTokens.color.borderStrong}`}>
        <div className="grid gap-6 py-1">
          {finalEvidencePackData.timeline.map((item, index) => {
            const marker = timelineMarkerStyles[index] ?? timelineMarkerStyles[0]
            const Icon = marker.icon
            const systemLabel = item.system === 'ClaimProof AI' ? '' : item.system === 'JB-24-YTH' ? ` · ID: ${item.system}` : ` · ${item.system}`

            return (
              <article key={item.timestamp} className="relative pl-8">
                <span className={`absolute -left-2.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full border-4 border-white ${marker.markerClass}`}>
                  <Icon size={10} />
                </span>
                <p className={`text-base font-bold leading-6 ${uiTokens.color.headingText}`}>{item.event}</p>
                <p className={`mt-0.5 text-sm leading-6 ${uiTokens.color.bodyText}`}>
                  {item.timestamp} · {item.actor}
                  {systemLabel && <span className="font-mono text-xs">{systemLabel}</span>}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function ProductMetadataPanel() {
  return (
    <aside className={`${uiTokens.radius.panel} border ${uiTokens.color.border} bg-white/80 ${uiTokens.spacing.card} ${uiTokens.shadow.panel}`}>
      <h2 className={`pb-4 text-base font-medium leading-6 ${uiTokens.color.headingText}`}>Product Metadata</h2>

      <dl>
        <div className={`flex items-start justify-between gap-4 border-b ${uiTokens.color.borderStrong} py-2`}>
          <dt className={`text-base leading-6 ${uiTokens.color.bodyText}`}>Product Name</dt>
          <dd className={`text-right text-base font-bold leading-6 ${uiTokens.color.primary}`}>{finalEvidencePackData.productMetadata.productName}</dd>
        </div>
      </dl>

      <div className={`mt-6 ${uiTokens.radius.panel} border ${uiTokens.color.primaryBorder} ${uiTokens.color.primarySurface} ${uiTokens.spacing.cardCompact}`}>
        <div className="flex items-center gap-2">
          <ShieldCheck size={22} className={uiTokens.color.primary} />
          <p className={`text-base font-bold leading-6 ${uiTokens.color.primary}`}>증적 데이터 보안 등급: {finalEvidencePackData.productMetadata.securityGrade}</p>
        </div>
        <p className={`mt-2 text-xs leading-5 ${uiTokens.color.bodyText}`}>{finalEvidencePackData.productMetadata.securityNotice}</p>
      </div>
    </aside>
  )
}

function FinalNotesSection() {
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
          <p className={`relative mt-2 text-base italic leading-7 ${uiTokens.color.headingText}`}>"{finalEvidencePackData.finalComment}"</p>
          <div className={`relative mt-4 flex flex-col gap-2 border-t border-slate-300/60 pt-3 sm:flex-row sm:items-center sm:justify-between`}>
            <div className="flex items-center gap-2">
              <span className={`flex h-6 w-6 items-center justify-center ${uiTokens.radius.chip} bg-blue-100 ${uiTokens.color.primary}`}>
                <User size={14} />
              </span>
              <span className={`text-xs font-bold leading-5 ${uiTokens.color.headingText}`}>{finalEvidencePackData.reviewer}</span>
            </div>
            <span className={`font-mono text-xs leading-5 ${uiTokens.color.bodyText}`}>{finalEvidencePackData.signedAt}</span>
          </div>
        </article>

        <article className={`flex min-h-[214px] flex-col items-center justify-center ${uiTokens.radius.panel} border-2 border-dashed ${uiTokens.color.primaryBorder} bg-blue-50/30 px-5 py-11 text-center`}>
          <span className={`flex h-16 w-16 items-center justify-center ${uiTokens.radius.chip} ${uiTokens.color.surface} ${uiTokens.shadow.panel}`}>
            <ShieldCheck size={40} className={uiTokens.color.info} />
          </span>
          <p className={`mt-4 text-lg font-bold leading-7 ${uiTokens.color.headingText}`}>조건부 승인 완료</p>
          <p className={`mt-1 text-sm leading-5 ${uiTokens.color.bodyText}`}>Digital Signature Certificate verified</p>
        </article>
      </div>
    </section>
  )
}

export function EvidencePackDetailPage() {
  const { packId } = useParams()
  const [sortKey, setSortKey] = useState<ClaimResultSortKey | null>(null)
  const [sortDirection, setSortDirection] = useState<DataTableSortDirection>(null)
  const sortedClaimResults = !sortKey || !sortDirection ? finalEvidencePackData.claimResults : [...finalEvidencePackData.claimResults].sort((firstResult, secondResult) => {
    const directionMultiplier = sortDirection === 'asc' ? 1 : -1

    if (sortKey === 'riskLevel') {
      return (riskSortRank[firstResult.riskLevel] - riskSortRank[secondResult.riskLevel]) * directionMultiplier
    }

    return String(firstResult[sortKey]).localeCompare(String(secondResult[sortKey]), 'ko') * directionMultiplier
  })

  return (
    <div className="w-full">
      <PageHeader
        eyebrow={`Compliance Archive > ${packId ?? finalEvidencePackData.packId}`}
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
      <div className="flex flex-wrap gap-2">
        <Badge tone="green">IMMUTABLE</Badge>
        <Badge tone="blue">SOURCE OF TRUTH</Badge>
        <Badge tone="purple">Sealed Record</Badge>
      </div>
      <div className={`${uiTokens.spacing.section} ${uiTokens.spacing.stack} xl:grid-cols-[2fr_1fr]`}>
        <AuditTimeline />
        <ProductMetadataPanel />
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
          {sortedClaimResults.map((result) => (
            <tr key={result.claim}>
              <td className={`${uiTokens.spacing.tableCellRelaxed} font-semibold ${uiTokens.color.headingText}`}>{result.claim}</td>
              <td className={uiTokens.spacing.tableCellRelaxed}>{result.basis}</td>
              <td className={uiTokens.spacing.tableCellRelaxed}>
                <RiskBadge level={result.riskLevel} />
              </td>
              <td className={uiTokens.spacing.tableCellRelaxed}>{result.source}</td>
              <td className={uiTokens.spacing.tableCellRelaxed}>{result.locator}</td>
            </tr>
          ))}
      </DataTable>
      <FinalNotesSection />
    </div>
  )
}
