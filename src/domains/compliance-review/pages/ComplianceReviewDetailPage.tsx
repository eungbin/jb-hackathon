import { memo, useCallback, useMemo, useState } from 'react'
import {
  AlertTriangle,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  Info,
  PanelRightOpen,
  Save,
  ShieldCheck,
} from 'lucide-react'
import { Button, DataTable, Drawer, PageHeader } from '../../../components/ui'
import type { DataTableSortDirection } from '../../../components/ui'
import { uiTokens } from '../../../design/tokens'
import type { RiskLevel } from '../../../types'

type ClaimEvidence = {
  productTruth: Record<string, string>
  rule: {
    ruleId: string
    requiredItems: string[]
    severity: string
    index: string
    source: string
  }
  aiSummary: string
  revision: {
    original: string
    suggested: string
    additionalNotice: string
    reason: string
  }
}

type ClaimRow = {
  claimId: string
  statement: string
  type: string
  verificationResult: string
  riskLevel: RiskLevel
  riskLabel: string
  evidence: ClaimEvidence
}

type Decision = '승인' | '조건부 승인' | '수정 요청' | '반려' | '추가 자료 요청'
type ClaimSortKey = 'statement' | 'type' | 'verificationResult' | 'riskLevel'

const claimTableHeaders = [
  { label: 'Claim 문구', sortKey: 'statement' },
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

const claims: ClaimRow[] = [
  {
    claimId: 'CLM-001',
    statement: "'누구나 받을 수 있다'",
    type: 'ELIGIBILITY',
    verificationResult: '실제 조건과 충돌',
    riskLevel: 'CRITICAL',
    riskLabel: '심각',
    evidence: {
      productTruth: {
        상품명: 'JB 청년우대 적금',
        '상품 버전': 'DEP-SAV-001-v202606',
        기본금리: '연 3.0%',
        최고금리: '최고 연 7.0%',
        '가입 대상': '만 19~34세',
        '납입 한도': '월 30만 원',
        '근거 문서': '상품설명서 2026.06 (p.3)',
      },
      rule: {
        ruleId: 'PE_ELIGIBILITY_002',
        requiredItems: ['가입 대상', '제외 조건', '적용 기간'],
        severity: 'CRITICAL',
        index: 'ADV-RAG-202606',
        source: '금융소비자 보호법 시행령, 내부 광고심의 체크리스트 v1.2',
      },
      aiSummary:
        '현재 문구는 모든 고객이 조건 없이 가입하거나 혜택을 받을 수 있는 것처럼 해석될 수 있습니다. 상품 기준정보에는 만 19~34세 조건이 존재하므로 대상 조건을 함께 표시해야 합니다.',
      revision: {
        original: '누구나 받을 수 있다',
        suggested: '만 19~34세 조건 충족 고객 대상',
        additionalNotice: '가입 대상 및 우대조건은 상품설명서와 약관을 확인해 주세요.',
        reason: '가입 대상 제한을 누락하면 모든 고객에게 동일하게 적용되는 상품으로 오인될 수 있습니다.',
      },
    },
  },
  {
    claimId: 'CLM-002',
    statement: "'최고 연 7%'",
    type: 'RATE',
    verificationResult: '조건 누락',
    riskLevel: 'HIGH',
    riskLabel: '높음',
    evidence: {
      productTruth: {
        상품명: 'JB 청년우대 적금',
        '상품 버전': 'DEP-SAV-001-v202606',
        기본금리: '연 3.0%',
        최고금리: '최고 연 7.0%',
        '가입 대상': '만 19~34세',
        '납입 한도': '월 30만 원',
        '근거 문서': '금리표 2026.06 (p.2)',
      },
      rule: {
        ruleId: 'PE_RATE_001',
        requiredItems: ['기본금리', '우대조건', '가입 대상', '납입 한도', '적용 기간'],
        severity: 'HIGH',
        index: 'ADV-RAG-202606',
        source: '금융광고 자율심의 규정 v1.0, 내부 광고심의 체크리스트 v1.2',
      },
      aiSummary:
        '최고 연 7%라는 수치는 상품 기준정보의 최고금리와 일치합니다. 다만 해당 최고금리는 우대조건 충족 시에만 적용됩니다. 현재 원문에는 기본금리, 우대조건, 가입 대상, 월 납입 한도, 적용 기간이 충분히 표시되어 있지 않아 고객이 모든 가입자가 무조건 최고 연 7.0% 금리를 받을 수 있는 것으로 오인할 가능성이 있습니다.',
      revision: {
        original: '최고 연 7%',
        suggested: '우대조건 충족 시 최고 연 7.0%',
        additionalNotice: '기본금리, 우대조건, 가입 대상, 납입 한도 및 기간은 상품설명서와 약관을 확인해 주세요.',
        reason: '최고금리 표현은 우대조건, 기본금리, 가입 대상, 납입 한도 등 필수 조건을 함께 안내해야 하므로 문구 보완이 필요합니다.',
      },
    },
  },
  {
    claimId: 'CLM-003',
    statement: "'청년적금 혜택'",
    type: 'BENEFIT',
    verificationResult: '고지 필요',
    riskLevel: 'MEDIUM',
    riskLabel: '보통',
    evidence: {
      productTruth: {
        상품명: 'JB 청년우대 적금',
        '상품 버전': 'DEP-SAV-001-v202606',
        혜택명: '청년우대 금리 혜택',
        '적용 조건': '연령 및 납입 조건 충족',
        '근거 문서': '상품설명서 2026.06 (p.4)',
      },
      rule: {
        ruleId: 'PE_BENEFIT_004',
        requiredItems: ['혜택 조건', '제외 대상', '유효 기간'],
        severity: 'MEDIUM',
        index: 'ADV-RAG-202606',
        source: '금융광고 자율심의 규정 v1.0',
      },
      aiSummary:
        '혜택 표현은 상품 기준정보와 방향이 일치하지만 적용 조건이 함께 제시되지 않았습니다. 혜택 대상과 기간을 함께 표시하면 오인 가능성을 낮출 수 있습니다.',
      revision: {
        original: '청년적금 혜택',
        suggested: '조건 충족 시 제공되는 청년우대 적금 혜택',
        additionalNotice: '혜택 조건과 적용 기간은 상품설명서를 확인해 주세요.',
        reason: '혜택 표현에는 대상, 조건, 적용 기간을 함께 고지하는 것이 적절합니다.',
      },
    },
  },
]

const evidenceSources = [
  {
    icon: ShieldCheck,
    title: 'Product Truth',
    count: '3개 Claim 연결',
    description: '상품 상세 약관 및 실제 이율 구조 매핑 데이터',
  },
  {
    icon: Building2,
    title: '금융소비자 보호법 시행령',
    count: '1개 Claim 연결',
    description: '제19조 금융상품 광고 준수 여부',
  },
  {
    icon: FileText,
    title: '금융광고 자율심의 규정',
    count: '2개 Claim 연결',
    description: '협회 필수 고지사항 및 광고 문안 가이드라인',
  },
]

const decisions: Decision[] = ['승인', '조건부 승인', '수정 요청', '반려', '추가 자료 요청']

function SurfaceCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`${uiTokens.radius.panel} border ${uiTokens.color.border} ${uiTokens.color.surface} ${uiTokens.shadow.panel} ${className}`}>{children}</section>
}

