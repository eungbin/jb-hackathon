import { describe, expect, it } from 'vitest'
import { fetchComplianceReviewDetail, fetchComplianceReviewList, normalizeComplianceReviewDetailResponse, normalizeComplianceReviewListResponse, processComplianceReview } from './api'

describe('normalizeComplianceReviewListResponse', () => {
  it('maps /compliance/list response to review queue rows', () => {
    const rows = normalizeComplianceReviewListResponse([
      {
        comId: 1,
        comUniqueId: 'CNT-00001',
        comTitle: '여름 적금 이벤트 앱푸시',
        productName: 'JB 첫 적금',
        comChannel: '앱푸시',
        comStatus: 'PENDING',
        riskLevel: 'HIGH',
        claimsCount: 3,
        userName: '홍길동',
        comRegistAt: '2024-07-20T14:30:00',
        comReleaseAt: '2024-08-01T09:00:00',
      },
      {
        comId: 2,
        comUniqueId: 'CNT-00002',
        comTitle: '공개일 미정 콘텐츠',
        productName: 'JB 첫 예금',
        comChannel: 'SMS',
        comStatus: 'AI_FAILED',
        riskLevel: null,
        claimsCount: 0,
        userName: '김준법',
        comRegistAt: 'bad-date',
        comReleaseAt: null,
      },
    ])

    expect(rows).toEqual([
      {
        reviewId: '1',
        contentId: 'CNT-00001',
        title: '여름 적금 이벤트 앱푸시',
        productName: 'JB 첫 적금',
        channel: '앱푸시',
        channelCode: 'APP_PUSH',
        status: 'PENDING',
        riskLevel: 'HIGH',
        claimCount: 3,
        requester: '홍길동',
        requestedAt: '2024.07.20 14:30',
        plannedPublishDate: '2024.08.01',
      },
      {
        reviewId: '2',
        contentId: 'CNT-00002',
        title: '공개일 미정 콘텐츠',
        productName: 'JB 첫 예금',
        channel: 'SMS',
        channelCode: 'SMS',
        status: 'AI_FAILED',
        riskLevel: null,
        claimCount: 0,
        requester: '김준법',
        requestedAt: 'bad-date',
        plannedPublishDate: '-',
      },
    ])
  })
})

