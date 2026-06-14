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

  it('renders risk level as a separate rule table column', () => {
    const source = pageSources['./RulesSourcesPage.tsx']

    expect(source).toContain("headers={['Rule ID', '규칙명', '위험등급', '탐지 키워드 및 필수 고지 (Rules)', '액션']}")
    expect(source).toMatch(/<td className=\{uiTokens\.spacing\.tableCellRelaxed\}>\s*\{rule\.severity \? <RiskBadge level=\{rule\.severity\} \/> : <Badge>미지정<\/Badge>\}\s*<\/td>/)
    expect(source).toContain('colSpan={5}')
  })
})
