import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  BookOpen,
  Building2,
  ChevronRight,
  Download,
  FileText,
  Info,
  Save,
  ShieldCheck,
} from 'lucide-react'
import { Button, DataTable, Drawer, PageHeader } from '../../../components/ui'
import type { DataTableSortDirection } from '../../../components/ui'
import { uiTokens } from '../../../design/tokens'
import type { RiskLevel } from '../../../types'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { fetchComplianceReviewDetail, processComplianceReview } from '../api'
import type { ComplianceReviewClaim, ComplianceReviewDetail, ComplianceReviewEvidenceSource } from '../api'
import { appendReviewComment, buildClaimReviewComment, hasAppliedClaimReviewComment } from '../reviewComment'
import { decisions, getComplianceProcessStatus } from '../reviewDecision'
import type { Decision } from '../reviewDecision'

type ClaimRow = ComplianceReviewClaim

type ClaimSortKey = 'statement' | 'reviewItem' | 'type' | 'verificationResult' | 'riskLevel'

const claimTableHeaders = [
  { label: 'Claim 문구', sortKey: 'statement' },
  { label: 'AI 판단', sortKey: 'reviewItem' },
  { label: '유형', sortKey: 'type' },
  { label: 'AI 검증결과', sortKey: 'verificationResult' },
  { label: '위험등급', sortKey: 'riskLevel' },
  { label: '액션', sortable: false },
]

const claimRiskSortRank: Record<RiskLevel, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
}

const evidenceSourceIcons: Record<ComplianceReviewEvidenceSource['kind'], typeof ShieldCheck> = {
  productTruth: ShieldCheck,
  rule: Building2,
  ruleFile: FileText,
}

function SurfaceCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`${uiTokens.radius.panel} border ${uiTokens.color.border} ${uiTokens.color.surface} ${uiTokens.shadow.panel} ${className}`}>{children}</section>
}

function RiskPill({ level, label }: { level: RiskLevel | null; label: string }) {
  const classes: Record<RiskLevel, string> = {
    LOW: 'bg-emerald-50 text-emerald-700',
    MEDIUM: 'bg-amber-50 text-amber-700',
    HIGH: 'bg-orange-50 text-orange-700',
    CRITICAL: 'bg-rose-50 text-rose-700',
  }

  return <span className={`inline-flex ${uiTokens.radius.chip} px-2 py-0.5 text-xs font-extrabold ${level ? classes[level] : 'bg-slate-100 text-slate-500'}`}>{label}</span>
}

function TypePill({ label }: { label: string }) {
  return <span className={`inline-flex ${uiTokens.radius.chip} ${uiTokens.color.infoSurface} px-2 py-0.5 text-xs font-extrabold ${uiTokens.color.info}`}>{label}</span>
}

