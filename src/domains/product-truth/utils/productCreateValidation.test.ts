import { describe, expect, it } from 'vitest'
import type { ProductCreateForm } from './productCreateValidation'
import { determineProductStatus, validateProductCreate } from './productCreateValidation'

const validForm = (): ProductCreateForm => ({
  productName: 'JB 청년우대 적금',
  productCode: 'DEP-SAV-001',
  category: '수신',
  subCategory: '적립식 예금',
  ownerDepartment: '수신상품팀',
  productOwner: '김상품',
  complianceOwner: '이준법',
  description: '청년층 우대 상품',
  versionLabel: 'v2026.06.01',
  baseDate: '2026.06.01',
  effectiveStartDate: '2026.06.01',
  effectiveEndDate: '',
  changeReason: '신규 상품 출시',
  sourceDocuments: [
    {
      documentId: 'DOC-001',
      documentType: 'PRODUCT_DESCRIPTION',
      fileName: '상품설명서.pdf',
      version: '1.0',
      effectiveStartDate: '2026.06.01',
      inputStatus: 'COMPLETE',
    },
  ],
  productFacts: [
    {
      factId: 'PF-001',
      factType: 'RATE',
      factName: '최고 금리',
      value: '7.0',
      sourceDocumentId: 'DOC-001',
      sourceLocator: '상품설명서 p.3',
      inputStatus: 'COMPLETE',
    },
  ],
})

describe('validateProductCreate', () => {
  it('API 필수 상품 정보가 비어 있으면 오류를 반환한다', () => {
    const form = validForm()
    form.productName = ''
    form.productCode = ''
    form.category = ''
    form.subCategory = ''
    form.description = ''

    const result = validateProductCreate(form)

    expect(result.ok).toBe(false)
    expect(result.errors).toContain('상품명을 입력해 주세요.')
    expect(result.errors).toContain('상품 코드를 입력해 주세요.')
    expect(result.errors).toContain('상품군을 선택해 주세요.')
    expect(result.errors).toContain('상품 설명을 입력해 주세요.')
  })

  it('근거 문서와 Product Fact가 없어도 상품 기본정보만 있으면 등록 가능하다', () => {
    const form = {
      ...validForm(),
      sourceDocuments: [],
      productFacts: [],
    }

    const result = validateProductCreate(form)

    expect(result).toEqual({ ok: true, errors: [] })
  })
})

describe('determineProductStatus', () => {
  it('적용 시작일이 오늘 이전이면 ACTIVE를 반환한다', () => {
    expect(determineProductStatus('2026.06.01', '2026-06-03')).toBe('ACTIVE')
  })

  it('적용 시작일이 미래이면 SCHEDULED를 반환한다', () => {
    expect(determineProductStatus('2026.06.10', '2026-06-03')).toBe('SCHEDULED')
  })
})
