import { describe, expect, it } from 'vitest'

const componentSources = import.meta.glob('./SourceDocumentDrawer.tsx', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

describe('SourceDocumentDrawer', () => {
  it('does not expose version or effective date fields', () => {
    const source = componentSources['./SourceDocumentDrawer.tsx']

    expect(source).not.toContain('documentDraft.version')
    expect(source).not.toContain('documentDraft.effectiveStartDate')
  })
})
