export type ContentRegisterRequest = {
  userId: number
  productId: number
  title: string
  content: string
  channel: string
  urgency: string
  releaseAt: string
}

export type ProductInfo = {
  productId: number
  productName: string
  productCode: string
  productCategory: string
}

const complianceRegisterPath = '/compliance/register'
const productInfoPath = '/product/info'

function isComplianceRegisterResponse(value: unknown): value is number {
  return typeof value === 'number'
}

function isProductInfo(value: unknown): value is ProductInfo {
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

export async function registerContent(request: ContentRegisterRequest, fetcher: typeof fetch = fetch) {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '/api'
  const response = await fetcher(`${apiBaseUrl}${complianceRegisterPath}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`Content registration API request failed: ${response.status}`)
  }

  const comId: unknown = await response.json()

  if (!isComplianceRegisterResponse(comId)) {
    throw new Error('Content registration API response is invalid')
  }

  return comId
}

export async function fetchProductInfo(fetcher: typeof fetch = fetch) {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '/api'
  const response = await fetcher(`${apiBaseUrl}${productInfoPath}`)

  if (!response.ok) {
    throw new Error(`Product info API request failed: ${response.status}`)
  }

  const products: unknown = await response.json()

  if (!Array.isArray(products) || !products.every(isProductInfo)) {
    throw new Error('Product info API response is invalid')
  }

  return products
}
