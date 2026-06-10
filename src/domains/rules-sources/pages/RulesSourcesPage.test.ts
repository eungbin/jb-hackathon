import { describe, expect, it } from 'vitest'

const pageSources = import.meta.glob('./RulesSourcesPage.tsx', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

describe('RulesSourcesPage API integration', () => {
  it('uses Rules & Sources APIs instead of mock data', () => {
    const source = pageSources['./RulesSourcesPage.tsx']

    expect(source).toContain('fetchRulesSources')
    expect(source).toContain('createRule')
    expect(source).toContain('uploadRuleFile')
    expect(source).not.toContain('rulesSourcesData')
  })

  it('exposes add actions for rules and RAG source files', () => {
    const source = pageSources['./RulesSourcesPage.tsx']

    expect(source).toContain('룰 추가')
    expect(source).toContain('파일 추가')
    expect(source).toContain('type="file"')
  })

  it('does not render status chips in the RAG Source Library', () => {
    const source = pageSources['./RulesSourcesPage.tsx']

    expect(source).not.toContain('{document.status}')
  })
})
