import { describe, expect, it } from 'vitest'
import { fetchProductInfo, registerContent } from './api'

describe('registerContent', () => {
  it('posts content registration data and returns the created compliance id', async () => {
    const calls: Array<{ url: string | URL | Request; init?: RequestInit }> = []
    const fetcher: typeof fetch = async (url, init) => {
      calls.push({ url, init })

      return new Response(JSON.stringify(12), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const comId = await registerContent(
      {
        userId: 1,
        productId: 1,
        title: '여름 적금 이벤트 앱푸시',
        content: '지금 가입하면 최고 연 5% 금리!',
        channel: '앱푸시',
        urgency: '긴급',
        releaseAt: '2024-08-01T09:00:00',
      },
      fetcher,
    )

    expect(calls[0].url).toBe('/api/compliance/register')
    expect(calls[0].init?.method).toBe('POST')
    expect(calls[0].init?.headers).toEqual({ 'Content-Type': 'application/json' })
    expect(calls[0].init?.body).toBe(JSON.stringify({
      userId: 1,
      productId: 1,
      title: '여름 적금 이벤트 앱푸시',
      content: '지금 가입하면 최고 연 5% 금리!',
      channel: '앱푸시',
      urgency: '긴급',
      releaseAt: '2024-08-01T09:00:00',
    }))
    expect(comId).toBe(12)
  })
})

describe('fetchProductInfo', () => {
  it('gets product options for content registration', async () => {
    const calls: Array<{ url: string | URL | Request; init?: RequestInit }> = []
    const fetcher: typeof fetch = async (url, init) => {
      calls.push({ url, init })

      return new Response(JSON.stringify([
        {
          productId: 1,
          productName: 'JB 첫 적금',
          productCode: 'PRD-2024-001',
          productCategory: '적금',
        },
      ]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const products = await fetchProductInfo(fetcher)

    expect(calls[0].url).toBe('/api/product/info')
    expect(calls[0].init).toBeUndefined()
    expect(products).toEqual([
      {
        productId: 1,
        productName: 'JB 첫 적금',
        productCode: 'PRD-2024-001',
        productCategory: '적금',
      },
    ])
  })
})
