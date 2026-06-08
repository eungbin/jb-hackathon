import { describe, expect, it } from 'vitest'
import { normalizeDashboardMainResponse } from './api'

describe('normalizeDashboardMainResponse', () => {
  it('maps /user/main response to dashboard view data', () => {
    const data = normalizeDashboardMainResponse({
      comStatusCounts: {
        PENDING: 3,
        AI_FAILED: 0,
        CONDITIONALLY_APPROVED: 1,
        REJECTED: 0,
        APPROVED: 2,
      },
      complianceList: [
        {
          comId: 1,
          comTitle: '여름 적금 이벤트 앱푸시',
          productCategory: '적금',
          riskLevel: 'HIGH',
          comUrgency: '긴급',
          comReleaseAt: '2024-08-01T09:00:00',
          comRegistAt: '2024-07-20T14:30:00',
        },
      ],
      riskLevelCounts: {
        LOW: 2,
        MEDIUM: 5,
        HIGH: 3,
        CRITICAL: 0,
      },
      learningStatusCounts: {
        PENDING: 2,
        REJECT: 0,
        APPROVED: 1,
      },
      topClaimsTypes: [
        { claimsType: '허위·과장 광고', count: 7 },
        { claimsType: '중요 조건 누락', count: 3 },
      ],
    })

    expect(data.comStatusCounts.pending).toBe(3)
    expect(data.comStatusCounts.aiFailed).toBe(0)
    expect(data.comStatusCounts.conditionallyApproved).toBe(1)
    expect(data.comStatusCounts.rejected).toBe(0)
    expect(data.comStatusCounts.approved).toBe(2)
    expect(data.priorityRows[0]).toEqual({
      comId: 1,
      title: '여름 적금 이벤트 앱푸시',
      productCategory: '적금',
      riskLevel: 'HIGH',
      urgency: '긴급',
      submittedAt: '2024.07.20 14:30',
      plannedPublishDate: '2024.08.01',
    })
    expect(data.riskDistribution.total).toBe(10)
    expect(data.riskDistribution.high).toBe(30)
    expect(data.learning.approvalPending).toBe(2)
    expect(data.learning.rejected).toBe(0)
    expect(data.learning.approved).toBe(1)
    expect(data.topClaimTypes).toEqual([
      { rank: '01', name: '허위·과장 광고', count: 7, width: '100%' },
      { rank: '02', name: '중요 조건 누락', count: 3, width: '43%' },
    ])
  })

  it('defaults missing nullable dashboard fields without crashing the view', () => {
    const data = normalizeDashboardMainResponse({
      comStatusCounts: {},
      complianceList: [
        {
          comId: 2,
          comTitle: '날짜 미정 콘텐츠',
          productCategory: '대출',
          riskLevel: null,
          comUrgency: null,
          comReleaseAt: null,
          comRegistAt: 'bad-date',
        },
      ],
      riskLevelCounts: {},
      learningStatusCounts: {},
      topClaimsTypes: [],
    })

    expect(data.comStatusCounts.pending).toBe(0)
    expect(data.priorityRows[0].riskLevel).toBeNull()
    expect(data.priorityRows[0].urgency).toBe('-')
    expect(data.priorityRows[0].submittedAt).toBe('bad-date')
    expect(data.priorityRows[0].plannedPublishDate).toBe('-')
    expect(data.riskDistribution.total).toBe(0)
    expect(data.topClaimTypes).toEqual([])
  })
})
