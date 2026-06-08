# 04. Data Model and Mock Plan

## Canonical Data Directory

All mock data should live in `docs/data`. During implementation it may be copied to `src/data`, but values should not be changed.

## Required Mock Files

```txt
docs/data/
├─ README.md
├─ enums.ts
├─ route-map.json
├─ mock-dashboard.json
├─ mock-content.json
├─ mock-compliance-review-list.json
├─ mock-compliance-review-detail.json
├─ mock-evidence-pack-list.json
├─ mock-final-evidence-pack.json
├─ mock-learning-candidates.json
├─ mock-products.json
├─ mock-product-truth.json
├─ mock-product-create-form.json
├─ mock-rules-sources.json
└─ mock-audit-log.json
```

## Core Entities

### DashboardMetric

```ts
type DashboardMetric = {
  id: string;
  label: string;
  value: number | string;
  helperText?: string;
  tone: 'blue' | 'green' | 'orange' | 'red' | 'purple';
};
```

### ContentRequest

```ts
type ContentRequest = {
  contentId: string;
  title: string;
  originalText: string;
  productId: string;
  productName: string;
  productCategory: string;
  targetCustomers: string[];
  language: 'ko' | 'en';
  channel: string;
  urgency: 'LOW' | 'NORMAL' | 'HIGH';
  plannedPublishDate: string;
  requester: string;
  submittedAt: string;
};
```

### ComplianceReviewListItem

```ts
type ComplianceReviewListItem = {
  reviewId: string;
  contentId: string;
  title: string;
  productName: string;
  channel: string;
  highestRiskLevel: RiskLevel;
  claimCount: number;
  requester: string;
  reviewer?: string;
  requestedAt: string;
  plannedPublishDate: string;
  status: 'PENDING' | 'IN_REVIEW' | 'DECISION_SAVED';
};
```

### Claim

```ts
type Claim = {
  claimId: string;
  statement: string;
  claimType: 'RATE' | 'ELIGIBILITY' | 'BENEFIT' | 'LIMIT' | 'FEE' | 'RISK_NOTICE' | 'OTHER';
  verificationStatus: VerificationStatus;
  riskLevel: RiskLevel;
  evidenceRefs: string[];
  aiSummary: string;
  suggestedRevision?: string;
};
```

### ReviewDecision

```ts
type ReviewDecisionRecord = {
  reviewId: string;
  decision?: ReviewDecision;
  reviewer: string;
  comments: string;
  requiredActions?: string[];
  savedAt?: string;
};
```

### EvidencePack

```ts
type EvidencePack = {
  packId: string;
  contentId: string;
  title: string;
  productName: string;
  channel: string;
  finalDecision: ReviewDecision;
  highestRiskLevel: RiskLevel;
  finalizedAt: string;
  reviewer: string;
  packHash: string;
  learningStatus: LearningStatus;
};
```

### ProductTruth

```ts
type ProductTruth = {
  productId: string;
  productCode: string;
  productName: string;
  category: string;
  subCategory: string;
  status: 'ACTIVE' | 'SCHEDULED' | 'INACTIVE';
  currentVersion: ProductVersion;
  sourceDocuments: SourceDocument[];
  productFacts: ProductFact[];
};
```

### SourceDocument

```ts
type SourceDocument = {
  documentId: string;
  fileName: string;
  documentType: ProductDocumentType;
  version: string;
  effectiveStartDate: string;
  description?: string;
  note?: string;
  inputStatus: 'COMPLETE' | 'MISSING_REQUIRED';
};
```

### ProductFact

```ts
type ProductFact = {
  factId: string;
  factType: ProductFactType;
  factName: string;
  value: string;
  unit: string;
  displayValue?: string;
  condition?: string;
  sourceDocumentId: string;
  sourceLocator: string;
  effectiveStartDate: string;
  effectiveEndDate?: string;
  sourceMemo?: string;
  inputStatus: 'COMPLETE' | 'MISSING_REQUIRED';
};
```

### Rule

```ts
type Rule = {
  ruleId: string;
  name: string;
  severity: RiskLevel;
  triggerKeywords: string[];
  requiredDisclosures: string;
  logic: string;
  effectiveDateRange?: string;
};
```
