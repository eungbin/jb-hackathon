import { describe, expect, it } from 'vitest'

const pageSources = import.meta.glob('../domains/**/pages/*.tsx', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

const routePages = [
  '../domains/dashboard/pages/DashboardPage.tsx',
  '../domains/content/pages/ContentCreatePage.tsx',
  '../domains/compliance-review/pages/ComplianceReviewListPage.tsx',
  '../domains/compliance-review/pages/ComplianceReviewDetailPage.tsx',
  '../domains/evidence-pack/pages/EvidencePackListPage.tsx',
  '../domains/evidence-pack/pages/EvidencePackDetailPage.tsx',
  '../domains/learning-loop/pages/LearningLoopPage.tsx',
  '../domains/product-truth/pages/ProductTruthPage.tsx',
  '../domains/product-truth/pages/ProductTruthCreatePage.tsx',
  '../domains/rules-sources/pages/RulesSourcesPage.tsx',
]

const pathLikeEyebrowPattern = /eyebrow=(?:"[^"]*>[^"]*"|{`[^`]*>[^`]*`})/

describe('route page headers', () => {
  it.each(routePages)('%s uses the shared path-style PageHeader', (pagePath) => {
    const source = pageSources[pagePath]

    expect(source).toBeDefined()
    expect(source).toContain('<PageHeader')
    expect(source).toMatch(pathLikeEyebrowPattern)
    expect(source).toContain('title=')
    expect(source).toContain('description=')
    expect(source).not.toContain('<header')
  })

  it('labels compliance review detail header as compliance review', () => {
    const source = pageSources['../domains/compliance-review/pages/ComplianceReviewDetailPage.tsx']

    expect(source).toContain('eyebrow="Compliance Review > Review Detail"')
    expect(source).toContain('title="준법 Review"')
    expect(source).not.toContain('eyebrow="Compliance Review > AI Pre-Review Pack"')
    expect(source).not.toContain('title="AI 사전 검토 Pack"')
  })

  it('does not show status values or history action in Product Truth summary cards', () => {
    const source = pageSources['../domains/product-truth/pages/ProductTruthPage.tsx']

    expect(source).toContain('<Card title="상품 선택">')
    expect(source).toContain('<Card title="Product Information">')
    expect(source).not.toContain('status={product.status}')
    expect(source).not.toContain('status={productTruthData.version.status}')
    expect(source).not.toContain('변경 이력 보기')
    expect(source).not.toContain('Base Rate')
    expect(source).not.toContain('productTruthData.version.baseRate')
  })

  it('uses real pagination state for Product Truth facts', () => {
    const source = pageSources['../domains/product-truth/pages/ProductTruthPage.tsx']

    expect(source).toContain('const productFactPageSize = 5')
    expect(source).toContain('const [productFactPage, setProductFactPage]')
    expect(source).toContain('const productFactTotalPages')
    expect(source).toContain('const paginatedFacts')
    expect(source).toContain('currentPage: visibleProductFactPage')
    expect(source).toContain('onPageChange: setProductFactPage')
    expect(source).toContain('paginatedFacts.map')
    expect(source).not.toContain('totalPages: 1')
    expect(source).not.toContain('onPageChange: () => undefined')
  })

  it('lets Product Truth product selection drive version and fact details', () => {
    const source = pageSources['../domains/product-truth/pages/ProductTruthPage.tsx']

    expect(source).toContain('const [selectedProductId, setSelectedProductId]')
    expect(source).toContain('const selectedProduct =')
    expect(source).toContain('const selectedProductDetails = selectedProduct')
    expect(source).toContain('setSelectedProductId(product.productId)')
    expect(source).toContain('setProductFactPage(1)')
    expect(source).toContain('aria-pressed={selectedProductId === product.productId}')
    expect(source).toContain('const selectedProductFacts = selectedProductDetails?.facts ?? []')
    expect(source).not.toContain('productTruthData.version.')
    expect(source).not.toContain('productTruthData.facts')
  })

  it('loads Product Truth products from the list API', () => {
    const source = pageSources['../domains/product-truth/pages/ProductTruthPage.tsx']

    expect(source).toContain('fetchProductTruthProducts')
    expect(source).toContain('const [items, setItems]')
    expect(source).not.toContain('productTruthData')
  })
})
