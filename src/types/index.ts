export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type VerificationStatus =
  | 'SUPPORTED'
  | 'SUPPORTED_WITH_CONDITION_MISSING'
  | 'CONTRADICTED'
  | 'NOT_FOUND'
  | 'AMBIGUOUS'
  | 'NEEDS_DISCLOSURE'

export type ReviewDecision =
  | 'APPROVED'
  | 'CONDITIONALLY_APPROVED'
  | 'REVISION_REQUESTED'
  | 'REJECTED'
  | 'NEED_MORE_INFO'

export type LearningStatus =
  | 'CANDIDATE_RAW'
  | 'REDACTION_REQUIRED'
  | 'REDACTED'
  | 'LABEL_VALIDATION_PENDING'
  | 'APPROVED_FOR_EVAL'
  | 'APPROVED_FOR_TRAINING'
  | 'EXCLUDED'

export type ProductStatus = 'ACTIVE' | 'SCHEDULED' | 'INACTIVE'

export type ProductDocumentType =
  | 'PRODUCT_DESCRIPTION'
  | 'TERMS'
  | 'RATE_TABLE'
  | 'FEE_TABLE'
  | 'DISCLOSURE_GUIDE'
  | 'OTHER'

export type InputStatus = 'COMPLETE' | 'MISSING_REQUIRED'

export type SourceDocument = {
  documentId: string
  fileName: string
  documentType: ProductDocumentType | ''
  version: string
  effectiveStartDate: string
  description?: string
  note?: string
  inputStatus: InputStatus
}

export type ProductFact = {
  factId: string
  factType: string
  factName: string
  productName?: string
  productCode?: string
  productTruthVersion?: string
  value: string
  displayValue?: string
  condition?: string
  sourceDocumentId: string
  sourceLocator: string
  documentType?: ProductDocumentType | ''
  documentVersion?: string
  page?: string
  section?: string
  sourceMemo?: string
  inputStatus: InputStatus
}
