import { documentTypeLabels } from '../../utils/labels'
import type { ProductCreateForm } from './utils/productCreateValidation'

export type ProductListResponse = Array<{
  productId: number
  productName: string
  productCode: string
  productCategory: string
  productIntroduce: string
  productDate: string
  facts: Array<{
    factId: number
    factType: string | null
    factTitle: string | null
    factValue: string | null
    factUnit: string | null
    factCondition: string | null
    factFileLocation: string | null
    factPageLocation: string | null
    factSection: string | null
    factNote: string | null
    fileName: string | null
    fileType: string | null
  }>
}>

export type ProductTruthFact = {
  factId: number
  factName: string
  factType: string
  valueData: string
  condition: string
  sourceLocator: string
  note: string
  sourceFile: string
}

export type ProductTruthProduct = {
  productId: number
  productName: string
  productCode: string
  productCategory: string
  productIntroduce: string
  productDate: string
  facts: ProductTruthFact[]
}

export type ProductCreateRequest = {
  userId: number
  productName: string
  productCode: string
  productCategory: string
  productIntroduce: string
  files: Array<{
    fileType: string
    fileContent: string | null
    facts: Array<{
      factType: string | null
      factTitle: string | null
      factValue: string | null
      factCondition: string | null
      factFileLocation: string | null
    }>
  }>
}

export type ProductAiAnalyzeResponse = {
  productName: string | null
  productCode: string | null
  productCategory: string | null
  productIntroduce: string | null
  files: Array<{
    fileIndex: number
    fileType: string | null
    fileContent: string | null
    fileNote: string | null
    facts: Array<{
      factType: string | null
      factTitle: string | null
      factValue: string | null
      factUnit: string | null
      factCondition: string | null
      factFileLocation: string | null
      factPageLocation: string | null
      factSection: string | null
      factNote: string | null
    }>
  }> | null
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string'
}

function isProductFact(value: unknown): value is ProductListResponse[number]['facts'][number] {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.factId === 'number'
    && isNullableString(candidate.factType)
    && isNullableString(candidate.factTitle)
    && isNullableString(candidate.factValue)
    && isNullableString(candidate.factUnit)
    && isNullableString(candidate.factCondition)
    && isNullableString(candidate.factFileLocation)
    && isNullableString(candidate.factPageLocation)
    && isNullableString(candidate.factSection)
    && isNullableString(candidate.factNote)
    && isNullableString(candidate.fileName)
    && isNullableString(candidate.fileType)
  )
}

function isProductListItem(value: unknown): value is ProductListResponse[number] {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.productId === 'number'
    && typeof candidate.productName === 'string'
    && typeof candidate.productCode === 'string'
    && typeof candidate.productCategory === 'string'
    && typeof candidate.productIntroduce === 'string'
    && typeof candidate.productDate === 'string'
    && Array.isArray(candidate.facts)
    && candidate.facts.every(isProductFact)
  )
}

function isAiAnalyzeFact(value: unknown): value is NonNullable<ProductAiAnalyzeResponse['files']>[number]['facts'][number] {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    isNullableString(candidate.factType)
    && isNullableString(candidate.factTitle)
    && isNullableString(candidate.factValue)
    && isNullableString(candidate.factUnit)
    && isNullableString(candidate.factCondition)
    && isNullableString(candidate.factFileLocation)
    && isNullableString(candidate.factPageLocation)
    && isNullableString(candidate.factSection)
    && isNullableString(candidate.factNote)
  )
}

function isAiAnalyzeFile(value: unknown): value is NonNullable<ProductAiAnalyzeResponse['files']>[number] {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.fileIndex === 'number'
    && isNullableString(candidate.fileType)
    && isNullableString(candidate.fileContent)
    && isNullableString(candidate.fileNote)
    && Array.isArray(candidate.facts)
    && candidate.facts.every(isAiAnalyzeFact)
  )
}

function isAiAnalyzeResponse(value: unknown): value is ProductAiAnalyzeResponse {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    isNullableString(candidate.productName)
    && isNullableString(candidate.productCode)
    && isNullableString(candidate.productCategory)
    && isNullableString(candidate.productIntroduce)
    && (candidate.files === null || (Array.isArray(candidate.files) && candidate.files.every(isAiAnalyzeFile)))
  )
}

