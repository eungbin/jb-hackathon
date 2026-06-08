import type { LucideIcon } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, ChevronRight, ClipboardCheck, FilePenLine, Layers, Plus, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, DataTable, PageHeader, RiskBadge } from '../../../components/ui'
import { uiTokens } from '../../../design/tokens'
import type { RiskLevel } from '../../../types'
import { fetchDashboardMain } from '../api'
import type { DashboardViewData } from '../api'

const panelClass =
  `${uiTokens.radius.panel} border ${uiTokens.color.border} ${uiTokens.color.surface} ${uiTokens.shadow.panel}`

const riskVisualClasses: Record<RiskLevel, { dot: string; bar: string; text: string; chart: string }> = {
  CRITICAL: { dot: 'bg-rose-600', bar: 'bg-rose-600', text: uiTokens.color.danger, chart: 'rgb(220 38 38)' },
  HIGH: { dot: 'bg-orange-500', bar: 'bg-orange-500', text: 'text-orange-700', chart: 'rgb(234 88 12)' },
  MEDIUM: { dot: 'bg-amber-500', bar: 'bg-amber-500', text: uiTokens.color.warning, chart: 'rgb(217 119 6)' },
  LOW: { dot: 'bg-emerald-600', bar: 'bg-emerald-600', text: uiTokens.color.success, chart: 'rgb(22 163 74)' },
}

const urgencyClasses: Record<string, string> = {
  긴급: `${uiTokens.color.dangerBorder} ${uiTokens.color.dangerSurface} ${uiTokens.color.danger}`,
  높음: 'border-orange-100 bg-orange-50 text-orange-700',
  보통: `${uiTokens.color.primaryBorder} ${uiTokens.color.primarySurface} ${uiTokens.color.primary}`,
  낮음: `${uiTokens.color.successBorder} ${uiTokens.color.successSurface} ${uiTokens.color.success}`,
}

type DashboardMetric = {
  id: string
  label: string
  value: string | number
  helperText: string
  tone: 'success' | 'warning' | 'primary' | 'danger' | 'info'
  icon: LucideIcon
}

type LearningItem = {
  label: string
  value: number
  icon: LucideIcon
  tone: string
}

function buildMetrics(data: DashboardViewData): DashboardMetric[] {
  return [
    { id: 'review_pending', label: '대기 중', value: data.comStatusCounts.pending, helperText: '준법심사 접수 후 검토 대기', tone: 'warning', icon: FilePenLine },
    { id: 'ai_failed', label: 'AI 분석 실패', value: data.comStatusCounts.aiFailed, helperText: '재분석 또는 수동 확인 필요', tone: 'danger', icon: AlertTriangle },
    { id: 'conditional', label: '조건부 승인', value: data.comStatusCounts.conditionallyApproved, helperText: '수정 조건 확인 필요', tone: 'primary', icon: ClipboardCheck },
    { id: 'rejected', label: '거절', value: data.comStatusCounts.rejected, helperText: '준법 검토 결과 반려', tone: 'danger', icon: AlertTriangle },
    { id: 'approved', label: '승인', value: data.comStatusCounts.approved, helperText: '최종 승인 완료', tone: 'success', icon: ShieldCheck },
  ]
}

function buildLearningItems(data: DashboardViewData): LearningItem[] {
  return [
    { label: '승인 대기', value: data.learning.approvalPending, icon: ClipboardCheck, tone: uiTokens.color.warning },
    { label: '승인', value: data.learning.approved, icon: CheckCircle2, tone: uiTokens.color.success },
    { label: '거절', value: data.learning.rejected, icon: AlertTriangle, tone: uiTokens.color.danger },
  ]
}

const metricToneClasses: Record<DashboardMetric['tone'], { accent: string; text: string; icon: string }> = {
  success: { accent: 'border-l-emerald-600', text: uiTokens.color.success, icon: uiTokens.color.success },
  warning: { accent: 'border-l-amber-500', text: uiTokens.color.warning, icon: uiTokens.color.warning },
  primary: { accent: 'border-l-blue-700', text: uiTokens.color.primary, icon: uiTokens.color.primary },
  danger: { accent: 'border-l-orange-500', text: 'text-orange-700', icon: 'text-orange-700' },
  info: { accent: 'border-l-violet-600', text: uiTokens.color.info, icon: uiTokens.color.info },
}

