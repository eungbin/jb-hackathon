import { describe, expect, it } from 'vitest'
import { fetchEvidencePackResultDetail, fetchEvidencePackResults, normalizeEvidencePackResultDetailResponse, normalizeEvidencePackResultsResponse } from './api'

describe('normalizeEvidencePackResultsResponse', () => {
  it('maps /compliance/results response to evidence pack rows', () => {
    const rows = normalizeEvidencePackResultsResponse([
      {
        comEpId: 'EP-2024-00001',
        comId: 1,
        comUniqueId: 'CNT-00001',
        comTitle: '여름 적금 이벤트 앱푸시',
        productName: 'JB 첫 적금',
        comChannel: '앱푸시',
        comStatus: 'REJECTED',
        maxRiskLevel: 'HIGH',
        comApprovedAt: '2024-07-25T11:00:00',
        approverName: '김준법',
        learningStatus: 'PENDING',
      },
      {
        comEpId: 'EP-2024-00002',
        comId: 2,
        comUniqueId: 'CNT-00002',
        comTitle: 'AI 분석 실패 콘텐츠',
        productName: 'JB 대출',
        comChannel: 'SMS',
        comStatus: 'CONDITIONALLY_APPROVED',
        maxRiskLevel: null,
        comApprovedAt: null,
        approverName: null,
        learningStatus: null,
      },
    ])

    expect(rows).toEqual([
      {
        packId: 'EP-2024-00001',
        comId: 1,
        contentId: 'CNT-00001',
        title: '여름 적금 이벤트 앱푸시',
        productName: 'JB 첫 적금',
        channel: 'APP_PUSH',
        comStatus: 'REJECTED',
        riskLevel: 'HIGH',
        finalizedAt: '2024.07.25 11:00',
        reviewer: '김준법',
        learningStatus: 'PENDING',
      },
      {
        packId: 'EP-2024-00002',
        comId: 2,
        contentId: 'CNT-00002',
        title: 'AI 분석 실패 콘텐츠',
        productName: 'JB 대출',
        channel: 'SMS',
        comStatus: 'CONDITIONALLY_APPROVED',
        riskLevel: null,
        finalizedAt: '-',
        reviewer: '-',
        learningStatus: null,
      },
    ])
  })
})

