import type { RiskLevel } from '../../types'

export type ComplianceReviewListStatus = 'PENDING' | 'AI_FAILED'

export type ComplianceReviewListResponse = Array<{
  comId: number
  comUniqueId: string
  comTitle: string
  productName: string
  comChannel: string
  comStatus: ComplianceReviewListStatus
  riskLevel: RiskLevel | null
  claimsCount: number
  userName: string
  comRegistAt: string
  comReleaseAt: string | null
}>

export type ComplianceReviewRow = {
  reviewId: string
  contentId: string
  title: string
  productName: string
  channel: string
  channelCode: string
  status: ComplianceReviewListStatus
  riskLevel: RiskLevel | null
  claimCount: number
  requester: string
  requestedAt: string
  plannedPublishDate: string
}

export type ComplianceReviewDetailResponse = {
  comScore: number | null
  claims: Array<{
    claimsTitle: string | null
    claimsType: string | null
    claimsAiVerified: string | null
    claimsRiskLevel: RiskLevel | null
    claimsAiSummary: string
    claimsOriginal: string | null
    claimsSuggested: string | null
    claimsDisclaimer: string | null
    claimsReason: string | null
    productFile: {
      fileId: number
      fileName: string
      fileUrl: string
      fileType: string
      fileDate: string
      fileContent: string | null
    }
    productFacts: Array<{
      factId: number
      factType: string | null
      factTitle: string | null
      factValue: string | null
      factUnit: string | null
      factCondition: string | null
      factFileLocation: string | null
      factPageLocation: string | null
      factSection: string | null
      factNote: string | null
    }>
    rules: Array<{
      ruleId: number
      ruleUniqueId: string
      ruleTitle: string
      ruleRequired: string | null
      ruleRiskLevel: string | null
      keywords: Array<{
        keywordId: number
        keywordContent: string
      }>
    }>
    ruleFiles: Array<{
      ruleFileId: number
      ruleFileUrl: string
      ruleFileTitle: string
      ruleRegistAt: string
    }>
  }>
}

export type ComplianceReviewClaim = {
  claimId: string
  statement: string
  type: string
  verificationResult: string
  riskLevel: RiskLevel | null
  riskLabel: string
  evidence: {
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
}

export type ComplianceReviewEvidenceSource = {
  kind: 'productTruth' | 'rule' | 'ruleFile'
  title: string
  count: string
  description: string
}

export type ComplianceReviewDetail = {
  score: number | null
  claims: ComplianceReviewClaim[]
  evidenceSources: ComplianceReviewEvidenceSource[]
  originalText: string
}

export type ComplianceProcessStatus = 'APPROVED' | 'REJECTED' | 'CONDITIONALLY_APPROVED'

export type ComplianceProcessRequest = {
  userId: number
  comReviewComments?: string
  comStatus: ComplianceProcessStatus
}

const complianceListPath = '/compliance/list'

function isRiskLevel(value: unknown): value is RiskLevel {
  return value === 'LOW' || value === 'MEDIUM' || value === 'HIGH' || value === 'CRITICAL'
}

function isComplianceReviewListStatus(value: unknown): value is ComplianceReviewListStatus {
  return value === 'PENDING' || value === 'AI_FAILED'
}

function isComplianceReviewListItem(value: unknown): value is ComplianceReviewListResponse[number] {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.comId === 'number'
    && typeof candidate.comUniqueId === 'string'
    && typeof candidate.comTitle === 'string'
    && typeof candidate.productName === 'string'
    && typeof candidate.comChannel === 'string'
    && isComplianceReviewListStatus(candidate.comStatus)
    && (candidate.riskLevel === null || isRiskLevel(candidate.riskLevel))
    && typeof candidate.claimsCount === 'number'
    && typeof candidate.userName === 'string'
    && typeof candidate.comRegistAt === 'string'
    && (candidate.comReleaseAt === null || typeof candidate.comReleaseAt === 'string')
  )
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string'
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number'
}

function isKeyword(value: unknown): value is ComplianceReviewDetailResponse['claims'][number]['rules'][number]['keywords'][number] {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>

  return isNumber(candidate.keywordId) && typeof candidate.keywordContent === 'string'
}

function isProductFile(value: unknown): value is ComplianceReviewDetailResponse['claims'][number]['productFile'] {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    isNumber(candidate.fileId)
    && typeof candidate.fileName === 'string'
    && typeof candidate.fileUrl === 'string'
    && typeof candidate.fileType === 'string'
    && typeof candidate.fileDate === 'string'
    && isNullableString(candidate.fileContent)
  )
}