function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`${panelClass} ${className}`}>{children}</section>
}

function DashboardMetricCard({ metric }: { metric: DashboardMetric }) {
  const Icon = metric.icon
  const tone = metricToneClasses[metric.tone]

  return (
    <article className={`relative min-h-[124px] overflow-hidden ${uiTokens.radius.panel} border ${uiTokens.color.border} border-l-4 ${uiTokens.color.surface} ${uiTokens.spacing.cardCompact} ${uiTokens.shadow.panel} ${tone.accent}`}>
      <p className={`relative z-10 min-h-10 ${uiTokens.typography.label}`}>{metric.label}</p>
      <p className={`relative z-10 mt-2 ${uiTokens.typography.metricValue}`}>{metric.value}</p>
      <p className={`relative z-10 mt-1 text-sm font-semibold leading-5 ${tone.text}`}>
        {metric.helperText}
      </p>
      <Icon className={`absolute right-4 top-4 opacity-15 ${tone.icon}`} size={28} />
    </article>
  )
}

function UrgencyBadge({ urgency }: { urgency: string }) {
  const className = urgencyClasses[urgency] ?? `${uiTokens.color.border} ${uiTokens.color.surfaceMuted} ${uiTokens.color.mutedText}`

  return <span className={`inline-flex h-[22px] items-center ${uiTokens.radius.chip} border px-2 text-xs font-bold leading-none ${className}`}>{urgency}</span>
}

function UrgentReviewQueue({ priorityRows }: { priorityRows: DashboardViewData['priorityRows'] }) {
  const visiblePriorityRows = priorityRows.slice(0, 5)

  return (
    <Panel className="overflow-hidden">
      <DataTable
        header={{
          title: (
            <span className="flex items-center gap-2">
              <AlertTriangle size={20} className={uiTokens.color.danger} />
              우선 검토 대상
            </span>
          ),
        }}
        headers={['제목', '상품군', '위험등급', '긴급도', '제출일', '배포 예정일', '액션']}
      >
        {visiblePriorityRows.map((row) => (
          <tr key={row.comId} className="transition-colors hover:bg-slate-50">
            <td className="px-3 py-4 font-semibold text-slate-900">{row.title}</td>
            <td className="px-3 py-4">{row.productCategory}</td>
            <td className="px-3 py-4">
              {row.riskLevel ? <RiskBadge level={row.riskLevel} /> : <span className={uiTokens.typography.helper}>-</span>}
            </td>
            <td className="px-3 py-4">
              <UrgencyBadge urgency={row.urgency} />
            </td>
            <td className="px-3 py-4">{row.submittedAt}</td>
            <td className="px-3 py-4">{row.plannedPublishDate}</td>
            <td className="px-3 py-4">
              <Link className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:text-blue-700" to={`/compliance-review/detail?comId=${row.comId}`} aria-label={`${row.title} 상세 보기`}>
                <ChevronRight size={24} />
              </Link>
            </td>
          </tr>
        ))}
      </DataTable>
    </Panel>
  )
}

