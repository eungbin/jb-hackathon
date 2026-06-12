import type { RiskLevel } from '../../types'

export type EvidencePackComplianceStatus = 'CONDITIONALLY_APPROVED' | 'REJECTED' | 'APPROVED'
export type EvidencePackLearningStatus = 'PENDING' | 'REJECT' | 'APPROVED' | null

export type EvidencePackResultsResponse = Array<{
  comEpId: string
  comId: number
  comUniqueId: string
  comTitle: string
  productName: string
  comChannel: string
  comStatus: EvidencePackComplianceStatus
  maxRiskLevel: RiskLevel | null
  comApprovedAt: string | null
  approverName: string | null
  learningStatus: EvidencePackLearningStatus
}>

export type EvidencePackRow = {
  packId: string
  comId: number
  contentId: string
  title: string
  productName: string
  channel: string
  comStatus: EvidencePackComplianceStatus
  riskLevel: RiskLevel | null
  finalizedAt: string
  reviewer: string
  learningStatus: EvidencePackLearningStatus
}

export type EvidencePackResultDetailResponse = {
  comRegistAt: string
  registrantName: string
  comAiReviewedAt: string | null
  comApprovedAt: string | null
  approverName: string | null
  product: {
    productId: number
    productName: string
    productCode: string
    productCategory: string
  }
  claims: Array<{
    claimsTitle: string | null
    claimsAiSummary: string
    claimsRiskLevel: RiskLevel | null
    claimsOriginal: string | null
    claimsSuggested: string | null
    claimsDisclaimer: string | null
    claimsReason: string | null
    claimFiles: Array<{
      fileType: 'PRODUCT' | 'RULE'
      fileId: number | null
      fileName: string | null
      fileUrl: string | null
      pageLocation: string | null
      fileLocation: string | null
      section: string | null
      refNote: string | null
      facts: Array<{
        factTitle: string | null
        factValue: string | null
        factUnit: string | null
        factFileLocation: string | null
        factPageLocation: string | null
        factSection: string | null
      }>
    }>
    claimKeywords: Array<{
      keywordId: number
      keywordContent: string
    }>
    reviewComments: string | null
    comStatus: EvidencePackComplianceStatus
  }>
}

type EvidencePackDetailClaim = EvidencePackResultDetailResponse['claims'][number]
type EvidencePackDetailClaimFile = EvidencePackDetailClaim['claimFiles'][number]
type EvidencePackDetailFact = EvidencePackDetailClaimFile['facts'][number]

export type EvidencePackClaimResult = {
  claim: string
  basis: string
  riskLevel: RiskLevel | null
  source: string
  locator: string
  original: string
  suggested: string
  disclaimer: string
  reason: string
  keywords: string
}

export type EvidencePackResultDetail = {
  registeredAt: string
  registrantName: string
  aiReviewedAt: string
  approvedAt: string
  approverName: string
  product: EvidencePackResultDetailResponse['product']
  claimResults: EvidencePackClaimResult[]
  finalComment: string
  comStatus: EvidencePackComplianceStatus | null
}

function isRiskLevel(value: unknown): value is RiskLevel {
  return value === 'LOW' || value === 'MEDIUM' || value === 'HIGH' || value === 'CRITICAL'
}

function isComplianceStatus(value: unknown): value is EvidencePackComplianceStatus {
  return (
    value === 'CONDITIONALLY_APPROVED'
    || value === 'REJECTED'
    || value === 'APPROVED'
  )
}

function isLearningStatus(value: unknown): value is EvidencePackLearningStatus {
  return value === null || value === 'PENDING' || value === 'REJECT' || value === 'APPROVED'
}