function isProductFact(value: unknown): value is ComplianceReviewDetailResponse['claims'][number]['productFacts'][number] {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    isNumber(candidate.factId)
    && isNullableString(candidate.factType)
    && isNullableString(candidate.factTitle)
    && isNullableString(candidate.factValue)
    && isNullableString(candidate.factUnit)
    && isNullableString(candidate.factCondition)
    && isNullableString(candidate.factFileLocation)
    && isNullableString(candidate.factPageLocation)
    && isNullableString(candidate.factSection)
    && isNullableString(candidate.factNote)
  )
}

function isRule(value: unknown): value is ComplianceReviewDetailResponse['claims'][number]['rules'][number] {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    isNumber(candidate.ruleId)
    && typeof candidate.ruleUniqueId === 'string'
    && typeof candidate.ruleTitle === 'string'
    && isNullableString(candidate.ruleRequired)
    && isNullableString(candidate.ruleRiskLevel)
    && Array.isArray(candidate.keywords)
    && candidate.keywords.every(isKeyword)
  )
}

function isRuleFile(value: unknown): value is ComplianceReviewDetailResponse['claims'][number]['ruleFiles'][number] {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    isNumber(candidate.ruleFileId)
    && typeof candidate.ruleFileUrl === 'string'
    && typeof candidate.ruleFileTitle === 'string'
    && typeof candidate.ruleRegistAt === 'string'
  )
}

function isComplianceReviewDetailClaim(value: unknown): value is ComplianceReviewDetailResponse['claims'][number] {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    isNullableString(candidate.claimsTitle)
    && isNullableString(candidate.claimsType)
    && isNullableString(candidate.claimsAiVerified)
    && (candidate.claimsRiskLevel === null || isRiskLevel(candidate.claimsRiskLevel))
    && typeof candidate.claimsAiSummary === 'string'
    && isNullableString(candidate.claimsOriginal)
    && isNullableString(candidate.claimsSuggested)
    && isNullableString(candidate.claimsDisclaimer)
    && isNullableString(candidate.claimsReason)
    && isProductFile(candidate.productFile)
    && Array.isArray(candidate.productFacts)
    && candidate.productFacts.every(isProductFact)
    && Array.isArray(candidate.rules)
    && candidate.rules.every(isRule)
    && Array.isArray(candidate.ruleFiles)
    && candidate.ruleFiles.every(isRuleFile)
  )
}

function isComplianceReviewDetailResponse(value: unknown): value is ComplianceReviewDetailResponse {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    (candidate.comScore === null || isNumber(candidate.comScore))
    && Array.isArray(candidate.claims)
    && candidate.claims.every(isComplianceReviewDetailClaim)
  )
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

function riskLabelOf(riskLevel: RiskLevel | null) {
  const riskLabels: Record<RiskLevel, string> = {
    LOW: '낮음',
    MEDIUM: '보통',
    HIGH: '높음',
    CRITICAL: '심각',
  }

  return riskLevel ? riskLabels[riskLevel] : '미정'
}

function normalizeProductTruth(claim: ComplianceReviewDetailResponse['claims'][number]) {
  const productTruth: Record<string, string> = {
    파일명: claim.productFile.fileName,
    '파일 유형': claim.productFile.fileType,
    '업로드 일시': formatIsoDateTime(claim.productFile.fileDate),
    '파일 설명': display(claim.productFile.fileContent),
  }

  claim.productFacts.forEach((fact, index) => {
    const title = display(fact.factTitle)
    const value = `${display(fact.factValue)}${fact.factUnit ?? ''}`

    productTruth[title !== '-' ? title : `팩트 ${index + 1}`] = value

    if (fact.factCondition) {
      productTruth[`${title} 조건`] = fact.factCondition
    }

    if (fact.factFileLocation || fact.factPageLocation || fact.factSection) {
      productTruth[`${title} 위치`] = [fact.factPageLocation, fact.factSection, fact.factFileLocation].filter(Boolean).join(' / ')
    }
  })

  return productTruth
}

function normalizeRule(claim: ComplianceReviewDetailResponse['claims'][number]) {
  const firstRule = claim.rules[0]
  const firstRuleFile = claim.ruleFiles[0]
  const requiredItems = claim.rules.map((rule) => rule.ruleRequired).filter((item): item is string => Boolean(item))

  return {
    ruleId: firstRule?.ruleUniqueId ?? (firstRule ? String(firstRule.ruleId) : '-'),
    requiredItems: requiredItems.length > 0 ? requiredItems : claim.rules.flatMap((rule) => rule.keywords.map((keyword) => keyword.keywordContent)),
    severity: firstRule?.ruleRiskLevel ?? '-',
    index: firstRuleFile?.ruleFileTitle ?? '-',
    source: claim.rules.map((rule) => rule.ruleTitle).join(', ') || '-',
  }
}

