export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type VerificationStatus =
  | 'SUPPORTED'
  | 'SUPPORTED_WITH_CONDITION_MISSING'
  | 'CONTRADICTED'
  | 'NOT_FOUND'
  | 'AMBIGUOUS'
  | 'NEEDS_DISCLOSURE';

export type ReviewDecision =
  | 'APPROVED'
  | 'CONDITIONALLY_APPROVED'
  | 'REVISION_REQUESTED'
  | 'REJECTED'
  | 'NEED_MORE_INFO';

export type LearningStatus =
  | 'CANDIDATE_RAW'
  | 'REDACTION_REQUIRED'
  | 'REDACTED'
  | 'LABEL_VALIDATION_PENDING'
  | 'APPROVED_FOR_EVAL'
  | 'APPROVED_FOR_TRAINING'
  | 'EXCLUDED';

export type Channel = 'APP_PUSH' | 'SMS' | 'BANNER' | 'HOMEPAGE' | 'SNS' | 'EMAIL' | 'OTHER';

export type ProductStatus = 'ACTIVE' | 'SCHEDULED' | 'INACTIVE';

export type ProductDocumentType =
  | 'PRODUCT_DESCRIPTION'
  | 'TERMS'
  | 'RATE_TABLE'
  | 'FEE_TABLE'
  | 'DISCLOSURE_GUIDE'
  | 'OTHER';

export type ProductFactType =
  | 'RATE'
  | 'ELIGIBILITY'
  | 'LIMIT'
  | 'FEE'
  | 'TERM'
  | 'BENEFIT'
  | 'RISK_NOTICE'
  | 'CHANNEL'
  | 'OTHER';

export type InputStatus = 'COMPLETE' | 'MISSING_REQUIRED';