const RiskScoreCard = memo(function RiskScoreCard({ score, claims }: { score: number | null; claims: ClaimRow[] }) {
  const normalizedScore = Math.max(0, Math.min(score ?? 0, 100))
  const criticalCount = claims.filter((claim) => claim.riskLevel === 'CRITICAL').length
  const riskSummaries = claims.filter((claim) => claim.riskLevel === 'CRITICAL' || claim.riskLevel === 'HIGH').slice(0, 2)

  return (
    <SurfaceCard className="p-5">
      <div className="flex items-center justify-between">
        <h2 className={uiTokens.typography.sectionTitle}>AI 사전 검토 요약</h2>
        <ShieldCheck size={20} className={uiTokens.color.info} />
      </div>

      <div className="mt-5 rounded-lg border border-rose-100 bg-rose-50 p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className={uiTokens.typography.tableHeader}>Risk Score</p>
            <strong className={`mt-1 block ${uiTokens.typography.metricValue}`}>{score ?? '-'}</strong>
          </div>
          <p className={`flex items-center gap-1 pb-1 text-xs font-bold ${uiTokens.color.danger}`}>
            <AlertTriangle size={13} />
            CRITICAL Claim {criticalCount}건
          </p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
          <div className="h-full rounded-full bg-rose-600" style={{ width: `${normalizedScore}%` }} />
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        {(riskSummaries.length > 0 ? riskSummaries : claims.slice(0, 1)).map((claim, index) => (
          <div key={claim.claimId} className={`flex h-9 items-center gap-2 rounded-md px-3 text-xs font-semibold ${index === 0 ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
            <AlertTriangle size={14} />
            {claim.statement}
          </div>
        ))}
      </div>
    </SurfaceCard>
  )
})

const EvidenceSourceList = memo(function EvidenceSourceList({ sources }: { sources: ComplianceReviewEvidenceSource[] }) {
  return (
    <SurfaceCard className="p-5">
      <div className="flex items-center justify-between">
        <h2 className={uiTokens.typography.tableHeader}>심의 근거 자료 (Evidence)</h2>
        <Info size={16} className={uiTokens.color.subtleText} />
      </div>

      <div className="mt-4 grid gap-3">
        {sources.map(({ kind, title, count, description }) => {
          const Icon = evidenceSourceIcons[kind]

          return (
          <article key={title} className={`${uiTokens.radius.panel} border ${uiTokens.color.border} ${uiTokens.color.surface} p-3 transition hover:border-blue-700`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <Icon size={20} className={`shrink-0 ${uiTokens.color.primary}`} />
                <p className={`min-w-0 truncate text-xs font-extrabold ${uiTokens.color.headingText}`}>{title}</p>
              </div>
              <span className={`shrink-0 ${uiTokens.radius.chip} ${uiTokens.color.primarySurface} px-2 py-1 text-xs font-extrabold ${uiTokens.color.primary}`}>{count}</span>
            </div>
            <p className={`mt-2 ${uiTokens.typography.helper}`}>{description}</p>
          </article>
          )
        })}
      </div>
    </SurfaceCard>
  )
})

const ClaimsTable = memo(function ClaimsTable({ claims, onOpenEvidence }: { claims: ClaimRow[]; onOpenEvidence: (claimId: string) => void }) {
  const claimPageSize = 5
  const [currentClaimPage, setCurrentClaimPage] = useState(1)
  const [sortKey, setSortKey] = useState<ClaimSortKey | null>(null)
  const [sortDirection, setSortDirection] = useState<DataTableSortDirection>(null)
  const sortedClaims = useMemo(() => {
    if (!sortKey || !sortDirection) {
      return claims
    }

    const directionMultiplier = sortDirection === 'asc' ? 1 : -1

    return [...claims].sort((firstClaim, secondClaim) => {
      if (sortKey === 'riskLevel') {
        return ((firstClaim.riskLevel ? claimRiskSortRank[firstClaim.riskLevel] : 0) - (secondClaim.riskLevel ? claimRiskSortRank[secondClaim.riskLevel] : 0)) * directionMultiplier
      }

      return firstClaim[sortKey].localeCompare(secondClaim[sortKey], 'ko') * directionMultiplier
    })
  }, [claims, sortDirection, sortKey])
  const claimTotalPages = Math.max(1, Math.ceil(sortedClaims.length / claimPageSize))
  const visibleClaimPage = Math.min(currentClaimPage, claimTotalPages)
  const paginatedClaims = sortedClaims.slice((visibleClaimPage - 1) * claimPageSize, visibleClaimPage * claimPageSize)

  return (
    <SurfaceCard className="overflow-hidden">
      <DataTable
        header={{
          actions: (
            <Button className="h-[30px] rounded-md px-3 text-xs">
              <Download size={14} />
              Download Report
            </Button>
          ),
          title: (
            <>
              세부 클레임 검증 <span className={`text-sm font-semibold ${uiTokens.color.mutedText}`}>(Claims Verification)</span>
            </>
          ),
        }}
        headers={claimTableHeaders}
        pagination={{
          currentPage: visibleClaimPage,
          itemLabel: 'Claim',
          onPageChange: setCurrentClaimPage,
          pageSize: claimPageSize,
          totalItems: sortedClaims.length,
          totalPages: claimTotalPages,
        }}
        sortDirection={sortDirection}
        sortKey={sortKey}
        onSortChange={(nextSortKey, nextSortDirection) => {
          setSortKey(nextSortKey as ClaimSortKey | null)
          setSortDirection(nextSortDirection)
        }}
      >
        {paginatedClaims.map((claim) => (
          <tr key={claim.claimId} className="transition-colors hover:bg-slate-50">
            <td className="min-w-[210px] px-5 py-4">
              <span className={`text-xs font-bold ${uiTokens.color.headingText}`}>{claim.statement}</span>
            </td>
            <td className="min-w-[150px] px-3 py-4">
              <span className={`flex items-center gap-2 text-xs font-bold ${uiTokens.color.headingText}`}>
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${claim.riskLevel === 'CRITICAL' ? 'bg-rose-600' : claim.riskLevel === 'HIGH' ? 'bg-orange-500' : claim.riskLevel ? 'bg-blue-600' : 'bg-slate-300'}`} />
                {claim.reviewItem}
              </span>
            </td>
            <td className="min-w-[112px] px-3 py-4">
              <TypePill label={claim.type} />
            </td>
            <td className="min-w-[124px] px-3 py-4">
              <TypePill label={claim.verificationResult} />
            </td>
            <td className="min-w-[104px] px-3 py-4">
              <RiskPill level={claim.riskLevel} label={claim.riskLabel} />
            </td>
            <td className="min-w-[124px] px-5 py-4">
              <Button className="h-8 rounded-md px-3 text-xs" onClick={() => onOpenEvidence(claim.claimId)}>
                근거 확인
              </Button>
            </td>
          </tr>
        ))}
        {sortedClaims.length === 0 && (
          <tr>
            <td className={`px-5 py-10 text-center ${uiTokens.typography.body} ${uiTokens.color.mutedText}`} colSpan={6}>
              표시할 클레임이 없습니다.
            </td>
          </tr>
        )}
      </DataTable>
    </SurfaceCard>
  )
})