function TopClaimTypesPanel({ topClaimTypes }: { topClaimTypes: DashboardViewData['topClaimTypes'] }) {
  return (
    <Panel className="p-5">
      <div className="flex items-center justify-between">
        <h2 className={uiTokens.typography.sectionTitle}>빈도 상위 클레임 유형 Top 5</h2>
        <span className={`${uiTokens.radius.chip} ${uiTokens.color.surfaceSubtle} px-2 py-1 ${uiTokens.typography.helper} font-bold uppercase`}>API 집계</span>
      </div>
      <div className="mt-4 grid gap-2">
        {topClaimTypes.length === 0 && (
          <p className={`${uiTokens.typography.body} ${uiTokens.color.mutedText}`}>집계된 클레임 유형이 없습니다.</p>
        )}
        {topClaimTypes.map((claimType) => (
          <div key={claimType.rank} className="flex items-center gap-4 px-2 py-2">
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center ${uiTokens.radius.compact} ${uiTokens.color.primarySurface} text-xs font-bold leading-4 ${uiTokens.color.primary}`}>{claimType.rank}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-4">
                <p className={`truncate ${uiTokens.typography.cardTitle}`}>{claimType.name}</p>
                <span className={`shrink-0 text-xs font-bold leading-4 ${uiTokens.color.primary}`}>
                  {claimType.count}건
                </span>
              </div>
              <div className={`mt-1 h-2 overflow-hidden ${uiTokens.radius.pill} ${uiTokens.color.surfaceSubtle}`}>
                <div className={`h-full ${uiTokens.radius.pill} ${uiTokens.color.primaryBg}`} style={{ width: claimType.width }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}

function RiskDistributionDonut({ distribution }: { distribution: DashboardViewData['riskDistribution'] }) {
  const criticalEnd = distribution.critical
  const highEnd = criticalEnd + distribution.high
  const mediumEnd = highEnd + distribution.medium
  const donutGradient = distribution.total > 0
    ? `conic-gradient(from -90deg, ${riskVisualClasses.CRITICAL.chart} 0% ${criticalEnd}%, ${riskVisualClasses.HIGH.chart} ${criticalEnd}% ${highEnd}%, ${riskVisualClasses.MEDIUM.chart} ${highEnd}% ${mediumEnd}%, ${riskVisualClasses.LOW.chart} ${mediumEnd}% 100%)`
    : 'conic-gradient(from -90deg, rgb(226 232 240) 0% 100%)'
  const legendItems: Array<{ label: string; riskLevel: RiskLevel }> = [
    { label: `Critical ${distribution.criticalCount}건 (${distribution.critical}%)`, riskLevel: 'CRITICAL' },
    { label: `High ${distribution.highCount}건 (${distribution.high}%)`, riskLevel: 'HIGH' },
    { label: `Medium ${distribution.mediumCount}건 (${distribution.medium}%)`, riskLevel: 'MEDIUM' },
    { label: `Low ${distribution.lowCount}건 (${distribution.low}%)`, riskLevel: 'LOW' },
  ]

  return (
    <Panel className="p-5">
      <h2 className={uiTokens.typography.sectionTitle}>Risk Distribution</h2>
      <div className="mt-5 flex justify-center pt-2">
        <div
          aria-label={`Risk Distribution donut chart: Critical ${distribution.critical}%, High ${distribution.high}%, Medium ${distribution.medium}%, Low ${distribution.low}%`}
          className="relative h-48 w-48 rounded-full"
          role="img"
          style={{ background: donutGradient }}
        >
          <div className={`absolute inset-5 flex flex-col items-center justify-center rounded-full ${uiTokens.color.surface}`}>
            <p className={uiTokens.typography.metricValue}>{distribution.total}</p>
            <p className={`mt-1 ${uiTokens.typography.label}`}>Total Items</p>
          </div>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3">
        {legendItems.map((item) => (
          <div key={item.label} className="flex min-w-0 items-center gap-2">
            <span className={`h-3 w-3 shrink-0 rounded-full ${riskVisualClasses[item.riskLevel].dot}`} />
            <span className={`truncate ${uiTokens.typography.label}`}>{item.label}</span>
          </div>
        ))}
      </div>
    </Panel>
  )
}

function LearningCandidatePanel({ learningItems }: { learningItems: LearningItem[] }) {
  const total = learningItems.reduce((sum, item) => sum + item.value, 0)

  return (
    <Panel className="p-5">
      <h2 className={`flex items-center gap-2 ${uiTokens.typography.sectionTitle}`}>
        <Layers size={20} className={uiTokens.color.primary} />
        적재 데이터 후보 현황
      </h2>
      <div className="mt-5 grid gap-3">
        {learningItems.map((item) => {
          const Icon = item.icon

          return (
            <div key={item.label} className={`flex min-h-11 items-center justify-between gap-3 ${uiTokens.radius.panel} ${uiTokens.color.surfaceMuted} px-3 py-2`}>
              <div className={`flex min-w-0 items-center gap-3 ${uiTokens.typography.label}`}>
                <Icon size={18} className={`shrink-0 ${item.tone}`} />
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-sm font-bold leading-5 ${uiTokens.color.headingText}`}>{String(item.value).padStart(2, '0')}</span>
                <span className={uiTokens.typography.helper}>건</span>
              </div>
            </div>
          )
        })}
        <div className="rounded-lg bg-slate-50 p-3">
          <p className={`${uiTokens.typography.body} ${uiTokens.color.primary}`}>현재 {total}건의 적재 후보가 승인 검토 흐름에 있습니다.</p>
        </div>
        <Link to="/learning-loop" className={`inline-flex h-10 w-full items-center justify-center gap-2 ${uiTokens.radius.compact} ${uiTokens.color.primaryBg} text-sm font-bold leading-5 text-white ${uiTokens.shadow.panel} transition ${uiTokens.color.primaryBgHover}`}>
          <ClipboardCheck size={18} />
          Learning Loop 바로가기
        </Link>
      </div>
    </Panel>
  )
}

