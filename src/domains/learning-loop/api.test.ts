import { describe, expect, it } from 'vitest'
import { fetchLearningList, normalizeLearningListResponse, processLearning } from './api'

describe('normalizeLearningListResponse', () => {
  it('maps /learning/list response to learning loop rows', () => {
    const rows = normalizeLearningListResponse([
      {
        learningId: 1,
        learningUniqueId: 'LRN-2024-001',
        comId: 1,
        comEpId: 'EP-2026-00001',
        comUniqueId: 'CNT-00001',
        comTitle: '여름 적금 이벤트 앱푸시',
        comScore: 85,
        learningStatus: 'PENDING',
        learningContent: '이번 심사에서 발견된 주요 개선 사항...',
      },
      {
        learningId: 2,
        learningUniqueId: 'LRN-2024-002',
        comId: 2,
        comEpId: 'EP-2026-00002',
        comUniqueId: 'CNT-00002',
        comTitle: 'AI 분석 실패 콘텐츠',
        comScore: null,
        learningStatus: 'REJECT',
        learningContent: null,
      },
    ])

    expect(rows).toEqual([
      {
        learningId: 1,
        candidateId: 'LRN-2024-001',
        comId: 1,
        evidencePackId: 'EP-2026-00001',
        contentId: 'CNT-00001',
        productTitle: '여름 적금 이벤트 앱푸시',
        score: '85',
        loadStatus: 'PENDING',
        learningContent: '이번 심사에서 발견된 주요 개선 사항...',
      },
      {
        learningId: 2,
        candidateId: 'LRN-2024-002',
        comId: 2,
        evidencePackId: 'EP-2026-00002',
        contentId: 'CNT-00002',
        productTitle: 'AI 분석 실패 콘텐츠',
        score: '-',
        loadStatus: 'REJECTED',
        learningContent: '-',
      },
    ])
  })
})

describe('fetchLearningList', () => {
  it('gets learning loop rows', async () => {
    const calls: Array<{ url: string | URL | Request; init?: RequestInit }> = []
    const fetcher: typeof fetch = async (url, init) => {
      calls.push({ url, init })

      return new Response(JSON.stringify([
        {
          learningId: 1,
          learningUniqueId: 'LRN-2024-001',
          comId: 1,
          comEpId: 'EP-2026-00001',
          comUniqueId: 'CNT-00001',
          comTitle: '여름 적금 이벤트 앱푸시',
          comScore: 85,
          learningStatus: 'APPROVED',
          learningContent: '승인된 학습 후보입니다.',
        },
      ]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const rows = await fetchLearningList(fetcher)

    expect(calls[0].url).toBe('/api/learning/list')
    expect(calls[0].init).toBeUndefined()
    expect(rows[0]?.candidateId).toBe('LRN-2024-001')
  })
})

describe('processLearning', () => {
  it('patches the learning loop process status', async () => {
    const calls: Array<{ url: string | URL | Request; init?: RequestInit }> = []
    const fetcher: typeof fetch = async (url, init) => {
      calls.push({ url, init })

      return new Response(null, { status: 200 })
    }

    await processLearning(3, 'APPROVED', fetcher)

    expect(calls[0].url).toBe('/api/learning/3/process')
    expect(calls[0].init?.method).toBe('PATCH')
    expect(calls[0].init?.headers).toEqual({ 'Content-Type': 'application/json' })
    expect(JSON.parse(String(calls[0].init?.body))).toEqual({ learningStatus: 'APPROVED' })
  })
})