function normalizeEvidenceSources(response: ComplianceReviewDetailResponse): ComplianceReviewEvidenceSource[] {
  const productFileNames = new Set(response.claims.map((claim) => claim.productFile.fileName))
  const ruleTitles = new Set(response.claims.flatMap((claim) => claim.rules.map((rule) => rule.ruleTitle)))
  const ruleFileTitles = new Set(response.claims.flatMap((claim) => claim.ruleFiles.map((file) => file.ruleFileTitle)))

  return [
    {
      kind: 'productTruth',
      title: 'Product Truth',
      count: `${productFileNames.size}개 파일`,
      description: Array.from(productFileNames).join(', ') || '상품 기준정보 파일',
    },
    {
      kind: 'rule',
      title: 'Rules & Sources',
      count: `${ruleTitles.size}개 Rule`,
      description: Array.from(ruleTitles).join(', ') || '적용된 규칙',
    },
    {
      kind: 'ruleFile',
      title: '근거 문서',
      count: `${ruleFileTitles.size}개 파일`,
      description: Array.from(ruleFileTitles).join(', ') || '룰 근거 파일',
    },
  ]
}

export function normalizeComplianceReviewListResponse(response: ComplianceReviewListResponse): ComplianceReviewRow[] {
  return response.map((item) => ({
    reviewId: String(item.comId),
    contentId: item.comUniqueId,
    title: item.comTitle,
    productName: item.productName,
    channel: item.comChannel,
    channelCode: toChannelCode(item.comChannel),
    status: item.comStatus,
    riskLevel: item.riskLevel,
    claimCount: item.claimsCount,
    requester: item.userName,
    requestedAt: formatIsoDateTime(item.comRegistAt),
    plannedPublishDate: formatIsoDate(item.comReleaseAt),
  }))
}

export function normalizeComplianceReviewDetailResponse(response: ComplianceReviewDetailResponse): ComplianceReviewDetail {
  return {
    score: response.comScore,
    claims: response.claims.map((claim, index) => ({
      claimId: `CLM-${String(index + 1).padStart(3, '0')}`,
      statement: display(claim.claimsTitle) !== '-' ? display(claim.claimsTitle) : `Claim ${index + 1}`,
      type: display(claim.claimsType),
      verificationResult: display(claim.claimsAiVerified),
      riskLevel: claim.claimsRiskLevel,
      riskLabel: riskLabelOf(claim.claimsRiskLevel),
      evidence: {
        productTruth: normalizeProductTruth(claim),
        rule: normalizeRule(claim),
        aiSummary: claim.claimsAiSummary,
        revision: {
          original: display(claim.claimsOriginal),
          suggested: display(claim.claimsSuggested),
          additionalNotice: display(claim.claimsDisclaimer),
          reason: display(claim.claimsReason),
        },
      },
    })),
    evidenceSources: normalizeEvidenceSources(response),
    originalText: response.claims.map((claim) => claim.claimsOriginal).filter((value): value is string => Boolean(value)).join('\n\n'),
  }
}

export async function fetchComplianceReviewList(fetcher: typeof fetch = fetch) {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '/api'
  const response = await fetcher(`${apiBaseUrl}${complianceListPath}`)

  if (!response.ok) {
    throw new Error(`Compliance review list API request failed: ${response.status}`)
  }

  const data: unknown = await response.json()

  if (!Array.isArray(data) || !data.every(isComplianceReviewListItem)) {
    throw new Error('Compliance review list API response is invalid')
  }

  return normalizeComplianceReviewListResponse(data)
}

export async function fetchComplianceReviewDetail(comId: number, fetcher: typeof fetch = fetch) {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '/api'
  const response = await fetcher(`${apiBaseUrl}/compliance/${comId}`)

  if (!response.ok) {
    throw new Error(`Compliance review detail API request failed: ${response.status}`)
  }

  const data: unknown = await response.json()

  if (!isComplianceReviewDetailResponse(data)) {
    throw new Error('Compliance review detail API response is invalid')
  }

  return normalizeComplianceReviewDetailResponse(data)
}

export async function processComplianceReview(comId: number, request: ComplianceProcessRequest, fetcher: typeof fetch = fetch) {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '/api'
  const response = await fetcher(`${apiBaseUrl}/compliance/${comId}/process`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`Compliance review process API request failed: ${response.status}`)
  }
}
