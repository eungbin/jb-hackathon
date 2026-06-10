import type { InputStatus, ProductDocumentType, ProductFact, ProductFactType, SourceDocument } from '../../../types'
import { documentTypeLabels } from '../../../utils/labels'
import type { ProductAiAnalyzeResponse } from '../api'
import type { ProductCreateForm } from './productCreateValidation'

export const statusFromDocument = (document: SourceDocument): InputStatus =>
  document.documentType ? 'COMPLETE' : 'MISSING_REQUIRED'

export const statusFromFact = (fact: ProductFact): InputStatus =>
  fact.factType && fact.factName && fact.value && fact.unit && fact.sourceDocumentId && fact.sourceLocator
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
  unit: '',
  displayValue: '',
  condition: '',
  sourceDocumentId: form.sourceDocuments[0]?.documentId ?? '',
  sourceLocator: '',
  documentType: '',
  documentVersion: '',
  page: '',
  section: '',
  effectiveStartDate: form.effectiveStartDate,
  effectiveEndDate: '',
  sourceMemo: '',
  inputStatus: 'MISSING_REQUIRED',
})

const documentTypeOptions: ProductDocumentType[] = ['PRODUCT_DESCRIPTION', 'TERMS', 'RATE_TABLE', 'FEE_TABLE', 'DISCLOSURE_GUIDE', 'OTHER']
const factTypeOptions: ProductFactType[] = ['RATE', 'ELIGIBILITY', 'LIMIT', 'FEE', 'TERM', 'BENEFIT', 'RISK_NOTICE', 'CHANNEL', 'OTHER']

function valueOrCurrent(nextValue: string | null | undefined, currentValue: string) {
  return nextValue?.trim() || currentValue
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

function toFactType(value: string | null | undefined): ProductFactType | '' {
  return factTypeOptions.includes(value as ProductFactType) ? value as ProductFactType : ''
}

function findAnalysisFile(result: ProductAiAnalyzeResponse, fileIndex: number) {
  return result.files?.find((file) => file.fileIndex === fileIndex) ?? null
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
        factType: toFactType(fact.factType),
        factName: fact.factTitle ?? '',
        productName: valueOrCurrent(result.productName, form.productName),
        productCode: valueOrCurrent(result.productCode, form.productCode),
        productTruthVersion: form.versionLabel,
        value: fact.factValue ?? '',
        unit: fact.factUnit ?? '',
        displayValue: [fact.factValue, fact.factUnit].filter(Boolean).join(''),
        condition: fact.factCondition ?? '',
        sourceDocumentId: document?.documentId ?? '',
        sourceLocator: fact.factFileLocation ?? '',
        documentType: document?.documentType ?? '',
        documentVersion: document?.version ?? '',
        page: fact.factPageLocation ?? '',
        section: fact.factSection ?? '',
        effectiveStartDate: form.effectiveStartDate,
        effectiveEndDate: form.effectiveEndDate,
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
    category: valueOrCurrent(result.productCategory, form.category),
    subCategory: valueOrCurrent(result.productCategory, form.subCategory),
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
