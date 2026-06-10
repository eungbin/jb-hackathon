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
})
