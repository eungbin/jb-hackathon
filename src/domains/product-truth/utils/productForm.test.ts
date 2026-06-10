import { describe, expect, it } from 'vitest'
import { applyProductAiAnalysisResult, createInitialProductForm } from './productForm'
import type { ProductAiAnalyzeResponse } from '../api'

describe('createInitialProductForm', () => {
  it('starts with an empty product registration form', () => {
    const form = createInitialProductForm()

    expect(form).toMatchObject({
      productName: '',
      productCode: '',
      category: '',
      subCategory: '',
      description: '',
      sourceDocuments: [],
      productFacts: [],
    })
  })
})

describe('applyProductAiAnalysisResult', () => {
  it('fills product fields, source documents, and facts from ai analysis', () => {
    const form = createInitialProductForm()
    const uploadedFile = new File(['product'], '상품설명서.pdf', { type: 'application/pdf' })
    const result: ProductAiAnalyzeResponse = {
      productName: 'JB 첫 적금',
      productCode: 'PRD-2024-001',
      productCategory: '적금',
      productIntroduce: '신규 고객 전용 고금리 적금 상품입니다.',
      files: [
        {
          fileIndex: 0,
          fileType: '상품설명서',
          fileContent: 'JB 첫 적금의 상품설명서입니다.',
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
    }

    const nextForm = applyProductAiAnalysisResult(form, [uploadedFile], result)

    expect(nextForm).toMatchObject({
      productName: 'JB 첫 적금',
      productCode: 'PRD-2024-001',
      category: '적금',
      subCategory: '적금',
      description: '신규 고객 전용 고금리 적금 상품입니다.',
    })
    expect(nextForm.sourceDocuments[0]).toMatchObject({
      documentId: 'DOC-001',
      fileName: '상품설명서.pdf',
      documentType: 'PRODUCT_DESCRIPTION',
      version: '2024년 1월 개정본',
      description: 'JB 첫 적금의 상품설명서입니다.',
      note: '2024년 1월 개정본',
      inputStatus: 'COMPLETE',
    })
    expect(nextForm.productFacts[0]).toMatchObject({
      factId: 'PF-001',
      factType: 'RATE',
      factName: '기본금리',
      value: '3.5',
      unit: '%',
      condition: '급여이체 고객 한정',
      sourceDocumentId: 'DOC-001',
      sourceLocator: '1페이지 3번째 줄',
      page: '1페이지',
      section: '제1조',
      inputStatus: 'COMPLETE',
    })
  })
})
