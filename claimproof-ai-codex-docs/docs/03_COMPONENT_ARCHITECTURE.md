# 03. Component Architecture

## Application Shell

```txt
App
└─ Router
   └─ AppShell
      ├─ Sidebar
      ├─ TopBar
      └─ PageOutlet
```

## Common Components

### Layout

- `AppShell`
- `Sidebar`
- `TopBar`
- `PageHeader`
- `PageContent`
- `RightDrawer`
- `RightSummaryPanel`

### UI primitives

- `Button`
- `Card`
- `Badge`
- `Input`
- `Textarea`
- `Select`
- `DateInput`
- `SearchInput`
- `Table`
- `TablePagination`
- `FilterBar`
- `Stepper`
- `MetricCard`
- `StatusBadge`
- `RiskBadge`
- `DecisionBadge`
- `ChannelBadge`

### Compliance-specific components

- `RiskScoreGauge`
- `ClaimVerificationTable`
- `ClaimEvidenceDrawer`
- `EvidenceSourceCard`
- `ReviewDecisionPanel`
- `AuditTimeline`
- `IntegrityHashCard`
- `ProductTruthSummaryCard`
- `ProductFactTable`
- `ProductFactDrawer`
- `SourceDocumentTable`
- `SourceDocumentDrawer`
- `RuleDetailDrawer`
- `LearningCandidateDrawer`

---

## Page Components

### Dashboard

```txt
DashboardPage
├─ DashboardKpiGrid
├─ PriorityReviewTable
├─ RiskDistributionCard
├─ RecurringRiskTopList
├─ LearningCandidateStatusCard
└─ SystemHealthCard
```

### 콘텐츠 등록

```txt
ContentCreatePage
├─ ContentRequestForm
├─ ProductTruthSideSummary
├─ ComplianceChecklistCard
└─ ContentSubmitActions
```

### 준법 Review List

```txt
ComplianceReviewListPage
├─ ReviewQueueSummaryCards
├─ ReviewQueueFilterBar
├─ ReviewQueueTable
└─ AiInsightToast
```

### 준법 Review 상세

```txt
ComplianceReviewDetailPage
├─ AiPreReviewSummaryCard
├─ EvidenceSourceSummaryList
├─ ClaimVerificationTable
├─ OriginalContentPanel
├─ ReviewDecisionPanel
└─ ClaimEvidenceDrawer
```

### Evidence Pack List

```txt
EvidencePackListPage
├─ EvidencePackFilterBar
├─ EvidencePackTable
└─ TablePagination
```

### Evidence Pack 상세

```txt
EvidencePackDetailPage
├─ EvidencePackHeader
├─ AuditTimelineCard
├─ RecordIntegrityHashCard
├─ ProductMetadataCard
├─ ClaimVerificationResultTable
├─ FinalReviewCommentCard
└─ DigitalSignatureCard
```

### Learning Loop

```txt
LearningLoopPage
├─ LearningGuideBanner
├─ LearningCandidateQueueTable
└─ LearningCandidateDrawer
```

### Product Truth 조회

```txt
ProductTruthPage
├─ ProductSelectionList
├─ ProductVersionManagementCard
├─ ProductFactFilterBar
└─ ProductFactReadOnlyTable
```

### 상품 신규 등록

```txt
ProductCreatePage
├─ ProductCreateStepper
├─ ProductBasicInfoCard
├─ ProductVersionPeriodCard
├─ SourceDocumentUploadCard
├─ ProductFactEditCard
├─ ProductRegistrationValidationCard
├─ ProductRegistrationSummaryPanel
├─ SourceDocumentDrawer
└─ ProductFactDrawer
```

### Rules & Sources

```txt
RulesSourcesPage
├─ RuleFilterBar
├─ RuleTable
├─ SourceDocumentCards
└─ RuleDetailDrawer
```

---

## Drawer Rules

### Claim Evidence Drawer

- Must be accordion-style, not tab-style.
- Shows user-visible evidence explanation only.
- Must not expose hidden chain-of-thought.
- Does not make final decisions.

### Product Create Drawers

- Manual input only.
- No AI extraction labels.
- No draft/save/approval workflow.
- Drawer action is `변경 적용`.

### Rules Drawer

- Right-side fixed drawer.
- Can edit severity, trigger keywords, required disclosures, rule logic.