function DashboardLoadingPanel() {
  return (
    <Panel className="p-5">
      <p className={`${uiTokens.typography.body} ${uiTokens.color.mutedText}`}>대시보드 데이터를 불러오는 중입니다.</p>
    </Panel>
  )
}

function DashboardErrorPanel({ onRetry }: { onRetry: () => void }) {
  return (
    <Panel className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
      <p className={`${uiTokens.typography.body} ${uiTokens.color.danger}`}>대시보드 데이터를 불러오지 못했습니다.</p>
      <Button variant="secondary" onClick={onRetry}>다시 조회</Button>
    </Panel>
  )
}

export function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardViewData | null>(null)
  const [loadState, setLoadState] = useState<'loading' | 'success' | 'error'>('loading')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    setLoadState('loading')
    fetchDashboardMain(controller.signal)
      .then((nextDashboard) => {
        setDashboard(nextDashboard)
        setLoadState('success')
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') {
          return
        }

        setDashboard(null)
        setLoadState('error')
      })

    return () => {
      controller.abort()
    }
  }, [reloadKey])

  const metrics = useMemo(() => dashboard ? buildMetrics(dashboard) : [], [dashboard])
  const learningItems = useMemo(() => dashboard ? buildLearningItems(dashboard) : [], [dashboard])

  return (
    <div className="w-full pb-12 pt-2">
      <PageHeader
        eyebrow="Dashboard > Command Center"
        title="Compliance Command Center"
        description="오늘의 AI 준법 감시 현황 및 긴급 검토 항목입니다."
        actions={
          <Link to="/content/new" className="w-full sm:w-auto">
            <Button className="w-full">
              <Plus size={16} />
              신규 검토 요청 등록
            </Button>
          </Link>
        }
      />

      {loadState === 'loading' && !dashboard && <DashboardLoadingPanel />}
      {loadState === 'error' && !dashboard && <DashboardErrorPanel onRetry={() => setReloadKey((current) => current + 1)} />}

      {dashboard && (
        <>
          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {metrics.map((metric) => (
              <DashboardMetricCard key={metric.id} metric={metric} />
            ))}
          </section>

          <section className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_351px]">
            <div className="grid gap-8">
              <UrgentReviewQueue priorityRows={dashboard.priorityRows} />
              <TopClaimTypesPanel topClaimTypes={dashboard.topClaimTypes} />
            </div>
            <div className="grid content-start gap-8">
              <RiskDistributionDonut distribution={dashboard.riskDistribution} />
              <LearningCandidatePanel learningItems={learningItems} />
            </div>
          </section>
        </>
      )}
    </div>
  )
}