function isResultItem(value: unknown): value is EvidencePackResultsResponse[number] {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.comEpId === 'string'
    && typeof candidate.comId === 'number'
    && typeof candidate.comUniqueId === 'string'
    && typeof candidate.comTitle === 'string'
    && typeof candidate.productName === 'string'
    && typeof candidate.comChannel === 'string'
    && isComplianceStatus(candidate.comStatus)
    && (candidate.maxRiskLevel === null || isRiskLevel(candidate.maxRiskLevel))
    && (candidate.comApprovedAt === null || typeof candidate.comApprovedAt === 'string')
    && (candidate.approverName === null || typeof candidate.approverName === 'string')
    && isLearningStatus(candidate.learningStatus)
  )
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string'
}

function isProduct(value: unknown): value is EvidencePackResultDetailResponse['product'] {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.productId === 'number'
    && typeof candidate.productName === 'string'
    && typeof candidate.productCode === 'string'
    && typeof candidate.productCategory === 'string'
  )
}

function isClaimKeyword(value: unknown): value is EvidencePackDetailClaim['claimKeywords'][number] {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.keywordId === 'number'
    && typeof candidate.keywordContent === 'string'
  )
}

function isClaimFileType(value: unknown): value is EvidencePackDetailClaimFile['fileType'] {
  return value === 'PRODUCT' || value === 'RULE'
}

function isClaimFileFact(value: unknown): value is EvidencePackDetailFact {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    isNullableString(candidate.factTitle)
    && isNullableString(candidate.factValue)
    && isNullableString(candidate.factUnit)
    && isNullableString(candidate.factFileLocation)
    && isNullableString(candidate.factPageLocation)
    && isNullableString(candidate.factSection)
  )
}

function isClaimFile(value: unknown): value is EvidencePackDetailClaimFile {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    isClaimFileType(candidate.fileType)
    && (candidate.fileId === null || typeof candidate.fileId === 'number')
    && isNullableString(candidate.fileName)
    && isNullableString(candidate.fileUrl)
    && isNullableString(candidate.pageLocation)
    && isNullableString(candidate.fileLocation)
    && isNullableString(candidate.section)
    && isNullableString(candidate.refNote)
    && Array.isArray(candidate.facts)
    && candidate.facts.every(isClaimFileFact)
  )
}

function isDetailClaim(value: unknown): value is EvidencePackDetailClaim {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    isNullableString(candidate.claimsTitle)
    && typeof candidate.claimsAiSummary === 'string'
    && (candidate.claimsRiskLevel === null || isRiskLevel(candidate.claimsRiskLevel))
    && isNullableString(candidate.claimsOriginal)
    && isNullableString(candidate.claimsSuggested)
    && isNullableString(candidate.claimsDisclaimer)
    && isNullableString(candidate.claimsReason)
    && Array.isArray(candidate.claimFiles)
    && candidate.claimFiles.every(isClaimFile)
    && Array.isArray(candidate.claimKeywords)
    && candidate.claimKeywords.every(isClaimKeyword)
    && isNullableString(candidate.reviewComments)
    && isComplianceStatus(candidate.comStatus)
  )
}

function isDetailResponse(value: unknown): value is EvidencePackResultDetailResponse {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.comRegistAt === 'string'
    && typeof candidate.registrantName === 'string'
    && isNullableString(candidate.comAiReviewedAt)
    && isNullableString(candidate.comApprovedAt)
    && isNullableString(candidate.approverName)
    && isProduct(candidate.product)
    && Array.isArray(candidate.claims)
    && candidate.claims.every(isDetailClaim)
  )
}

function formatIsoDateTime(value: string | null | undefined) {
  if (!value) {
    return '-'
  }

  const [datePart, timePart = ''] = value.split('T')

  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return value
  }

  const date = datePart.replaceAll('-', '.')
  const time = timePart.slice(0, 5)

  return time ? `${date} ${time}` : date
}

function toChannelCode(channel: string) {
  const channelCodes: Record<string, string> = {
    앱푸시: 'APP_PUSH',
    SMS: 'SMS',
    문자: 'SMS',
    배너: 'BANNER',
    홈페이지: 'HOMEPAGE',
    SNS: 'SNS',
  }

  return channelCodes[channel] ?? channel
}

