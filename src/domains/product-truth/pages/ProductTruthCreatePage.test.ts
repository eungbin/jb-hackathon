import { describe, expect, it } from 'vitest'

const pageSources = import.meta.glob('./ProductTruthCreatePage.tsx', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

describe('ProductTruthCreatePage API integration', () => {
  it('wires product file ai analysis and product create APIs', () => {
    const source = pageSources['./ProductTruthCreatePage.tsx']

    expect(source).toContain('useAuth')
    expect(source).toContain('analyzeProductFiles')
    expect(source).toContain('createProduct')
    expect(source).toContain('applyProductAiAnalysisResult')
    expect(source).toContain('근거문서 기반 AI 초안 작성')
    expect(source).toContain('multiple')
    expect(source).toContain('uploadedFiles')
  })

  it('does not show source document version or effective date columns', () => {
    const source = pageSources['./ProductTruthCreatePage.tsx']

    expect(source).toContain("headers={['문서명', '문서 유형', '상태', 'ACTION']}")
    expect(source).not.toContain("'버전', '적용 시작일'")
    expect(source).not.toContain('document.version ||')
    expect(source).not.toContain('document.effectiveStartDate ||')
  })

  it('does not show a fixed percentage in registration steps', () => {
    const source = pageSources['./ProductTruthCreatePage.tsx']

    expect(source).not.toContain('Completion')
    expect(source).not.toContain('72%')
    expect(source).not.toContain('w-[72%]')
  })

  it('lays out registration steps, source documents, and summary in the first row', () => {
    const source = pageSources['./ProductTruthCreatePage.tsx']

    expect(source).toContain('xl:grid-cols-[250px_minmax(0,1fr)_280px]')
    expect(source).toContain('className="grid gap-4 xl:grid-cols-[250px_minmax(0,1fr)_280px]"')
    expect(source).not.toContain('className="grid items-start gap-4 xl:grid-cols-[250px_minmax(0,1fr)_280px]"')
    expect(source).not.toContain('<Card title="등록 단계" className="self-start">')
    expect(source).not.toContain('xl:max-h-[640px]')
    expect(source.indexOf('<Card title="등록 단계"')).toBeLessThan(source.indexOf('<Card title="근거 문서"'))
    expect(source.indexOf('<Card title="근거 문서"')).toBeLessThan(source.indexOf('<Card title="등록 요약"'))
    expect(source.indexOf('<Card title="등록 요약"')).toBeLessThan(source.indexOf('<Card title="상품 기본정보"'))
    expect(source.indexOf('<Card title="상품 기본정보"')).toBeLessThan(source.indexOf('title="Product Fact"'))
  })

  it('places product name, code, and product group on one row', () => {
    const source = pageSources['./ProductTruthCreatePage.tsx']

    expect(source).toContain('lg:grid-cols-3')
    expect(source).not.toContain('md:grid-cols-2')
  })

  it('uses a product group dropdown with the same three categories as content registration', () => {
    const source = pageSources['./ProductTruthCreatePage.tsx']

    expect(source).toContain('SelectField')
    expect(source).toContain('productGroupOptions')
    expect(source).toContain('label="상품군"')
    expect(source).toContain("{ value: '', label: '상품군을 선택해주세요.' }")
    expect(source).toContain('productGroupOptions.map((category) => ({ value: category, label: category }))')
    expect(source).not.toContain('label="상품 카테고리"')
  })

  it('shows raw Product Fact factType values from the server', () => {
    const source = pageSources['./ProductTruthCreatePage.tsx']

    expect(source).toContain("{fact.factType || '-'}")
    expect(source).not.toContain('factTypeLabels[fact.factType]')
  })

  it('limits Product Fact rows to five per page', () => {
    const source = pageSources['./ProductTruthCreatePage.tsx']

    expect(source).toContain('const productFactPageSize = 5')
    expect(source).toContain('const [productFactPage, setProductFactPage]')
    expect(source).toContain('const productFactTotalPages')
    expect(source).toContain('const visibleProductFactPage')
    expect(source).toContain('const paginatedProductFacts')
    expect(source).toContain('pagination={{')
    expect(source).toContain('currentPage: visibleProductFactPage')
    expect(source).toContain('onPageChange: setProductFactPage')
    expect(source).toContain('paginatedProductFacts.map')
  })

  it('uses 상품설명서 as the real default when editing an untyped source document', () => {
    const source = pageSources['./ProductTruthCreatePage.tsx']

    expect(source).toContain("documentType: document.documentType || 'PRODUCT_DESCRIPTION'")
  })

  it('keeps Product Fact status and action cells on one line', () => {
    const source = pageSources['./ProductTruthCreatePage.tsx']

    expect(source).toContain('`${uiTokens.spacing.tableCell} whitespace-nowrap`')
  })

  it('wires Product Fact deletion from the edit drawer', () => {
    const source = pageSources['./ProductTruthCreatePage.tsx']

    expect(source).toContain('const deleteFact = () =>')
    expect(source).toContain('productFacts: current.productFacts.filter((_, index) => index !== factIndex)')
    expect(source).toContain('onDelete={deleteFact}')
  })
})
