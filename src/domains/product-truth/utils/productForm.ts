import type { InputStatus, ProductDocumentType, ProductFact, SourceDocument } from '../../../types'
import { documentTypeLabels } from '../../../utils/labels'
import type { ProductAiAnalyzeResponse } from '../api'
import type { ProductCreateForm } from './productCreateValidation'

export const productGroupOptions = ['예금', '적금', '대출'] as const

export const statusFromDocument = (document: SourceDocument): InputStatus =>
  document.documentType ? 'COMPLETE' : 'MISSING_REQUIRED'

export const statusFromFact = (fact: ProductFact): InputStatus =>
  fact.factType && fact.factName && fact.value && fact.sourceDocumentId && fact.sourceLocator
    ? 'COMPLETE'
    : 'MISSING_REQUIRED'

export function createInitialProductForm(): ProductCreateForm {
  return {
    productName: '',
    productCode: '',
    category: '',
    subCategory: '',
    ownerDepartment: '',
    productOwner: '',
    complianceOwner: '',
    description: '',
    versionLabel: '',
    baseDate: '',
    effectiveStartDate: '',
    effectiveEndDate: '',
    changeReason: '',
    sourceDocuments: [],
    productFacts: [],
  }
}

export const emptyFact = (form: ProductCreateForm): ProductFact => ({
  factId: `PF-${String(form.productFacts.length + 1).padStart(3, '0')}`,
  factType: '',
  factName: '',
  productName: form.productName,
  productCode: form.productCode,
  productTruthVersion: form.versionLabel,
  value: '',
  displayValue: '',
  condition: '',
  sourceDocumentId: form.sourceDocuments[0]?.documentId ?? '',
  sourceLocator: '',
  documentType: '',
  documentVersion: '',
  page: '',
  section: '',
  sourceMemo: '',
  inputStatus: 'MISSING_REQUIRED',
})

const documentTypeOptions: ProductDocumentType[] = ['PRODUCT_DESCRIPTION', 'TERMS', 'RATE_TABLE', 'FEE_TABLE', 'DISCLOSURE_GUIDE', 'OTHER']

function valueOrCurrent(nextValue: string | null | undefined, currentValue: string) {
  return nextValue?.trim() || currentValue
}

function productGroupOrCurrent(nextValue: string | null | undefined, currentValue: string) {
  const nextProductGroup = nextValue?.trim()

  if (!nextProductGroup) {
    return currentValue
  }

  return productGroupOptions.includes(nextProductGroup as (typeof productGroupOptions)[number])
    ? nextProductGroup
    : currentValue
}

function toDocumentType(value: string | null | undefined): ProductDocumentType | '' {
  if (!value) {
    return ''
  }

  if (documentTypeOptions.includes(value as ProductDocumentType)) {
    return value as ProductDocumentType
  }

  return documentTypeOptions.find((type) => documentTypeLabels[type] === value) ?? ''
}

function findAnalysisFile(result: ProductAiAnalyzeResponse, fileIndex: number) {
  return result.files?.find((file) => file.fileIndex === fileIndex) ?? null
}

function formatFileLocation(value: string | null | undefined) {
  const lineMatch = value?.trim().match(/^line\s+(.+)$/i)

  return lineMatch ? `${lineMatch[1].trim()}번째 줄` : value
}

function buildSourceLocator(pageLocation: string | null | undefined, fileLocation: string | null | undefined) {
  return [pageLocation, formatFileLocation(fileLocation)].filter(Boolean).join('\n')
}

export function applyProductAiAnalysisResult(
  form: ProductCreateForm,
  files: File[],
  result: ProductAiAnalyzeResponse,
): ProductCreateForm {
  const sourceDocuments = files.map((file, index) => {
    const analysisFile = findAnalysisFile(result, index)
    const document: SourceDocument = {
      documentId: `DOC-${String(index + 1).padStart(3, '0')}`,
      fileName: file.name,
      documentType: toDocumentType(analysisFile?.fileType),
      version: analysisFile?.fileNote?.trim() || form.sourceDocuments[index]?.version || 'AI 분석본',
      effectiveStartDate: form.effectiveStartDate,
      description: analysisFile?.fileContent ?? '',
      note: analysisFile?.fileNote ?? '',
      inputStatus: 'MISSING_REQUIRED',
    }

    return {
      ...document,
      inputStatus: statusFromDocument(document),
    }
  })
  const productFacts = files.flatMap((_, fileIndex) => {
    const document = sourceDocuments[fileIndex]
    const analysisFile = findAnalysisFile(result, fileIndex)

    return (analysisFile?.facts ?? []).map((fact, factIndex): ProductFact => {
      const nextFact: ProductFact = {
        factId: `PF-${String(productFactsCountBefore(result, fileIndex) + factIndex + 1).padStart(3, '0')}`,
        factType: fact.factType ?? '',
        factName: fact.factTitle ?? '',
        productName: valueOrCurrent(result.productName, form.productName),
        productCode: valueOrCurrent(result.productCode, form.productCode),
        productTruthVersion: form.versionLabel,
        value: fact.factValue ?? '',
        displayValue: fact.factValue ?? '',
        condition: fact.factCondition ?? '',
        sourceDocumentId: document?.documentId ?? '',
        sourceLocator: buildSourceLocator(fact.factPageLocation, fact.factFileLocation),
        documentType: document?.documentType ?? '',
        documentVersion: document?.version ?? '',
        page: fact.factPageLocation ?? '',
        section: fact.factSection ?? '',
        sourceMemo: fact.factNote ?? '',
        inputStatus: 'MISSING_REQUIRED',
      }

      return {
        ...nextFact,
        inputStatus: statusFromFact(nextFact),
      }
    })
  })

  return {
    ...form,
    productName: valueOrCurrent(result.productName, form.productName),
    productCode: valueOrCurrent(result.productCode, form.productCode),
    category: productGroupOrCurrent(result.productCategory, form.category),
    subCategory: productGroupOrCurrent(result.productCategory, form.subCategory),
    description: valueOrCurrent(result.productIntroduce, form.description),
    sourceDocuments,
    productFacts,
  }
}

function productFactsCountBefore(result: ProductAiAnalyzeResponse, fileIndex: number) {
  return (result.files ?? [])
    .filter((file) => file.fileIndex < fileIndex)
    .reduce((count, file) => count + file.facts.length, 0)
}