describe('fetchEvidencePackResults', () => {
  it('gets evidence pack result rows', async () => {
    const calls: Array<{ url: string | URL | Request; init?: RequestInit }> = []
    const fetcher: typeof fetch = async (url, init) => {
      calls.push({ url, init })

      return new Response(JSON.stringify([
        {
          comEpId: 'EP-2024-00001',
          comId: 1,
          comUniqueId: 'CNT-00001',
          comTitle: '여름 적금 이벤트 앱푸시',
          productName: 'JB 첫 적금',
          comChannel: '앱푸시',
          comStatus: 'APPROVED',
          maxRiskLevel: 'LOW',
          comApprovedAt: '2024-07-25T11:00:00',
          approverName: '김준법',
          learningStatus: 'APPROVED',
        },
      ]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const rows = await fetchEvidencePackResults(fetcher)

    expect(calls[0].url).toBe('/api/compliance/results')
    expect(calls[0].init).toBeUndefined()
    expect(rows[0]?.packId).toBe('EP-2024-00001')
  })

  it('rejects result rows with non-final compliance status', async () => {
    const fetcher: typeof fetch = async () => new Response(JSON.stringify([
      {
        comEpId: 'EP-2024-00001',
        comId: 1,
        comUniqueId: 'CNT-00001',
        comTitle: 'AI 분석 실패 콘텐츠',
        productName: 'JB 첫 적금',
        comChannel: '앱푸시',
        comStatus: 'AI_FAILED',
        maxRiskLevel: null,
        comApprovedAt: null,
        approverName: null,
        learningStatus: null,
      },
    ]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

    await expect(fetchEvidencePackResults(fetcher)).rejects.toThrow('Evidence pack results API response is invalid')
  })
})

describe('normalizeEvidencePackResultDetailResponse', () => {
  it('maps /compliance/results/{comId} response to evidence pack detail data', () => {
    const detail = normalizeEvidencePackResultDetailResponse({
      comRegistAt: '2024-07-20T14:30:00',
      registrantName: '홍길동',
      comAiReviewedAt: '2024-07-20T14:35:12',
      comApprovedAt: null,
      approverName: '김준법',
      product: {
        productId: 1,
        productName: 'JB 첫 적금',
        productCode: 'PRD-2024-001',
        productCategory: '적금',
      },
      claims: [
        {
          claimsTitle: '우대금리 조건 미기재',
          claimsAiSummary: '우대금리 적용 조건이 광고 문구에 명시되지 않아 소비자 오인 가능성이 있습니다.',
          claimsRiskLevel: 'HIGH',
          claimsOriginal: '최저 연 4.5%로 내 집 마련의 꿈을 이루세요.',
          claimsSuggested: '연 4.5%~8.2% (신용등급에 따라 상이)로 내 집 마련의 꿈을 이루세요.',
          claimsDisclaimer: '실제 적용 금리는 고객 신용등급에 따라 상이합니다.',
          claimsReason: '금리 표시 의무 위반: 최저 금리만 표시하고 최고 금리 미기재',
          productFile: {
            fileId: 1,
            fileName: '상품설명서.pdf',
            fileType: '상품설명서',
            fileUrl: 'http://localhost:8080/files/products/20240701/abc123.pdf',
          },
          productFacts: [
            {
              factTitle: '기본금리',
              factValue: '3.5',
              factUnit: '%',
              factFileLocation: '1페이지 3번째 줄',
              factPageLocation: '1페이지',
              factSection: '제1조',
            },
          ],
          reviewComments: '우대금리 조건 문구 추가 후 재신청 요망',
          comStatus: 'REJECTED',
        },
      ],
    })

    expect(detail).toMatchObject({
      registeredAt: '2024.07.20 14:30',
      registrantName: '홍길동',
      aiReviewedAt: '2024.07.20 14:35',
      approvedAt: '-',
      approverName: '김준법',
      product: {
        productName: 'JB 첫 적금',
        productCode: 'PRD-2024-001',
        productCategory: '적금',
      },
      finalComment: '우대금리 조건 문구 추가 후 재신청 요망',
      comStatus: 'REJECTED',
    })
    expect(detail.claimResults[0]).toMatchObject({
      claim: '우대금리 조건 미기재',
      basis: '우대금리 적용 조건이 광고 문구에 명시되지 않아 소비자 오인 가능성이 있습니다.',
      riskLevel: 'HIGH',
      source: '상품설명서.pdf',
      locator: '1페이지 / 제1조 / 1페이지 3번째 줄',
      original: '최저 연 4.5%로 내 집 마련의 꿈을 이루세요.',
      suggested: '연 4.5%~8.2% (신용등급에 따라 상이)로 내 집 마련의 꿈을 이루세요.',
      disclaimer: '실제 적용 금리는 고객 신용등급에 따라 상이합니다.',
      reason: '금리 표시 의무 위반: 최저 금리만 표시하고 최고 금리 미기재',
    })
  })
})

describe('fetchEvidencePackResultDetail', () => {
  it('gets evidence pack detail by compliance id', async () => {
    const calls: Array<{ url: string | URL | Request; init?: RequestInit }> = []
    const fetcher: typeof fetch = async (url, init) => {
      calls.push({ url, init })

      return new Response(JSON.stringify({
        comRegistAt: '2024-07-20T14:30:00',
        registrantName: '홍길동',
        comAiReviewedAt: null,
        comApprovedAt: null,
        approverName: null,
        product: {
          productId: 1,
          productName: 'JB 첫 적금',
          productCode: 'PRD-2024-001',
          productCategory: '적금',
        },
        claims: [],
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const detail = await fetchEvidencePackResultDetail(1, fetcher)

    expect(calls[0].url).toBe('/api/compliance/results/1')
    expect(calls[0].init).toBeUndefined()
    expect(detail.product.productName).toBe('JB 첫 적금')
  })
})