function display(value: string | null | undefined) {
  return value?.trim() || '-'
}

function joinDisplayValues(values: Array<string | null | undefined>) {
  const nonEmptyValues = values.map((value) => value?.trim()).filter((value): value is string => Boolean(value))

  return nonEmptyValues.join(', ') || '-'
}

function buildSource(claim: EvidencePackDetailClaim) {
  return joinDisplayValues(claim.claimFiles.map((file) => file.fileName))
}

function buildLocator(claim: EvidencePackDetailClaim) {
  const productFacts = claim.claimFiles.filter((file) => file.fileType === 'PRODUCT').flatMap((file) => file.facts)
  const firstFact = productFacts[0]

  if (firstFact) {
    return [firstFact.factPageLocation, firstFact.factSection, firstFact.factFileLocation].filter(Boolean).join(' / ') || '-'
  }

  const firstFile = claim.claimFiles[0]

  if (!firstFile) {
    return '-'
  }

  return [firstFile.pageLocation, firstFile.section, firstFile.fileLocation].filter(Boolean).join(' / ') || '-'
}

export function normalizeEvidencePackResultsResponse(response: EvidencePackResultsResponse): EvidencePackRow[] {
  return response.map((item) => ({
    packId: item.comEpId,
    comId: item.comId,
    contentId: item.comUniqueId,
    title: item.comTitle,
    productName: item.productName,
    channel: toChannelCode(item.comChannel),
    comStatus: item.comStatus,
    riskLevel: item.maxRiskLevel,
    finalizedAt: formatIsoDateTime(item.comApprovedAt),
    reviewer: item.approverName?.trim() || '-',
    learningStatus: item.learningStatus,
  }))
}

export function normalizeEvidencePackResultDetailResponse(response: EvidencePackResultDetailResponse): EvidencePackResultDetail {
  const firstClaim = response.claims[0]

  return {
    registeredAt: formatIsoDateTime(response.comRegistAt),
    registrantName: response.registrantName,
    aiReviewedAt: formatIsoDateTime(response.comAiReviewedAt),
    approvedAt: formatIsoDateTime(response.comApprovedAt),
    approverName: display(response.approverName),
    product: response.product,
    claimResults: response.claims.map((claim, index) => ({
      claim: display(claim.claimsTitle) !== '-' ? display(claim.claimsTitle) : `Claim ${index + 1}`,
      basis: claim.claimsAiSummary,
      riskLevel: claim.claimsRiskLevel,
      source: buildSource(claim),
      locator: buildLocator(claim),
      original: display(claim.claimsOriginal),
      suggested: display(claim.claimsSuggested),
      disclaimer: display(claim.claimsDisclaimer),
      reason: display(claim.claimsReason),
      keywords: joinDisplayValues(claim.claimKeywords.map((keyword) => keyword.keywordContent)),
    })),
    finalComment: display(firstClaim?.reviewComments),
    comStatus: firstClaim?.comStatus ?? null,
  }
}

export async function fetchEvidencePackResults(fetcher: typeof fetch = fetch) {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '/api'
  const response = await fetcher(`${apiBaseUrl}/compliance/results`)

  if (!response.ok) {
    throw new Error(`Evidence pack results API request failed: ${response.status}`)
  }

  const data: unknown = await response.json()

  if (!Array.isArray(data) || !data.every(isResultItem)) {
    throw new Error('Evidence pack results API response is invalid')
  }

  return normalizeEvidencePackResultsResponse(data)
}

export async function fetchEvidencePackResultDetail(comId: number, fetcher: typeof fetch = fetch) {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '/api'
  const response = await fetcher(`${apiBaseUrl}/compliance/results/${comId}`)

  if (!response.ok) {
    throw new Error(`Evidence pack detail API request failed: ${response.status}`)
  }

  const data: unknown = await response.json()

  if (!isDetailResponse(data)) {
    throw new Error('Evidence pack detail API response is invalid')
  }

  return normalizeEvidencePackResultDetailResponse(data)
}
