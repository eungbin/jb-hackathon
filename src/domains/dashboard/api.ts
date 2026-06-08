import type { RiskLevel } from '../../types'

type ComplianceStatus = 'PENDING' | 'AI_FAILED' | 'CONDITIONALLY_APPROVED' | 'REJECTED' | 'APPROVED'
type LearningDashboardStatus = 'PENDING' | 'REJECT' | 'APPROVED'

export type DashboardMainResponse = {
  comStatusCounts: Partial<Record<ComplianceStatus, number>>
  complianceList: Array<{
    comId: number
    comTitle: string
    productCategory: string
    riskLevel: RiskLevel | null
    comUrgency: string | null
    comReleaseAt: string | null
    comRegistAt: string
  }>
  riskLevelCounts: Partial<Record<RiskLevel, number>>
  learningStatusCounts: Partial<Record<LearningDashboardStatus, number>>
  topClaimsTypes: Array<{
    claimsType: string
    count: number
  }>
}

export type DashboardViewData = {
  comStatusCounts: {
    pending: number
    aiFailed: number
    conditionallyApproved: number
    rejected: number
    approved: number
  }
  priorityRows: Array<{
    comId: number
    title: string
    productCategory: string
    riskLevel: RiskLevel | null
    urgency: string
    submittedAt: string
    plannedPublishDate: string
  }>
  riskDistribution: {
    total: number
    critical: number
    high: number
    medium: number
    low: number
    criticalCount: number
    highCount: number
    mediumCount: number
    lowCount: number
  }
  learning: {
    approvalPending: number
    approved: number
    rejected: number
  }
  topClaimTypes: Array<{
    rank: string
    name: string
    count: number
    width: string
  }>
}

const dashboardMainPath = '/user/main'

function countOf<T extends string>(counts: Partial<Record<T, number>>, key: T) {
  return counts[key] ?? 0
}

function toPercent(count: number, total: number) {
  return total > 0 ? Math.round((count / total) * 100) : 0
}

function parseIsoParts(value: string | null | undefined) {
  if (!value) {
    return null
  }

  const [datePart, timePart = ''] = value.split('T')

  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return null
  }

  return {
    date: datePart.replaceAll('-', '.'),
    time: timePart.slice(0, 5),
  }
}

function formatIsoDate(value: string | null | undefined) {
  const parts = parseIsoParts(value)

  return parts ? parts.date : value ?? '-'
}

function formatIsoDateTime(value: string | null | undefined) {
  const parts = parseIsoParts(value)

  if (!parts) {
    return value ?? '-'
  }

  return parts.time ? `${parts.date} ${parts.time}` : parts.date
}

export function normalizeDashboardMainResponse(response: DashboardMainResponse): DashboardViewData {
  const criticalCount = countOf(response.riskLevelCounts, 'CRITICAL')
  const highCount = countOf(response.riskLevelCounts, 'HIGH')
  const mediumCount = countOf(response.riskLevelCounts, 'MEDIUM')
  const lowCount = countOf(response.riskLevelCounts, 'LOW')
  const totalRiskCount = criticalCount + highCount + mediumCount + lowCount
  const maxClaimTypeCount = Math.max(...response.topClaimsTypes.map((claimType) => claimType.count), 0)

  return {
    comStatusCounts: {
      pending: countOf(response.comStatusCounts, 'PENDING'),
      aiFailed: countOf(response.comStatusCounts, 'AI_FAILED'),
      conditionallyApproved: countOf(response.comStatusCounts, 'CONDITIONALLY_APPROVED'),
      rejected: countOf(response.comStatusCounts, 'REJECTED'),
      approved: countOf(response.comStatusCounts, 'APPROVED'),
    },
    priorityRows: response.complianceList.map((item) => ({
      comId: item.comId,
      title: item.comTitle,
      productCategory: item.productCategory,
      riskLevel: item.riskLevel,
      urgency: item.comUrgency ?? '-',
      submittedAt: formatIsoDateTime(item.comRegistAt),
      plannedPublishDate: formatIsoDate(item.comReleaseAt),
    })),
    riskDistribution: {
      total: totalRiskCount,
      critical: toPercent(criticalCount, totalRiskCount),
      high: toPercent(highCount, totalRiskCount),
      medium: toPercent(mediumCount, totalRiskCount),
      low: toPercent(lowCount, totalRiskCount),
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
    },
    learning: {
      approvalPending: countOf(response.learningStatusCounts, 'PENDING'),
      approved: countOf(response.learningStatusCounts, 'APPROVED'),
      rejected: countOf(response.learningStatusCounts, 'REJECT'),
    },
    topClaimTypes: response.topClaimsTypes.slice(0, 5).map((claimType, index) => ({
      rank: String(index + 1).padStart(2, '0'),
      name: claimType.claimsType,
      count: claimType.count,
      width: maxClaimTypeCount > 0 ? `${Math.round((claimType.count / maxClaimTypeCount) * 100)}%` : '0%',
    })),
  }
}

export async function fetchDashboardMain(signal?: AbortSignal) {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? ''
  const response = await fetch(`${apiBaseUrl}${dashboardMainPath}`, { signal })

  if (!response.ok) {
    throw new Error(`Dashboard API request failed: ${response.status}`)
  }

  return normalizeDashboardMainResponse(await response.json() as DashboardMainResponse)
}
