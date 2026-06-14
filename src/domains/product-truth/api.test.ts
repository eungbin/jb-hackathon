import { describe, expect, it } from 'vitest'
import { createProduct, analyzeProductFiles, fetchProductTruthProducts, normalizeProductListResponse } from './api'
import type { ProductCreateForm } from './utils/productCreateValidation'

describe('normalizeProductListResponse', () => {
  it('maps /product/list response to Product Truth products', () => {
    const products = normalizeProductListResponse([
      {
        productId: 1,
        productName: 'JB 첫 적금',
        productCode: 'PRD-2024-001',
        productCategory: '적금',
        productIntroduce: '신규 고객 전용 고금리 적금',
        productDate: '2024-07-01T10:00:00',
        facts: [
          {
            factId: 1,
            factType: 'RATE',
            factTitle: '기본금리',
            factValue: '3.5',
            factUnit: '%',
            factCondition: '급여이체 고객 한정',
            factFileLocation: 'line 9',
            factPageLocation: '1페이지',
            factSection: '제1조',
            factNote: '2024년 1월 기준',
            fileName: '상품설명서.pdf',
            fileType: '상품설명서',
          },
        ],
      },
    ])

    expect(products).toEqual([
      {
        productId: 1,
        productName: 'JB 첫 적금',
        productCode: 'PRD-2024-001',
        productCategory: '적금',
        productIntroduce: '신규 고객 전용 고금리 적금',
        productDate: '2024.07.01 10:00',
        facts: [
          {
            factId: 1,
            factName: '기본금리',
            factType: 'RATE',
            valueData: '3.5%',
            condition: '급여이체 고객 한정',
            sourceLocator: '1페이지 line 9',
            note: '2024년 1월 기준',
            sourceFile: '상품설명서.pdf · 상품설명서',
          },
        ],
      },
    ])
  })

  it('keeps nullable fact fields displayable', () => {
    const products = normalizeProductListResponse([
      {
        productId: 2,
        productName: 'JB 대출',
        productCode: 'PRD-2024-002',
        productCategory: '대출',
        productIntroduce: '직장인 전용 대출',
        productDate: '2024-07-01T10:00:00',
        facts: [
          {
            factId: 2,
            factType: null,
            factTitle: null,
            factValue: null,
            factUnit: null,
            factCondition: null,
            factFileLocation: null,
            factPageLocation: null,
            factSection: null,
            factNote: null,
            fileName: null,
            fileType: null,
          },
        ],
      },
    ])

    expect(products[0]?.facts[0]).toMatchObject({
      factName: 'Fact 2',
      factType: '-',
      valueData: '-',
      condition: '-',
      sourceLocator: '-',
      note: '-',
      sourceFile: '-',
    })
  })
})

describe('fetchProductTruthProducts', () => {
  it('gets Product Truth products', async () => {
    const calls: Array<{ url: string | URL | Request; init?: RequestInit }> = []
    const fetcher: typeof fetch = async (url, init) => {
      calls.push({ url, init })

      return new Response(JSON.stringify([
        {
          productId: 1,
          productName: 'JB 첫 적금',
          productCode: 'PRD-2024-001',
          productCategory: '적금',
          productIntroduce: '신규 고객 전용 고금리 적금',
          productDate: '2024-07-01T10:00:00',
          facts: [],
        },
      ]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const products = await fetchProductTruthProducts(fetcher)

    expect(calls[0].url).toBe('/api/product/list')
    expect(calls[0].init).toBeUndefined()
    expect(products[0]?.productName).toBe('JB 첫 적금')
  })
})

const productCreateForm = (): ProductCreateForm => ({
  productName: 'JB 첫 적금',
  productCode: 'PRD-2024-001',
  category: '적금',
  subCategory: '적금',
  ownerDepartment: '상품팀',
  productOwner: '김상품',
  complianceOwner: '이준법',
  description: '신규 고객 전용 적금',
  versionLabel: 'v2024.07.01',
  baseDate: '2024.07.01',
  effectiveStartDate: '2024.07.01',
  effectiveEndDate: '',
  changeReason: '신규 상품 등록',
  sourceDocuments: [
    {
      documentId: 'DOC-001',
      fileName: '상품설명서.pdf',
      documentType: 'PRODUCT_DESCRIPTION',
      version: '2024년 1월 개정본',
      effectiveStartDate: '2024.07.01',
      description: '2024년 기준 상품설명서',
      inputStatus: 'COMPLETE',
    },
  ],
  productFacts: [
    {
      factId: 'PF-001',
      factType: 'RATE',
      factName: '기본금리',
      value: '3.5',
      condition: '급여이체 고객 한정',
      sourceDocumentId: 'DOC-001',
      sourceLocator: '1페이지 3번째 줄',
      inputStatus: 'COMPLETE',
    },
  ],
})

describe('createProduct', () => {
  it('posts multipart product request and files in matching order', async () => {
    const uploadedFile = new File(['product'], '상품설명서.pdf', { type: 'application/pdf' })
    const calls: Array<{ url: string | URL | Request; init?: RequestInit }> = []
    const fetcher: typeof fetch = async (url, init) => {
      calls.push({ url, init })
      const body = init?.body as FormData
      const requestPart = body.get('request') as Blob
      const request = JSON.parse(await requestPart.text())

      expect(request).toEqual({
        userId: 1,
        productName: 'JB 첫 적금',
        productCode: 'PRD-2024-001',
        productCategory: '적금',
        productIntroduce: '신규 고객 전용 적금',
        files: [
          {
            fileType: '상품설명서',
            fileContent: '2024년 기준 상품설명서',
            facts: [
              {
                factType: 'RATE',
                factTitle: '기본금리',
                factValue: '3.5',
                factCondition: '급여이체 고객 한정',
                factFileLocation: '1페이지 3번째 줄',
              },
            ],
          },
        ],
      })
      expect(body.getAll('files')).toEqual([uploadedFile])

      return new Response(JSON.stringify(1), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const productId = await createProduct(productCreateForm(), [uploadedFile], 1, fetcher)

    expect(calls[0].url).toBe('/api/product/create')
    expect(calls[0].init?.method).toBe('POST')
    expect(calls[0].init?.headers).toBeUndefined()
    expect(productId).toBe(1)
  })
})

describe('analyzeProductFiles', () => {
  it('posts files to the product ai analyze API', async () => {
    const uploadedFile = new File(['product'], '상품설명서.pdf', { type: 'application/pdf' })
    const calls: Array<{ url: string | URL | Request; init?: RequestInit }> = []
    const fetcher: typeof fetch = async (url, init) => {
      calls.push({ url, init })
      const body = init?.body as FormData

      expect(body.getAll('files')).toEqual([uploadedFile])

      return new Response(JSON.stringify({
        productName: 'JB 첫 적금',
        productCode: 'PRD-2024-001',
        productCategory: '적금',
        productIntroduce: '신규 고객 전용 고금리 적금 상품입니다.',
        files: [
          {
            fileIndex: 0,
            fileType: '상품설명서',
            fileContent: 'JB 첫 적금 상품설명서입니다.',
            fileNote: '2024년 1월 개정본',
            facts: [
              {
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
        ],
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const result = await analyzeProductFiles([uploadedFile], fetcher)

    expect(calls[0].url).toBe('/api/product/ai-analyze')
    expect(calls[0].init?.method).toBe('POST')
    expect(calls[0].init?.headers).toBeUndefined()
    expect(result.productName).toBe('JB 첫 적금')
    expect(result.files?.[0]?.facts[0]?.factFileLocation).toBe('1페이지 3번째 줄')
  })
})