function RiskPill({ level, label }: { level: RiskLevel; label: string }) {
  const classes: Record<RiskLevel, string> = {
    LOW: 'bg-emerald-50 text-emerald-700',
    MEDIUM: 'bg-amber-50 text-amber-700',
    HIGH: 'bg-orange-50 text-orange-700',
    CRITICAL: 'bg-rose-50 text-rose-700',
  }

  return <span className={`inline-flex ${uiTokens.radius.chip} px-2 py-0.5 text-xs font-extrabold ${classes[level]}`}>{label}</span>
}

function TypePill({ label }: { label: string }) {
  return <span className={`inline-flex ${uiTokens.radius.chip} ${uiTokens.color.infoSurface} px-2 py-0.5 text-xs font-extrabold ${uiTokens.color.info}`}>{label}</span>
}

const RiskScoreCard = memo(function RiskScoreCard() {
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
            <strong className={`mt-1 block ${uiTokens.typography.metricValue}`}>92</strong>
          </div>
          <p className={`flex items-center gap-1 pb-1 text-xs font-bold ${uiTokens.color.danger}`}>
            <AlertTriangle size={13} />
            CRITICAL Claim 1건
          </p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
          <div className="h-full w-[92%] rounded-full bg-rose-600" />
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        {['광고 금지 문구 사용', '수익률 과장 위험'].map((risk, index) => (
          <div key={risk} className={`flex h-9 items-center gap-2 rounded-md px-3 text-xs font-semibold ${index === 0 ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
            <AlertTriangle size={14} />
            {risk}
          </div>
        ))}
      </div>
    </SurfaceCard>
  )
})

const EvidenceSourceList = memo(function EvidenceSourceList() {
  return (
    <SurfaceCard className="p-5">
      <div className="flex items-center justify-between">
        <h2 className={uiTokens.typography.tableHeader}>심의 근거 자료 (Evidence)</h2>
        <Info size={16} className={uiTokens.color.subtleText} />
      </div>

      <div className="mt-4 grid gap-3">
        {evidenceSources.map(({ icon: Icon, title, count, description }) => (
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
        ))}
      </div>
    </SurfaceCard>
  )
})

const ClaimsTable = memo(function ClaimsTable({ onOpenEvidence }: { onOpenEvidence: (claimId: string) => void }) {
  const [sortKey, setSortKey] = useState<ClaimSortKey | null>(null)
  const [sortDirection, setSortDirection] = useState<DataTableSortDirection>(null)
  const sortedClaims = useMemo(() => {
    if (!sortKey || !sortDirection) {
      return claims
    }

    const directionMultiplier = sortDirection === 'asc' ? 1 : -1

    return [...claims].sort((firstClaim, secondClaim) => {
      if (sortKey === 'riskLevel') {
        return (claimRiskSortRank[firstClaim.riskLevel] - claimRiskSortRank[secondClaim.riskLevel]) * directionMultiplier
      }

      return firstClaim[sortKey].localeCompare(secondClaim[sortKey], 'ko') * directionMultiplier
    })
  }, [sortDirection, sortKey])

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
          currentPage: 1,
          itemLabel: 'Claim',
          onPageChange: () => undefined,
          pageSize: sortedClaims.length || 1,
          totalItems: sortedClaims.length,
          totalPages: 1,
        }}
        sortDirection={sortDirection}
        sortKey={sortKey}
        onSortChange={(nextSortKey, nextSortDirection) => {
          setSortKey(nextSortKey as ClaimSortKey | null)
          setSortDirection(nextSortDirection)
        }}
      >
        {sortedClaims.map((claim) => (
          <tr key={claim.claimId} className="transition-colors hover:bg-slate-50">
            <td className="min-w-[210px] px-5 py-4">
              <span className={`flex items-center gap-2 text-xs font-bold ${uiTokens.color.headingText}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${claim.riskLevel === 'CRITICAL' ? 'bg-rose-600' : claim.riskLevel === 'HIGH' ? 'bg-orange-500' : 'bg-blue-600'}`} />
                {claim.statement}
              </span>
            </td>
            <td className="px-3 py-4">
              <TypePill label={claim.type} />
            </td>
            <td className="px-3 py-4">
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${uiTokens.color.headingText}`}>
                {claim.riskLevel === 'CRITICAL' ? <AlertTriangle size={14} className={uiTokens.color.danger} /> : <CheckCircle2 size={14} className={uiTokens.color.primary} />}
                {claim.verificationResult}
              </span>
            </td>
            <td className="px-3 py-4">
              <RiskPill level={claim.riskLevel} label={claim.riskLabel} />
            </td>
            <td className="px-5 py-4">
              <Button className="h-8 rounded-md px-3 text-xs" onClick={() => onOpenEvidence(claim.claimId)}>
                <PanelRightOpen size={14} />
                근거 확인
              </Button>
            </td>
          </tr>
        ))}
      </DataTable>
    </SurfaceCard>
  )
})

