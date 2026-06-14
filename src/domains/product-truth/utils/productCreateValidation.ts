import type { ProductFact, ProductStatus, SourceDocument } from '../../../types'

export type ProductCreateForm = {
  productName: string
  productCode: string
  category: string
  subCategory: string
  ownerDepartment: string
  productOwner: string
  complianceOwner: string
  description: string
  versionLabel: string
  baseDate: string
  effectiveStartDate: string
  effectiveEndDate: string
  changeReason: string
  sourceDocuments: SourceDocument[]
  productFacts: ProductFact[]
}

export type ValidationResult = {
  ok: boolean
  errors: string[]
}

const normalizeDate = (value: string) => value.trim().replaceAll('.', '-')

const isBlank = (value: string | undefined) => !value?.trim()

export function determineProductStatus(
  effectiveStartDate: string,
  today = new Date().toISOString().slice(0, 10),
): ProductStatus {
  return normalizeDate(effectiveStartDate) <= normalizeDate(today) ? 'ACTIVE' : 'SCHEDULED'
}

export function validateProductCreate(form: ProductCreateForm): ValidationResult {
  const errors: string[] = []

  const requiredFields: Array<[string, string]> = [
    [form.productName, '상품명을 입력해 주세요.'],
    [form.productCode, '상품 코드를 입력해 주세요.'],
    [form.subCategory || form.category, '상품군을 선택해 주세요.'],
    [form.description, '상품 설명을 입력해 주세요.'],
  ]

  requiredFields.forEach(([value, message]) => {
    if (isBlank(value)) {
      errors.push(message)
    }
  })

  form.sourceDocuments.forEach((document) => {
    if (isBlank(document.documentType)) {
      errors.push('근거 문서의 문서 유형을 입력해 주세요.')
    }
  })

  return {
    ok: errors.length === 0,
    errors: [...new Set(errors)],
  }
}
