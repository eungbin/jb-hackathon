import { describe, expect, it } from 'vitest'

const componentSources = import.meta.glob('./ProductFactDrawer.tsx', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

describe('ProductFactDrawer', () => {
  it('shows a delete action only while editing an existing Product Fact', () => {
    const source = componentSources['./ProductFactDrawer.tsx']

    expect(source).toContain('onDelete?: () => void')
    expect(source).toContain('factIndex !== null && onDelete')
    expect(source).toContain('variant="danger"')
    expect(source).toContain('삭제')
  })

  it('does not expose Product Fact effective date fields', () => {
    const source = componentSources['./ProductFactDrawer.tsx']

    expect(source).not.toContain('factDraft.effectiveStartDate')
    expect(source).not.toContain('factDraft.effectiveEndDate')
    expect(source).not.toContain('적용 시작일')
    expect(source).not.toContain('적용 종료일')
  })

  it('uses raw factType values as select labels', () => {
    const source = componentSources['./ProductFactDrawer.tsx']

    expect(source).toContain('currentFactTypeOptions')
    expect(source).toContain('label: type')
    expect(source).not.toContain('factTypeLabels')
  })
})