const OriginalDocument = memo(function OriginalDocument() {
  return (
    <SurfaceCard className="p-5">
      <h2 className={uiTokens.typography.tableHeader}>원문</h2>
      <div className={`mt-4 ${uiTokens.radius.panel} border ${uiTokens.color.border} ${uiTokens.color.surface} p-5 text-sm leading-8 ${uiTokens.color.bodyText}`}>
        <p>
          본 금융상품은 <mark className={`border-b-2 border-rose-600 ${uiTokens.color.dangerSurface} px-1 font-bold ${uiTokens.color.danger}`}>누구나 받을 수 있다</mark>는 파격적인 조건을 제시하고 있습니다.
        </p>
        <p>
          특히 <mark className={`border-b-2 border-orange-500 ${uiTokens.color.warningSurface} px-1 font-bold ${uiTokens.color.warning}`}>최고 연 7%</mark>의 수익률을 보장하며, 가입 즉시 다양한{' '}
          <mark className={`border-b-2 border-blue-700 ${uiTokens.color.primarySurface} px-1 font-bold ${uiTokens.color.primary}`}>청년적금 혜택</mark>을 누리실 수 있습니다.
        </p>
        <p className={uiTokens.color.mutedText}>본 광고문은 플랫폼사전심의중입니다.</p>
      </div>
    </SurfaceCard>
  )
})

