import type { RiskLevel } from '../../types'

export type RuleListResponse = {
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
    ruleFileTitle: string
    ruleFileUrl: string
    ruleRegistAt: string
  }>
}

export type RuleRegistryRule = {
  ruleId: number
  ruleUniqueId: string
  name: string
  severity: RiskLevel | null
  triggerKeywords: string[]
  requiredDisclosures: string
}

export type RuleSourceDocument = {
  documentId: string
  title: string
  url: string
  syncedAt: string
  status: 'ACTIVE'
}

export type RulesSourcesData = {
  rules: RuleRegistryRule[]
  sourceDocuments: RuleSourceDocument[]
}

export type RuleCreateDraft = {
  name: string
  severity: RiskLevel | ''
  triggerKeywords: string
  requiredDisclosures: string
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string'
}

function isRiskLevel(value: unknown): value is RiskLevel {
  return value === 'LOW' || value === 'MEDIUM' || value === 'HIGH' || value === 'CRITICAL'
}

function isKeyword(value: unknown): value is RuleListResponse['rules'][number]['keywords'][number] {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>

  return typeof candidate.keywordId === 'number' && typeof candidate.keywordContent === 'string'
}

function isRule(value: unknown): value is RuleListResponse['rules'][number] {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.ruleId === 'number'
    && typeof candidate.ruleUniqueId === 'string'
    && typeof candidate.ruleTitle === 'string'
    && isNullableString(candidate.ruleRequired)
    && isNullableString(candidate.ruleRiskLevel)
    && Array.isArray(candidate.keywords)
    && candidate.keywords.every(isKeyword)
  )
}

function isRuleFile(value: unknown): value is RuleListResponse['ruleFiles'][number] {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.ruleFileId === 'number'
    && typeof candidate.ruleFileTitle === 'string'
    && typeof candidate.ruleFileUrl === 'string'
    && typeof candidate.ruleRegistAt === 'string'
  )
}

function isRuleListResponse(value: unknown): value is RuleListResponse {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    Array.isArray(candidate.rules)
    && candidate.rules.every(isRule)
    && Array.isArray(candidate.ruleFiles)
    && candidate.ruleFiles.every(isRuleFile)
  )
}

function formatIsoDateTime(value: string) {
  const [datePart, timePart = ''] = value.split('T')

  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return value
  }

  const date = datePart.replaceAll('-', '.')
  const time = timePart.slice(0, 5)

  return time ? `${date} ${time}` : date
}

function normalizeSeverity(value: string | null): RiskLevel | null {
  return isRiskLevel(value) ? value : null
}

function splitKeywords(value: string) {
  return value.split(',').map((keyword) => keyword.trim()).filter(Boolean)
}

function apiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '/api'
}

export function normalizeRulesSourcesResponse(response: RuleListResponse): RulesSourcesData {
  return {
    rules: response.rules.map((rule) => ({
      ruleId: rule.ruleId,
      ruleUniqueId: rule.ruleUniqueId,
      name: rule.ruleTitle,
      severity: normalizeSeverity(rule.ruleRiskLevel),
      triggerKeywords: rule.keywords.map((keyword) => keyword.keywordContent),
      requiredDisclosures: rule.ruleRequired?.trim() || '-',
    })),
    sourceDocuments: response.ruleFiles.map((file) => ({
      documentId: `RULE-FILE-${file.ruleFileId}`,
      title: file.ruleFileTitle,
      url: file.ruleFileUrl,
      syncedAt: formatIsoDateTime(file.ruleRegistAt),
      status: 'ACTIVE',
    })),
  }
}

export async function fetchRulesSources(fetcher: typeof fetch = fetch) {
  const response = await fetcher(`${apiBaseUrl()}/rule/list`)

  if (!response.ok) {
    throw new Error(`Rules & Sources API request failed: ${response.status}`)
  }

  const data: unknown = await response.json()

  if (!isRuleListResponse(data)) {
    throw new Error('Rules & Sources API response is invalid')
  }

  return normalizeRulesSourcesResponse(data)
}

export async function createRule(rule: RuleCreateDraft, fetcher: typeof fetch = fetch) {
  const response = await fetcher(`${apiBaseUrl()}/rule/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ruleTitle: rule.name,
      ruleRequired: rule.requiredDisclosures.trim() || null,
      ruleRiskLevel: rule.severity || null,
      keywords: splitKeywords(rule.triggerKeywords),
    }),
  })

  if (!response.ok) {
    throw new Error(`Rule create API request failed: ${response.status}`)
  }

  const ruleId: unknown = await response.json()

  if (typeof ruleId !== 'number') {
    throw new Error('Rule create API response is invalid')
  }

  return ruleId
}

export async function uploadRuleFile(file: File, fetcher: typeof fetch = fetch) {
  const formData = new FormData()

  formData.append('file', file)

  const response = await fetcher(`${apiBaseUrl()}/rule/file/create`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Rule file create API request failed: ${response.status}`)
  }

  const ruleFileId: unknown = await response.json()

  if (typeof ruleFileId !== 'number') {
    throw new Error('Rule file create API response is invalid')
  }

  return ruleFileId
}
