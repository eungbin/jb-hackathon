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
    [form.category, '상품 대분류를 입력해 주세요.'],
    [form.subCategory, '상품 중분류를 입력해 주세요.'],
    [form.ownerDepartment, '담당 부서를 입력해 주세요.'],
    [form.productOwner, '상품 담당자를 입력해 주세요.'],
    [form.versionLabel, '버전명을 입력해 주세요.'],
    [form.baseDate, '기준일을 입력해 주세요.'],
    [form.effectiveStartDate, '적용 시작일을 입력해 주세요.'],
    [form.changeReason, '변경 사유를 입력해 주세요.'],
  ]

  requiredFields.forEach(([value, message]) => {
    if (isBlank(value)) {
      errors.push(message)
    }
  })

  if (form.sourceDocuments.length === 0) {
    errors.push('근거 문서를 1개 이상 등록해 주세요.')
  }

  form.sourceDocuments.forEach((document) => {
    if (isBlank(document.documentType)) {
      errors.push('근거 문서의 문서 유형을 입력해 주세요.')
    }
    if (isBlank(document.version)) {
      errors.push('근거 문서의 버전을 입력해 주세요.')
    }
    if (isBlank(document.effectiveStartDate)) {
      errors.push('근거 문서의 적용 시작일을 입력해 주세요.')
    }
  })

  if (form.productFacts.length === 0) {
    errors.push('Product Fact를 1개 이상 등록해 주세요.')
  }

  form.productFacts.forEach((fact) => {
    if (isBlank(fact.factType)) {
      errors.push('Product Fact의 Fact Type을 입력해 주세요.')
    }
    if (isBlank(fact.factName)) {
      errors.push('Product Fact명을 입력해 주세요.')
    }
    if (isBlank(fact.value)) {
      errors.push('Product Fact의 Value를 입력해 주세요.')
    }
    if (isBlank(fact.unit)) {
      errors.push('Product Fact의 Unit을 입력해 주세요.')
    }
    if (isBlank(fact.sourceDocumentId)) {
      errors.push('Product Fact의 근거 문서를 선택해 주세요.')
    }
    if (isBlank(fact.sourceLocator)) {
      errors.push('Product Fact의 Source Locator를 입력해 주세요.')
    }
    if (isBlank(fact.effectiveStartDate)) {
      errors.push('Product Fact의 적용 시작일을 입력해 주세요.')
    }
  })

  return {
    ok: errors.length === 0,
    errors: [...new Set(errors)],
  }
}
