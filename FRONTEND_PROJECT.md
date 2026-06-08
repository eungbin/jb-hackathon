# ClaimProof AI Frontend Project

## Overview

This repository is a static React frontend MVP built with Vite, TypeScript, Tailwind CSS, React Router DOM, lucide-react icons, and Pretendard as the primary UI font.

The app runs entirely in the browser with local component state and mock data. It does not call a backend, API route, LLM service, RAG service, or database.

## Commands

```bash
npm install
npm run dev
npm run test
npm run build
npm run preview
```

## Project Structure

```txt
src/
  App.tsx
  main.tsx
  style.css
  components/
    layout/AppShell.tsx
    ui.tsx
  data/
    mockData.ts
  domains/
    dashboard/
      pages/DashboardPage.tsx
    content/
      pages/ContentCreatePage.tsx
    compliance-review/
      pages/ComplianceReviewListPage.tsx
      pages/ComplianceReviewDetailPage.tsx
    evidence-pack/
      pages/EvidencePackListPage.tsx
      pages/EvidencePackDetailPage.tsx
    learning-loop/
      pages/LearningLoopPage.tsx
    product-truth/
      components/ProductFactDrawer.tsx
      components/SourceDocumentDrawer.tsx
      pages/ProductTruthPage.tsx
      pages/ProductTruthCreatePage.tsx
      utils/productCreateValidation.ts
      utils/productCreateValidation.test.ts
      utils/productForm.ts
    rules-sources/
      pages/RulesSourcesPage.tsx
    index.ts
  pages/
    index.ts
  types/
    index.ts
  utils/
    labels.ts
    formState.ts
```

## Routing

Routing is configured in `src/App.tsx` with `BrowserRouter`.

Implemented routes:

- `/dashboard`
- `/content/new`
- `/compliance-review`
- `/compliance-review/:reviewId`
- `/evidence-pack`
- `/evidence-pack/:packId`
- `/learning-loop`
- `/product-truth`
- `/product-truth/new`
- `/rules-sources`

The root path redirects to `/dashboard`. Unknown paths redirect to `/compliance-review`.

## Layout

`src/components/layout/AppShell.tsx` owns the shared application frame:

- left sidebar navigation
- top search bar
- notification/profile area
- routed page outlet

The sidebar uses one shared menu across the MVP. The settings entry is visible as a disabled static item because no settings route is part of this frontend scope.

## Shared UI

`src/components/ui.tsx` contains small reusable primitives:

- `PageHeader`
- `Card`
- `Button`
- `Badge`
- `RiskBadge`
- `DecisionBadge`
- `LearningBadge`
- `ProductStatusBadge`
- `InputStatusBadge`
- `Field`
- `TextareaField`
- `SelectField`
- `DataTable`
- `Drawer`
- `MetricCard`

These components are intentionally lightweight Tailwind wrappers rather than a full design-system abstraction.

## Mock Data

`src/data/mockData.ts` contains the frontend-ready mock records used by every page.

The data follows the source documents under `claimproof-ai-codex-docs/docs/data`, with display labels adjusted only where needed for the implemented UI.

## Product Truth Registration Validation

`src/domains/product-truth/utils/productCreateValidation.ts` contains the Product Truth registration rules:

- required product basics
- required version/effective date fields
- at least one source document
- required source document metadata
- at least one Product Fact
- required Product Fact source mapping
- `ACTIVE` or `SCHEDULED` status calculation from effective start date

`src/domains/product-truth/utils/productCreateValidation.test.ts` covers missing required values, complete registration, and date-based status calculation with Vitest.

## UI State

All interactive state is local React state:

- content submission success state
- claim evidence drawer
- learning candidate detail panel
- Product Truth document drawer
- Product Truth fact drawer
- registration validation errors
- rule detail drawer

Drawers are not represented as URL routes.