const OriginalDocument = memo(function OriginalDocument({ originalText }: { originalText: string }) {
  const paragraphs = originalText ? originalText.split('\n\n') : ['원문 정보가 없습니다.']

  return (
    <SurfaceCard className="p-5">
      <h2 className={uiTokens.typography.tableHeader}>원문</h2>
      <div className={`mt-4 ${uiTokens.radius.panel} border ${uiTokens.color.border} ${uiTokens.color.surface} p-5 text-sm leading-8 ${uiTokens.color.bodyText}`}>
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </SurfaceCard>
  )
})

function ReviewDecisionPanel({
  selectedDecision,
  onDecisionChange,
  comment,
  onCommentChange,
  canSubmitFinalDecision,
  isSubmitting,
  submitMessage,
  onSubmitFinalDecision,
}: {
  selectedDecision: Decision
  onDecisionChange: (decision: Decision) => void
  comment: string
  onCommentChange: (comment: string) => void
  canSubmitFinalDecision: boolean
  isSubmitting: boolean
  submitMessage: string
  onSubmitFinalDecision: () => void
}) {
  return (
    <SurfaceCard className="sticky top-6 flex min-h-[640px] flex-col overflow-hidden">
      <div className={`border-b ${uiTokens.color.border} px-5 py-4`}>
        <h2 className={uiTokens.typography.sectionTitle}>준법관리자 최종 판단</h2>
      </div>

      <div className="flex-1 px-5 py-5">
        <p className={uiTokens.typography.tableHeader}>Decision Options</p>
        <div className="mt-3 grid gap-2">
          {decisions.map((decision) => {
            const selected = selectedDecision === decision
            return (
              <button
                key={decision}
                className={`flex h-10 items-center justify-between rounded-md border px-3 text-left text-xs font-extrabold transition ${
                  selected ? `${uiTokens.color.primaryBorder} ${uiTokens.color.primarySurface} ${uiTokens.color.primary}` : `${uiTokens.color.border} ${uiTokens.color.surface} ${uiTokens.color.bodyText} hover:border-blue-700`
                }`}
                type="button"
                onClick={() => onDecisionChange(decision)}
              >
                <span className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full border ${selected ? 'border-blue-700 bg-blue-700 ring-2 ring-blue-100' : uiTokens.color.borderStrong}`} />
                  {decision}
                </span>
                {selected && <ChevronRight size={14} />}
              </button>
            )
          })}
        </div>

        <label className={`mt-6 grid gap-2 ${uiTokens.typography.tableHeader}`}>
          검토 의견 (Review Comments)
          <textarea
            className={`min-h-[126px] resize-none ${uiTokens.radius.panel} border ${uiTokens.color.border} ${uiTokens.color.surface} px-3 py-3 text-sm font-medium normal-case leading-6 tracking-normal ${uiTokens.color.headingText} outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-50`}
            value={comment}
            placeholder="최종 판단 사유와 필요한 조치 사항을 입력하세요."
            onChange={(event) => onCommentChange(event.target.value)}
          />
        </label>
      </div>

      <div className={`border-t ${uiTokens.color.border} ${uiTokens.color.surface} px-5 py-5`}>
        <Button className="w-full" disabled={!canSubmitFinalDecision || isSubmitting} onClick={onSubmitFinalDecision}>
          <Save size={16} />
          {isSubmitting ? '제출 중' : '최종 판단 제출'}
        </Button>
        <p className={`mt-3 ${uiTokens.typography.helper}`}>{submitMessage || 'AI 권고는 참고 자료이며, 최종 심의 판단은 준법관리자가 수행합니다.'}</p>
      </div>
    </SurfaceCard>
  )
}

function DrawerSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <details className={`${uiTokens.radius.panel} border ${uiTokens.color.border} ${uiTokens.color.surface}`} open>
      <summary className={`flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-extrabold ${uiTokens.color.headingText}`}>
        <span className="flex items-center gap-2">
          {icon}
          {title}
        </span>
        <ChevronRight size={14} className={`rotate-90 ${uiTokens.color.mutedText}`} />
      </summary>
      <div className="border-t border-slate-100 px-4 py-4">{children}</div>
    </details>
  )
}

const EvidenceDrawer = memo(function EvidenceDrawer({
  claim,
  open,
  onClose,
  onAppendComment,
  claimCommentApplied,
}: {
  claim: ClaimRow
  open: boolean
  onClose: () => void
  onAppendComment: () => void
  claimCommentApplied: boolean
}) {
  return (
    <Drawer
      title="Claim 근거 상세"
      open={open}
      onClose={onClose}
      footer={
        <div className="grid gap-2">
          <Button className="w-full" disabled={claimCommentApplied} onClick={onAppendComment}>
            {claimCommentApplied ? '이미 반영됨' : '검토 의견에 반영'}
          </Button>
          <Button variant="ghost" className="w-full" onClick={onClose}>
            닫기
          </Button>
        </div>
      }
    >
      <div className="grid gap-4">
        <div className="rounded-lg border border-rose-100 bg-rose-50 p-4">
          <div className="flex items-center gap-2">
            <RiskPill level={claim.riskLevel} label={claim.riskLabel} />
            <span className={`text-xs font-bold ${uiTokens.color.headingText}`}>{claim.statement}</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className={`text-xs font-semibold ${uiTokens.color.mutedText}`}>AI 검증결과</p>
              <p className={`mt-1 text-sm font-bold ${uiTokens.color.danger}`}>{claim.verificationResult}</p>
            </div>
            <div>
              <p className={`text-xs font-semibold ${uiTokens.color.mutedText}`}>카테고리</p>
              <div className="mt-1 flex flex-wrap gap-1">
                <TypePill label={claim.type} />
                {claim.type === 'RATE' && <TypePill label="ELIGIBILITY" />}
              </div>
            </div>
          </div>
        </div>

        <DrawerSection title="참고 상품문서" icon={<ShieldCheck size={16} className={uiTokens.color.primary} />}>
          <dl className="grid gap-3 text-xs">
            {Object.entries(claim.evidence.productTruth).map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className={uiTokens.color.mutedText}>{label}</dt>
                <dd className={`text-right font-bold ${uiTokens.color.headingText}`}>{value}</dd>
              </div>
            ))}
          </dl>
        </DrawerSection>

        <DrawerSection title="규칙&근거 문서" icon={<BookOpen size={16} className={uiTokens.color.primary} />}>
          <div className="grid gap-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={uiTokens.color.mutedText}>규칙 ID</p>
                <p className={`mt-1 font-mono font-bold ${uiTokens.color.headingText}`}>{claim.evidence.rule.ruleId}</p>
              </div>
              <div>
                <p className={uiTokens.color.mutedText}>규칙 이름</p>
                <p className={`mt-1 font-bold ${uiTokens.color.headingText}`}>{claim.evidence.rule.ruleName}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={uiTokens.color.mutedText}>필수 고지 항목</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {claim.evidence.rule.requiredItems.map((item) => (
                    <span key={item} className={`${uiTokens.radius.chip} ${uiTokens.color.infoSurface} px-2 py-1 font-bold ${uiTokens.color.info}`}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className={uiTokens.color.mutedText}>위험 등급</p>
                <p className={`mt-1 font-bold ${uiTokens.color.danger}`}>{claim.evidence.rule.severity}</p>
              </div>
            </div>
            <div>
              <p className={uiTokens.color.mutedText}>인덱스</p>
              <p className={`mt-1 font-mono font-bold ${uiTokens.color.headingText}`}>{claim.evidence.rule.index}</p>
            </div>
            <div>
              <p className={uiTokens.color.mutedText}>근거 규정</p>
              <p className={`mt-1 leading-5 ${uiTokens.color.headingText}`}>{claim.evidence.rule.source}</p>
            </div>
          </div>
        </DrawerSection>

        <DrawerSection title="AI 판단 요약" icon={<Info size={16} className={uiTokens.color.primary} />}>
          <p className={uiTokens.typography.body}>{claim.evidence.aiSummary}</p>
        </DrawerSection>

        <DrawerSection title="수정 권고" icon={<FileText size={16} className={uiTokens.color.primary} />}>
          <div className="grid gap-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={uiTokens.color.mutedText}>기존 표현</p>
                <p className={`mt-1 font-bold ${uiTokens.color.headingText}`}>{claim.evidence.revision.original}</p>
              </div>
              <div>
                <p className={uiTokens.color.mutedText}>권고 표현</p>
                <p className={`mt-1 font-bold ${uiTokens.color.primary}`}>{claim.evidence.revision.suggested}</p>
              </div>
            </div>
            <div>
              <p className={uiTokens.color.mutedText}>추가 고지 권장</p>
              <p className={`mt-1 ${uiTokens.radius.compact} ${uiTokens.color.surfaceMuted} p-3 leading-5 ${uiTokens.color.headingText}`}>"{claim.evidence.revision.additionalNotice}"</p>
            </div>
            <div>
              <p className={uiTokens.color.mutedText}>수정 요청 사유</p>
              <p className={`mt-1 leading-5 ${uiTokens.color.headingText}`}>{claim.evidence.revision.reason}</p>
            </div>
          </div>
        </DrawerSection>

        <div className={`border-t ${uiTokens.color.border} pt-4 ${uiTokens.typography.helper}`}>
          <p>Model Version: RAG-v2024.05 / Agent v2.5</p>
          <p>Data Version: Product v2.3 / Rule v1.5</p>
        </div>
      </div>
    </Drawer>
  )
})

export function ComplianceReviewDetailPage() {
  const { reviewId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const comIdParam = reviewId === 'detail' ? searchParams.get('comId') : reviewId
  const comId = Number(comIdParam)
  const [detail, setDetail] = useState<ComplianceReviewDetail>({
    score: null,
    claims: [],
    evidenceSources: [],
    originalText: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmittingFinalDecision, setIsSubmittingFinalDecision] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [submitMessage, setSubmitMessage] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedClaimId, setSelectedClaimId] = useState('')
  const [selectedDecision, setSelectedDecision] = useState<Decision>('수정 요청')
  const [comment, setComment] = useState('')
  const selectedClaim = useMemo(() => detail.claims.find((claim) => claim.claimId === selectedClaimId) ?? detail.claims[0] ?? null, [detail.claims, selectedClaimId])
  const selectedClaimCommentApplied = selectedClaim ? hasAppliedClaimReviewComment(comment, selectedClaim) : false
  const processStatus = getComplianceProcessStatus(selectedDecision)
  const canSubmitFinalDecision = Boolean(processStatus) && !isLoading && !errorMessage

  useEffect(() => {
    if (!Number.isInteger(comId) || comId <= 0) {
      setErrorMessage('준법심사 ID가 올바르지 않습니다.')
      setIsLoading(false)
      return
    }

    let cancelled = false

    setIsLoading(true)
    fetchComplianceReviewDetail(comId).then((nextDetail) => {
      if (cancelled) {
        return
      }

      setDetail(nextDetail)
      setSelectedClaimId(nextDetail.claims[0]?.claimId ?? '')
      setErrorMessage('')
    }).catch(() => {
      if (!cancelled) {
        setErrorMessage('준법 Review 상세 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')
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

  const openEvidence = useCallback((claimId: string) => {
    setSelectedClaimId(claimId)
    setDrawerOpen(true)
  }, [])
  const closeEvidenceDrawer = useCallback(() => setDrawerOpen(false), [])
  const appendSelectedClaimReviewComment = useCallback(() => {
    if (!selectedClaim) {
      return
    }

    if (hasAppliedClaimReviewComment(comment, selectedClaim)) {
      return
    }

    setComment((value) => {
      if (hasAppliedClaimReviewComment(value, selectedClaim)) {
        return value
      }

      return appendReviewComment(value, buildClaimReviewComment(selectedClaim))
    })
    setDrawerOpen(false)
  }, [comment, selectedClaim])
  const submitFinalDecision = useCallback(async () => {
    const comStatus = getComplianceProcessStatus(selectedDecision)

    if (!comStatus || !Number.isInteger(comId) || comId <= 0) {
      setSubmitMessage('선택한 최종 판단은 제출할 수 없습니다.')
      return
    }

    setIsSubmittingFinalDecision(true)
    setSubmitMessage('')

    try {
      await processComplianceReview(comId, {
        userId: user.userId,
        comReviewComments: comment.trim(),
        comStatus,
      })
      navigate('/evidence-pack')
    } catch {
      setSubmitMessage('최종 판단 제출에 실패했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setIsSubmittingFinalDecision(false)
    }
  }, [comId, comment, navigate, selectedDecision, user.userId])

  return (
    <div className="w-full pb-12">
      <PageHeader
        eyebrow="Compliance Review > Review Detail"
        title="준법 Review"
        description={
          <>
            AI가 추출한{' '}
            <strong className={`font-bold ${uiTokens.color.headingText}`}>AI 사전 검토 Pack(Claim, 근거, 위험도, 수정 권고 등)</strong>
            을 검토하고 준법관리자가 최종 판단을 기록합니다.
          </>
        }
      />
      {(isLoading || errorMessage) && (
        <div className={`mb-6 ${uiTokens.radius.panel} border ${errorMessage ? 'border-red-200 bg-red-50' : uiTokens.color.border} ${uiTokens.spacing.cardCompact}`}>
          <p className={`${uiTokens.typography.body} ${errorMessage ? uiTokens.color.danger : uiTokens.color.bodyText}`}>
            {errorMessage || '준법 Review 상세 정보를 불러오는 중입니다.'}
          </p>
        </div>
      )}
      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,880px)_360px]">
        <aside className="grid content-start gap-4">
          <RiskScoreCard score={detail.score} claims={detail.claims} />
          <EvidenceSourceList sources={detail.evidenceSources} />
        </aside>

        <main className="grid content-start gap-4">
          <ClaimsTable claims={detail.claims} onOpenEvidence={openEvidence} />
          <OriginalDocument originalText={detail.originalText} />
        </main>

        <ReviewDecisionPanel
          selectedDecision={selectedDecision}
          onDecisionChange={setSelectedDecision}
          comment={comment}
          onCommentChange={setComment}
          canSubmitFinalDecision={canSubmitFinalDecision}
          isSubmitting={isSubmittingFinalDecision}
          submitMessage={submitMessage}
          onSubmitFinalDecision={submitFinalDecision}
        />
      </div>

      {selectedClaim && (
        <EvidenceDrawer
          claim={selectedClaim}
          open={drawerOpen}
          onClose={closeEvidenceDrawer}
          onAppendComment={appendSelectedClaimReviewComment}
          claimCommentApplied={selectedClaimCommentApplied}
        />
      )}
    </div>
  )
}