describe('fetchComplianceReviewList', () => {
  it('gets compliance review rows', async () => {
    const calls: Array<{ url: string | URL | Request; init?: RequestInit }> = []
    const fetcher: typeof fetch = async (url, init) => {
      calls.push({ url, init })

      return new Response(JSON.stringify([
        {
          comId: 1,
          comUniqueId: 'CNT-00001',
          comTitle: '여름 적금 이벤트 앱푸시',
          productName: 'JB 첫 적금',
          comChannel: '앱푸시',
          comStatus: 'PENDING',
          riskLevel: 'HIGH',
          claimsCount: 3,
          userName: '홍길동',
          comRegistAt: '2024-07-20T14:30:00',
          comReleaseAt: '2024-08-01T09:00:00',
        },
      ]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const rows = await fetchComplianceReviewList(fetcher)

    expect(calls[0].url).toBe('/api/compliance/list')
    expect(calls[0].init).toBeUndefined()
    expect(rows[0]?.reviewId).toBe('1')
    expect(rows[0]?.contentId).toBe('CNT-00001')
    expect(rows[0]?.status).toBe('PENDING')
  })
})

describe('normalizeComplianceReviewDetailResponse', () => {
  it('maps /compliance/{comId} response to review detail data', () => {
    const detail = normalizeComplianceReviewDetailResponse({
      comScore: 85,
      claims: [
        {
          claimsTitle: '우대금리 조건 미기재',
          claimsType: '허위·과장 광고',
          claimsAiVerified: '조건누락',
          claimsRiskLevel: 'HIGH',
          claimsAiSummary: '우대금리 조건이 광고 문구에 명시되지 않았습니다.',
          claimsOriginal: '최저 연 4.5%로 내 집 마련의 꿈을 이루세요.',
          claimsSuggested: '연 4.5%~8.2% (신용등급에 따라 상이)',
          claimsDisclaimer: '실제 적용 금리는 고객 신용등급에 따라 상이합니다.',
          claimsReason: '금리 표시 의무 위반',
          claimFiles: [
            {
              fileType: 'PRODUCT',
              fileId: 1,
              fileName: '상품설명서.pdf',
              fileUrl: 'http://localhost:8080/files/product.pdf',
              fileKind: '상품설명서',
              pageLocation: '1페이지',
              fileLocation: '1페이지 3번째 줄',
              section: '제1조',
              refNote: '우대금리 조건 관련 조항',
              facts: [
                {
                  factId: 1,
                  factType: 'RATE',
                  factTitle: '기본금리',
                  factValue: '3.5',
                  factUnit: '%',
                  factCondition: '급여이체 고객 한정',
                  factFileLocation: '1페이지 3번째 줄',
                  factPageLocation: '1페이지',
                  factSection: '제1조',
                  factNote: null,
                },
              ],
            },
            {
              fileType: 'RULE',
              fileId: 1,
              fileName: '금융광고심의규정.pdf',
              fileUrl: 'http://localhost:8080/files/rules/rule.pdf',
              fileKind: null,
              pageLocation: '3페이지',
              fileLocation: '3페이지 2번째 줄',
              section: '제7조',
              refNote: '최고 금리 표시 관련 조항',
              facts: [],
            },
          ],
          claimKeywords: [
            { keywordId: 1, keywordContent: '최고' },
          ],
          rules: [
            {
              ruleId: 1,
              ruleUniqueId: 'FIN-2024-001',
              ruleTitle: '우대금리 고지 의무',
              ruleRequired: '조건을 명시하세요.',
              ruleRiskLevel: 'HIGH',
              keywords: [
                { keywordId: 1, keywordContent: '최고' },
              ],
            },
          ],
        },
      ],
    })

    expect(detail.score).toBe(85)
    expect(detail.claims[0]).toMatchObject({
      claimId: 'CLM-001',
      statement: '우대금리 조건 미기재',
      type: '허위·과장 광고',
      verificationResult: '조건누락',
      riskLevel: 'HIGH',
      riskLabel: '높음',
      evidence: {
        aiSummary: '우대금리 조건이 광고 문구에 명시되지 않았습니다.',
        revision: {
          original: '최저 연 4.5%로 내 집 마련의 꿈을 이루세요.',
          suggested: '연 4.5%~8.2% (신용등급에 따라 상이)',
          additionalNotice: '실제 적용 금리는 고객 신용등급에 따라 상이합니다.',
          reason: '금리 표시 의무 위반',
        },
      },
    })
    expect(detail.claims[0]?.evidence.productTruth).toMatchObject({
      파일명: '상품설명서.pdf',
      '파일 유형': '상품설명서',
      '참조 비고': '우대금리 조건 관련 조항',
      기본금리: '3.5%',
    })
    expect(detail.claims[0]?.evidence.rule).toMatchObject({
      ruleId: 'FIN-2024-001',
      requiredItems: ['조건을 명시하세요.'],
      severity: 'HIGH',
      index: '금융광고심의규정.pdf',
      source: '우대금리 고지 의무',
    })
  })

  it('keeps nullable claim fields display-safe', () => {
    const detail = normalizeComplianceReviewDetailResponse({
      comScore: null,
      claims: [
        {
          claimsTitle: null,
          claimsType: null,
          claimsAiVerified: null,
          claimsRiskLevel: null,
          claimsAiSummary: '분석 요약',
          claimsOriginal: null,
          claimsSuggested: null,
          claimsDisclaimer: null,
          claimsReason: null,
          claimFiles: [],
          claimKeywords: [],
          rules: [],
        },
      ],
    })

    expect(detail.score).toBeNull()
    expect(detail.claims[0]?.statement).toBe('Claim 1')
    expect(detail.claims[0]?.riskLevel).toBeNull()
    expect(detail.claims[0]?.riskLabel).toBe('미정')
    expect(detail.claims[0]?.evidence.revision.reason).toBe('-')
  })
})

describe('fetchComplianceReviewDetail', () => {
  it('gets compliance review detail by compliance id', async () => {
    const calls: Array<{ url: string | URL | Request; init?: RequestInit }> = []
    const fetcher: typeof fetch = async (url, init) => {
      calls.push({ url, init })

      return new Response(JSON.stringify({
        comScore: 85,
        claims: [
          {
            claimsTitle: '우대금리 조건 미기재',
            claimsType: '허위·과장 광고',
            claimsAiVerified: '조건누락',
            claimsRiskLevel: 'HIGH',
            claimsAiSummary: '우대금리 조건이 광고 문구에 명시되지 않았습니다.',
            claimsOriginal: '최저 연 4.5%로 내 집 마련의 꿈을 이루세요.',
            claimsSuggested: '연 4.5%~8.2% (신용등급에 따라 상이)',
            claimsDisclaimer: '실제 적용 금리는 고객 신용등급에 따라 상이합니다.',
            claimsReason: '금리 표시 의무 위반',
            claimFiles: [
              {
                fileType: 'PRODUCT',
                fileId: 1,
                fileName: '상품설명서.pdf',
                fileUrl: 'http://localhost:8080/files/product.pdf',
                fileKind: '상품설명서',
                pageLocation: '1페이지',
                fileLocation: '1페이지 3번째 줄',
                section: '제1조',
                refNote: '우대금리 조건 관련 조항',
                facts: [],
              },
            ],
            claimKeywords: [
              { keywordId: 1, keywordContent: '최고' },
            ],
            rules: [],
          },
        ],
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const detail = await fetchComplianceReviewDetail(1, fetcher)

    expect(calls[0].url).toBe('/api/compliance/1')
    expect(calls[0].init).toBeUndefined()
    expect(detail.score).toBe(85)
    expect(detail.claims[0]?.statement).toBe('우대금리 조건 미기재')
  })
})

describe('processComplianceReview', () => {
  it('patches the final compliance review decision', async () => {
    const calls: Array<{ url: string | URL | Request; init?: RequestInit }> = []
    const fetcher: typeof fetch = async (url, init) => {
      calls.push({ url, init })

      return new Response(null, { status: 204 })
    }

    await processComplianceReview(1, {
      userId: 2,
      comReviewComments: '우대금리 조건 문구 추가 후 재신청 요망',
      comStatus: 'REJECTED',
    }, fetcher)

    expect(calls[0].url).toBe('/api/compliance/1/process')
    expect(calls[0].init?.method).toBe('PATCH')
    expect(calls[0].init?.headers).toEqual({ 'Content-Type': 'application/json' })
    expect(calls[0].init?.body).toBe(JSON.stringify({
      userId: 2,
      comReviewComments: '우대금리 조건 문구 추가 후 재신청 요망',
      comStatus: 'REJECTED',
    }))
  })
})
