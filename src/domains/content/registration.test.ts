import { describe, expect, it } from 'vitest'
import { createContentRegisterRequest } from './registration'

describe('createContentRegisterRequest', () => {
  it('maps the content registration form to the compliance register API request', () => {
    expect(createContentRegisterRequest({
      title: '여름 적금 이벤트 앱푸시',
      originalText: '지금 가입하면 최고 연 5% 금리!',
      productCategory: '적금',
      productId: 1,
      urgency: '긴급',
      channels: ['App Push'],
      plannedPublishDate: '2024-08-01',
    }, 1)).toEqual({
      userId: 1,
      productId: 1,
      title: '여름 적금 이벤트 앱푸시',
      content: '지금 가입하면 최고 연 5% 금리!',
      channel: '앱푸시',
      urgency: '긴급',
      releaseAt: '2024-08-01T09:00:00',
    })
  })
})
