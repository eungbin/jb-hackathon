export type LearningListStatus = 'PENDING' | 'REJECT' | 'REJECTED' | 'APPROVED'
export type LearningLoopLoadStatus = 'PENDING' | 'REJECTED' | 'APPROVED'
export type LearningProcessStatus = 'APPROVED' | 'REJECT'

export type LearningListResponse = Array<{
  learningId: number
  learningUniqueId: string
  comId: number
  comEpId: string
  comUniqueId: string
  comTitle: string
  comScore: number | null
  learningStatus: LearningListStatus
  learningContent: string | null
}>

export type LearningLoopRow = {
  learningId: number
  candidateId: string
  comId: number
  evidencePackId: string
  contentId: string
  productTitle: string
  score: string
  loadStatus: LearningLoopLoadStatus
  learningContent: string
}

function isLearningStatus(value: unknown): value is LearningListStatus {
  return value === 'PENDING' || value === 'REJECT' || value === 'REJECTED' || value === 'APPROVED'
}

function isLearningListItem(value: unknown): value is LearningListResponse[number] {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.learningId === 'number'
    && typeof candidate.learningUniqueId === 'string'
    && typeof candidate.comId === 'number'
    && typeof candidate.comEpId === 'string'
    && typeof candidate.comUniqueId === 'string'
    && typeof candidate.comTitle === 'string'
    && (candidate.comScore === null || typeof candidate.comScore === 'number')
    && isLearningStatus(candidate.learningStatus)
    && (candidate.learningContent === null || typeof candidate.learningContent === 'string')
  )
}

function normalizeStatus(status: LearningListStatus): LearningLoopLoadStatus {
  return status === 'REJECT' ? 'REJECTED' : status
}

function displayNullable(value: string | number | null) {
  if (value === null) {
    return '-'
  }

  return String(value).trim() || '-'
}

export function normalizeLearningListResponse(response: LearningListResponse): LearningLoopRow[] {
  return response.map((item) => ({
    learningId: item.learningId,
    candidateId: item.learningUniqueId,
    comId: item.comId,
    evidencePackId: item.comEpId,
    contentId: item.comUniqueId,
    productTitle: item.comTitle,
    score: displayNullable(item.comScore),
    loadStatus: normalizeStatus(item.learningStatus),
    learningContent: displayNullable(item.learningContent),
  }))
}

export async function fetchLearningList(fetcher: typeof fetch = fetch) {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '/api'
  const response = await fetcher(`${apiBaseUrl}/learning/list`)

  if (!response.ok) {
    throw new Error(`Learning loop API request failed: ${response.status}`)
  }

  const data: unknown = await response.json()

  if (!Array.isArray(data) || !data.every(isLearningListItem)) {
    throw new Error('Learning loop API response is invalid')
  }

  return normalizeLearningListResponse(data)
}

export async function processLearning(learningId: number, learningStatus: LearningProcessStatus, fetcher: typeof fetch = fetch) {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '/api'
  const response = await fetcher(`${apiBaseUrl}/learning/${learningId}/process`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ learningStatus }),
  })

  if (!response.ok) {
    throw new Error(`Learning loop process API request failed: ${response.status}`)
  }
}
