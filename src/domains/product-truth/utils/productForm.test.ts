import { describe, expect, it } from 'vitest'
import { applyProductAiAnalysisResult, createInitialProductForm, emptyFact, statusFromFact } from './productForm'
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

describe('emptyFact', () => {
  it('does not add Product Fact effective date fields', () => {
    const form = createInitialProductForm()
    form.effectiveStartDate = '2026.06.01'
    form.effectiveEndDate = '2026.12.31'

    const fact = emptyFact(form)

    expect(fact).not.toHaveProperty('effectiveStartDate')
    expect(fact).not.toHaveProperty('effectiveEndDate')
  })

  it('does not add a separate Product Fact unit field', () => {
    const form = createInitialProductForm()

    const fact = emptyFact(form)

    expect(fact).not.toHaveProperty('unit')
  })
})

describe('statusFromFact', () => {
  it('does not require a separate unit value', () => {
    expect(statusFromFact({
      factId: 'PF-001',
      factType: 'RATE',
      factName: 'Base rate',
      value: '3.5%',
      sourceDocumentId: 'DOC-001',
      sourceLocator: 'page 1',
      inputStatus: 'MISSING_REQUIRED',
    })).toBe('COMPLETE')
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
              factFileLocation: 'line 9',
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
      displayValue: '3.5',
      condition: '급여이체 고객 한정',
      sourceDocumentId: 'DOC-001',
      sourceLocator: '1페이지 line 9',
      page: '1페이지',
      section: '제1조',
      inputStatus: 'COMPLETE',
    })
    expect(nextForm.productFacts[0]).not.toHaveProperty('unit')
    expect(nextForm.productFacts[0]).not.toHaveProperty('effectiveStartDate')
    expect(nextForm.productFacts[0]).not.toHaveProperty('effectiveEndDate')
  })

  it('keeps server factType values without filtering them', () => {
    const form = createInitialProductForm()
    const uploadedFile = new File(['product'], 'server-product.pdf', { type: 'application/pdf' })
    const result: ProductAiAnalyzeResponse = {
      productName: 'Product',
      productCode: 'P-001',
      productCategory: 'Deposit',
      productIntroduce: 'Intro',
      files: [
        {
          fileIndex: 0,
          fileType: 'PRODUCT_DESCRIPTION',
          fileContent: 'content',
          fileNote: 'v1',
          facts: [
            {
              factType: 'SERVER_FACT_CODE',
              factTitle: 'Server Fact',
              factValue: '1',
              factUnit: '%',
              factCondition: null,
              factFileLocation: 'p1',
              factPageLocation: null,
              factSection: null,
              factNote: null,
            },
          ],
        },
      ],
    }

    const nextForm = applyProductAiAnalysisResult(form, [uploadedFile], result)

    expect(nextForm.productFacts[0]?.factType).toBe('SERVER_FACT_CODE')
  })

  it('keeps the current product category when ai analysis returns an unsupported category', () => {
    const form = createInitialProductForm()
    form.category = '예금'
    form.subCategory = '예금'
    const uploadedFile = new File(['product'], 'server-product.pdf', { type: 'application/pdf' })
    const result: ProductAiAnalyzeResponse = {
      productName: 'Product',
      productCode: 'P-001',
      productCategory: '펀드',
      productIntroduce: 'Intro',
      files: [
        {
          fileIndex: 0,
          fileType: 'PRODUCT_DESCRIPTION',
          fileContent: 'content',
          fileNote: 'v1',
          facts: [],
        },
      ],
    }

    const nextForm = applyProductAiAnalysisResult(form, [uploadedFile], result)

    expect(nextForm.category).toBe('예금')
    expect(nextForm.subCategory).toBe('예금')
  })
})
