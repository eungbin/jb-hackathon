import { productCreateSeed } from '../../../data/mockData'
import type { InputStatus, ProductFact, SourceDocument } from '../../../types'
import type { ProductCreateForm } from './productCreateValidation'

export const statusFromDocument = (document: SourceDocument): InputStatus =>
  document.documentType && document.version && document.effectiveStartDate ? 'COMPLETE' : 'MISSING_REQUIRED'

export const statusFromFact = (fact: ProductFact): InputStatus =>
  fact.factType && fact.factName && fact.value && fact.unit && fact.sourceDocumentId && fact.sourceLocator && fact.effectiveStartDate
    ? 'COMPLETE'
    : 'MISSING_REQUIRED'

export function createInitialProductForm(): ProductCreateForm {
  return {
    ...productCreateSeed.productBasicInfo,
    ...productCreateSeed.versionPeriod,
    sourceDocuments: productCreateSeed.sourceDocuments.map((document) => ({ ...document, description: '', note: '' })),
    productFacts: productCreateSeed.productFacts.map((fact) => ({
      ...fact,
      productName: productCreateSeed.productBasicInfo.productName,
      productCode: productCreateSeed.productBasicInfo.productCode,
      productTruthVersion: productCreateSeed.versionPeriod.versionLabel,
    })),
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