function formatIsoDateTime(value: string) {
  const [datePart, timePart = ''] = value.split('T')

  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return value
  }

  const date = datePart.replaceAll('-', '.')
  const time = timePart.slice(0, 5)

  return time ? `${date} ${time}` : date
}

function display(value: string | null | undefined) {
  return value?.trim() || '-'
}

function buildValueData(fact: ProductListResponse[number]['facts'][number]) {
  const value = display(fact.factValue)
  const unit = display(fact.factUnit)

  if (value === '-' && unit === '-') {
    return '-'
  }

  return `${value === '-' ? '' : value}${unit === '-' ? '' : unit}`
}

function buildSourceLocator(fact: ProductListResponse[number]['facts'][number]) {
  return [fact.factPageLocation, fact.factFileLocation].filter(Boolean).join(' ') || '-'
}

function buildSourceFile(fact: ProductListResponse[number]['facts'][number]) {
  return [fact.fileName, fact.fileType].filter(Boolean).join(' · ') || '-'
}

function buildProductCreateRequest(form: ProductCreateForm, files: File[], userId: number): ProductCreateRequest {
  return {
    userId,
    productName: form.productName,
    productCode: form.productCode,
    productCategory: form.subCategory || form.category,
    productIntroduce: form.description,
    files: files.map((_, index) => {
      const document = form.sourceDocuments[index]
      const documentFacts = document ? form.productFacts.filter((fact) => fact.sourceDocumentId === document.documentId) : []

      return {
        fileType: document?.documentType ? documentTypeLabels[document.documentType] : '',
        fileContent: document?.description?.trim() || null,
        facts: documentFacts.map((fact) => ({
          factType: fact.factType || null,
          factTitle: fact.factName || null,
          factValue: fact.value || null,
          factCondition: fact.condition?.trim() || null,
          factFileLocation: fact.sourceLocator || null,
        })),
      }
    }),
  }
}

function buildProductCreateFormData(form: ProductCreateForm, files: File[], userId: number) {
  const formData = new FormData()
  const request = buildProductCreateRequest(form, files, userId)

  formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }))
  files.forEach((file) => {
    formData.append('files', file)
  })

  return formData
}

export function normalizeProductListResponse(response: ProductListResponse): ProductTruthProduct[] {
  return response.map((product) => ({
    productId: product.productId,
    productName: product.productName,
    productCode: product.productCode,
    productCategory: product.productCategory,
    productIntroduce: product.productIntroduce,
    productDate: formatIsoDateTime(product.productDate),
    facts: product.facts.map((fact) => ({
      factId: fact.factId,
      factName: display(fact.factTitle) !== '-' ? display(fact.factTitle) : `Fact ${fact.factId}`,
      factType: display(fact.factType),
      valueData: buildValueData(fact),
      condition: display(fact.factCondition),
      sourceLocator: buildSourceLocator(fact),
      note: display(fact.factNote),
      sourceFile: buildSourceFile(fact),
    })),
  }))
}

export async function fetchProductTruthProducts(fetcher: typeof fetch = fetch) {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '/api'
  const response = await fetcher(`${apiBaseUrl}/product/list`)

  if (!response.ok) {
    throw new Error(`Product Truth API request failed: ${response.status}`)
  }

  const data: unknown = await response.json()

  if (!Array.isArray(data) || !data.every(isProductListItem)) {
    throw new Error('Product Truth API response is invalid')
  }

  return normalizeProductListResponse(data)
}

export async function createProduct(form: ProductCreateForm, files: File[], userId: number, fetcher: typeof fetch = fetch) {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '/api'
  const response = await fetcher(`${apiBaseUrl}/product/create`, {
    method: 'POST',
    body: buildProductCreateFormData(form, files, userId),
  })

  if (!response.ok) {
    throw new Error(`Product create API request failed: ${response.status}`)
  }

  const productId: unknown = await response.json()

  if (typeof productId !== 'number') {
    throw new Error('Product create API response is invalid')
  }

  return productId
}

export async function analyzeProductFiles(files: File[], fetcher: typeof fetch = fetch) {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '/api'
  const formData = new FormData()

  files.forEach((file) => {
    formData.append('files', file)
  })

  const response = await fetcher(`${apiBaseUrl}/product/ai-analyze`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Product AI analyze API request failed: ${response.status}`)
  }

  const data: unknown = await response.json()

  if (!isAiAnalyzeResponse(data)) {
    throw new Error('Product AI analyze API response is invalid')
  }

  return data
}