function ReviewDecisionPanel({
  selectedDecision,
  onDecisionChange,
  comment,
  onCommentChange,
}: {
  selectedDecision: Decision
  onDecisionChange: (decision: Decision) => void
  comment: string
  onCommentChange: (comment: string) => void
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
        <Button className="w-full">
          <Save size={16} />
          최종 판단 저장
        </Button>
        <p className={`mt-3 ${uiTokens.typography.helper}`}>AI 권고는 참고 자료이며, 최종 심의 판단은 준법관리자가 수행합니다.</p>
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
  onApplyRevisionReason,
}: {
  claim: ClaimRow
  open: boolean
  onClose: () => void
  onAppendComment: () => void
  onApplyRevisionReason: () => void
}) {
  return (
    <Drawer
      title="Claim 근거 상세"
      open={open}
      onClose={onClose}
      footer={
        <div className="grid gap-2">
          <Button variant="secondary" className="w-full" onClick={onAppendComment}>
            검토 의견에 추가
          </Button>
          <Button className="w-full" onClick={onApplyRevisionReason}>
            수정 요청 사유로 반영
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

        <DrawerSection title="상품 기준정보" icon={<ShieldCheck size={16} className={uiTokens.color.primary} />}>
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
            <div>
              <p className={uiTokens.color.mutedText}>규칙 ID</p>
              <p className={`mt-1 font-mono font-bold ${uiTokens.color.headingText}`}>{claim.evidence.rule.ruleId}</p>
            </div>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={uiTokens.color.mutedText}>중요도</p>
                <p className={`mt-1 font-bold ${uiTokens.color.danger}`}>{claim.evidence.rule.severity}</p>
              </div>
              <div>
                <p className={uiTokens.color.mutedText}>인덱스</p>
                <p className={`mt-1 font-mono font-bold ${uiTokens.color.headingText}`}>{claim.evidence.rule.index}</p>
              </div>
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
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedClaimId, setSelectedClaimId] = useState(claims[1].claimId)
  const [selectedDecision, setSelectedDecision] = useState<Decision>('수정 요청')
  const [comment, setComment] = useState('')
  const selectedClaim = useMemo(() => claims.find((claim) => claim.claimId === selectedClaimId) ?? claims[0], [selectedClaimId])

  const openEvidence = useCallback((claimId: string) => {
    setSelectedClaimId(claimId)
    setDrawerOpen(true)
  }, [])
  const closeEvidenceDrawer = useCallback(() => setDrawerOpen(false), [])
  const appendSelectedClaimSummary = useCallback(() => {
    setComment((value) => `${value}\n${selectedClaim.evidence.aiSummary}`.trim())
  }, [selectedClaim.evidence.aiSummary])
  const applySelectedClaimRevisionReason = useCallback(() => {
    setComment((value) => `${value}\n수정 요청 사유: ${selectedClaim.evidence.revision.reason}`.trim())
  }, [selectedClaim.evidence.revision.reason])

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
      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,880px)_360px]">
        <aside className="grid content-start gap-4">
          <RiskScoreCard />
          <EvidenceSourceList />
        </aside>

        <main className="grid content-start gap-4">
          <ClaimsTable onOpenEvidence={openEvidence} />
          <OriginalDocument />
        </main>

        <ReviewDecisionPanel selectedDecision={selectedDecision} onDecisionChange={setSelectedDecision} comment={comment} onCommentChange={setComment} />
      </div>

      <EvidenceDrawer
        claim={selectedClaim}
        open={drawerOpen}
        onClose={closeEvidenceDrawer}
        onAppendComment={appendSelectedClaimSummary}
        onApplyRevisionReason={applySelectedClaimRevisionReason}
      />
    </div>
  )
}
