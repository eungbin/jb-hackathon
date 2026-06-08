import { describe, expect, it } from 'vitest'

const secondPassSources = import.meta.glob([
  '../components/ui.tsx',
  '../components/layout/AppShell.tsx',
  '../domains/dashboard/pages/*.tsx',
  '../domains/content/pages/*.tsx',
  '../domains/compliance-review/pages/*.tsx',
  '../domains/evidence-pack/pages/*.tsx',
  '../domains/learning-loop/pages/*.tsx',
  '../domains/product-truth/components/*.tsx',
  '../domains/product-truth/pages/*.tsx',
  '../domains/rules-sources/pages/*.tsx',
], {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

describe('second-pass design token usage', () => {
  it.each(Object.entries(secondPassSources))('%s avoids local raw color and arbitrary text tokens', (_path, source) => {
    expect(source).not.toMatch(/#[0-9a-fA-F]{6,8}/)
    expect(source).not.toMatch(/text-\[[^\]]+\]/)
    expect(source).not.toMatch(/leading-\[[^\]]+\]/)
    expect(source).not.toMatch(/tracking-\[[^\]]+\]/)
    if (!_path.includes('AppShell')) {
      expect(source).not.toMatch(/(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap)-\[[^\]]+\]/)
    }
  })

  it('shared UI components consume the design token module', () => {
    const uiSource = secondPassSources['../components/ui.tsx']

    expect(uiSource).toContain('uiTokens')
  })

  it('shared PageHeader descriptions can emphasize inline content', () => {
    const uiSource = secondPassSources['../components/ui.tsx']
    const detailSource = secondPassSources['../domains/compliance-review/pages/ComplianceReviewDetailPage.tsx']
    const pageHeaderSource = uiSource.slice(uiSource.indexOf('export function PageHeader'))

    expect(pageHeaderSource).toContain('description?: ReactNode')
    expect(detailSource).toContain('description={')
    expect(detailSource).toContain('<strong')
    expect(detailSource).toContain('AI 사전 검토 Pack')
  })

  it('shared DataTable supports opt-in sortable headers', () => {
    const uiSource = secondPassSources['../components/ui.tsx']

    expect(uiSource).toContain('export type DataTableHeader')
    expect(uiSource).toContain('export type DataTablePagination')
    expect(uiSource).toContain('header')
    expect(uiSource).toContain('filters')
    expect(uiSource).toContain('pagination')
    expect(uiSource).toContain('sortDirection')
    expect(uiSource).toContain('onSortChange')
    expect(uiSource).toContain('aria-sort')
    expect(uiSource).toContain('sortable')
    expect(uiSource).toContain('ArrowUpDown')
  })

  it('shared interactive primitives avoid accidental page-wide interaction blocking', () => {
    const uiSource = secondPassSources['../components/ui.tsx']

    expect(uiSource).toContain("type = 'button'")
    expect(uiSource).toContain('type={type}')
    expect(uiSource).toContain('className="fixed inset-0 z-50"')
    expect(uiSource).toContain('type="button"')
  })

  it('chip-like UI uses the shared chip radius token', () => {
    expect(secondPassSources['../components/ui.tsx']).toContain('uiTokens.radius.chip')
    expect(secondPassSources['../domains/dashboard/pages/DashboardPage.tsx']).toContain('uiTokens.radius.chip')
    expect(secondPassSources['../domains/content/pages/ContentCreatePage.tsx']).toContain('uiTokens.radius.chip')
    expect(secondPassSources['../domains/compliance-review/pages/ComplianceReviewDetailPage.tsx']).toContain('uiTokens.radius.chip')
  })

  it('dashboard risk distribution uses a donut chart instead of a bar-only summary', () => {
    const dashboardSource = secondPassSources['../domains/dashboard/pages/DashboardPage.tsx']

    expect(dashboardSource).toContain('conic-gradient')
    expect(dashboardSource).toContain('Risk Distribution donut chart')
  })

  it('dashboard priority queue is capped at five visible rows', () => {
    const dashboardSource = secondPassSources['../domains/dashboard/pages/DashboardPage.tsx']

    expect(dashboardSource).toContain('priorityRows.slice(0, 5)')
  })

  it('dashboard learning summary uses only the three review outcome statuses', () => {
    const dashboardSource = secondPassSources['../domains/dashboard/pages/DashboardPage.tsx']

    expect(dashboardSource).toContain("label: '승인 대기'")
    expect(dashboardSource).toContain("label: '승인'")
    expect(dashboardSource).toContain("label: '거절'")
    expect(dashboardSource).not.toContain('function SystemPulse')
    expect(dashboardSource).not.toContain('System Health')
  })

  it('content registration uses selectable product id and future-only date picker', () => {
    const contentSource = secondPassSources['../domains/content/pages/ContentCreatePage.tsx']

    expect(contentSource).not.toContain('SegmentedLanguage')
    expect(contentSource).not.toContain('language:')
    expect(contentSource).toContain('productIdOptions')
    expect(contentSource).toContain('label="상품 ID"')
    expect(contentSource).toContain('type="date"')
    expect(contentSource).toContain('min={todayDate}')
    expect(contentSource).toContain('showPicker')
  })

  it('content registration scopes product ids by selected product category', () => {
    const contentSource = secondPassSources['../domains/content/pages/ContentCreatePage.tsx']

    expect(contentSource).toContain('productIdOptionsByCategory')
    expect(contentSource).toContain('selectedProductIdOptions')
    expect(contentSource).toContain('updateProductCategory')
    expect(contentSource).toContain('nextOptions.includes(current.productId)')
    expect(contentSource).not.toContain('const productIdOptions =')
  })

  it('content registration does not collect target customers', () => {
    const contentSource = secondPassSources['../domains/content/pages/ContentCreatePage.tsx']

    expect(contentSource).not.toContain('targetCustomers')
    expect(contentSource).not.toContain('targetOptions')
    expect(contentSource).not.toContain('대상 고객')
  })

  it('compliance review list wires filters, date pickers, and pagination to table rows', () => {
    const reviewListSource = secondPassSources['../domains/compliance-review/pages/ComplianceReviewListPage.tsx']

    expect(reviewListSource).toContain('appliedFilters')
    expect(reviewListSource).toContain('filteredRows')
    expect(reviewListSource).toContain('paginatedRows')
    expect(reviewListSource).toContain('DateRangeFilter')
    expect(reviewListSource).toContain('type="date"')
    expect(reviewListSource).toContain('setCurrentPage')
    expect(reviewListSource).toContain('filters={')
    expect(reviewListSource).toContain('pagination={')
    expect(reviewListSource).toContain('reviewTableHeaders')
    expect(reviewListSource).toContain('sortKey')
    expect(reviewListSource).not.toContain('Showing 1-5 of 128 entries')
  })

  it('compliance review filters submit when pressing Enter', () => {
    const reviewListSource = secondPassSources['../domains/compliance-review/pages/ComplianceReviewListPage.tsx']

    expect(reviewListSource).toContain('onSubmit={applyFilters}')
    expect(reviewListSource).toContain('type="submit"')
    expect(reviewListSource).toContain('type="button"')
  })

  it('compliance review date filters do not render a left calendar icon', () => {
    const reviewListSource = secondPassSources['../domains/compliance-review/pages/ComplianceReviewListPage.tsx']

    expect(reviewListSource).toContain('type="date"')
    expect(reviewListSource).not.toContain('CalendarDays')
  })

  it('compliance review detail uses sortable claim columns without table filters', () => {
    const detailSource = secondPassSources['../domains/compliance-review/pages/ComplianceReviewDetailPage.tsx']

    expect(detailSource).toContain('type ClaimSortKey')
    expect(detailSource).toContain('claimTableHeaders')
    expect(detailSource).toContain('sortedClaims')
    expect(detailSource).toContain('onSortChange')
    expect(detailSource).toContain('header={')
    expect(detailSource).toContain('pagination={')
    expect(detailSource).toContain('sortable: false')
    expect(detailSource).not.toContain('<Filter')
  })

  it('compliance review detail limits rerenders while editing review comments', () => {
    const detailSource = secondPassSources['../domains/compliance-review/pages/ComplianceReviewDetailPage.tsx']

    expect(detailSource).toContain('memo(function ClaimsTable')
    expect(detailSource).toContain('memo(function RiskScoreCard')
    expect(detailSource).toContain('memo(function EvidenceSourceList')
    expect(detailSource).toContain('memo(function OriginalDocument')
    expect(detailSource).toContain('memo(function EvidenceDrawer')
    expect(detailSource).toContain('useCallback')
  })

  it('content registration lets channel selection span the full form width', () => {
    const contentSource = secondPassSources['../domains/content/pages/ContentCreatePage.tsx']

    expect(contentSource).toMatch(/className="grid gap-1 md:col-span-2">\s*<span className=\{labelClass\}>채널/)
  })
})
