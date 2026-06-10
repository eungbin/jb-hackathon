import { describe, expect, it } from 'vitest'
import { createRule, fetchRulesSources, normalizeRulesSourcesResponse, uploadRuleFile } from './api'

describe('normalizeRulesSourcesResponse', () => {
  it('maps /rule/list response to rules and source documents', () => {
    const data = normalizeRulesSourcesResponse({
      rules: [
        {
          ruleId: 1,
          ruleUniqueId: 'FIN-2024-001',
          ruleTitle: '우대금리 고지 의무',
          ruleRequired: '우대금리 적용 조건을 반드시 명시해야 합니다.',
          ruleRiskLevel: 'HIGH',
          keywords: [
            { keywordId: 1, keywordContent: '최고' },
            { keywordId: 2, keywordContent: '보장' },
          ],
        },
      ],
      ruleFiles: [
        {
          ruleFileId: 3,
          ruleFileTitle: '금융광고심의규정_2024.pdf',
          ruleFileUrl: 'http://localhost:8080/files/rules/20240701/abc123.pdf',
          ruleRegistAt: '2024-07-01T10:00:00',
        },
      ],
    })

    expect(data.rules).toEqual([
      {
        ruleId: 1,
        ruleUniqueId: 'FIN-2024-001',
        name: '우대금리 고지 의무',
        severity: 'HIGH',
        triggerKeywords: ['최고', '보장'],
        requiredDisclosures: '우대금리 적용 조건을 반드시 명시해야 합니다.',
      },
    ])
    expect(data.sourceDocuments[0]).toMatchObject({
      documentId: 'RULE-FILE-3',
      title: '금융광고심의규정_2024.pdf',
      url: 'http://localhost:8080/files/rules/20240701/abc123.pdf',
      syncedAt: '2024.07.01 10:00',
      status: 'ACTIVE',
    })
  })
})

describe('fetchRulesSources', () => {
  it('gets rules and source files', async () => {
    const calls: Array<{ url: string | URL | Request; init?: RequestInit }> = []
    const fetcher: typeof fetch = async (url, init) => {
      calls.push({ url, init })

      return new Response(JSON.stringify({ rules: [], ruleFiles: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const result = await fetchRulesSources(fetcher)

    expect(calls[0].url).toBe('/api/rule/list')
    expect(calls[0].init).toBeUndefined()
    expect(result.rules).toEqual([])
    expect(result.sourceDocuments).toEqual([])
  })
})

describe('createRule', () => {
  it('posts rule create payload', async () => {
    const calls: Array<{ url: string | URL | Request; init?: RequestInit }> = []
    const fetcher: typeof fetch = async (url, init) => {
      calls.push({ url, init })

      return new Response(JSON.stringify(7), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const ruleId = await createRule({
      name: '최고금리 조건 표시',
      severity: 'HIGH',
      requiredDisclosures: '우대 조건을 함께 표시하세요.',
      triggerKeywords: '최고, 보장, 무조건',
    }, fetcher)

    expect(calls[0].url).toBe('/api/rule/create')
    expect(calls[0].init?.method).toBe('POST')
    expect(calls[0].init?.headers).toEqual({ 'Content-Type': 'application/json' })
    expect(JSON.parse(String(calls[0].init?.body))).toEqual({
      ruleTitle: '최고금리 조건 표시',
      ruleRequired: '우대 조건을 함께 표시하세요.',
      ruleRiskLevel: 'HIGH',
      keywords: ['최고', '보장', '무조건'],
    })
    expect(ruleId).toBe(7)
  })
})

describe('uploadRuleFile', () => {
  it('posts a single file using the file part', async () => {
    const uploadedFile = new File(['rule'], '금융광고심의규정.pdf', { type: 'application/pdf' })
    const calls: Array<{ url: string | URL | Request; init?: RequestInit }> = []
    const fetcher: typeof fetch = async (url, init) => {
      calls.push({ url, init })
      const body = init?.body as FormData

      expect(body.get('file')).toBe(uploadedFile)

      return new Response(JSON.stringify(5), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const ruleFileId = await uploadRuleFile(uploadedFile, fetcher)

    expect(calls[0].url).toBe('/api/rule/file/create')
    expect(calls[0].init?.method).toBe('POST')
    expect(calls[0].init?.headers).toBeUndefined()
    expect(ruleFileId).toBe(5)
  })
})
