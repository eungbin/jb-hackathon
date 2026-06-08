import { describe, expect, it } from 'vitest'

const corePageSources = import.meta.glob([
  '../domains/dashboard/pages/*.tsx',
  '../domains/content/pages/*.tsx',
  '../domains/compliance-review/pages/*.tsx',
  '../domains/evidence-pack/pages/*.tsx',
  '../domains/learning-loop/pages/*.tsx',
], {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

const sharedUiSources = import.meta.glob('../components/ui.tsx', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

const designGuardSources = {
  ...corePageSources,
  ...sharedUiSources,
}

const forbiddenPatterns = [
  { name: 'large card radius', pattern: /rounded-(?:xl|2xl)/ },
  { name: 'custom shadow', pattern: /shadow-\[/ },
  { name: 'heavy preset shadow', pattern: /shadow-(?:lg|xl|2xl)/ },
  { name: 'decorative gradient', pattern: /(?:bg-\[conic-gradient|bg-gradient)/ },
  { name: 'negative letter spacing', pattern: /tracking-\[-/ },
]

describe('design prompt guards', () => {
  it.each(Object.entries(designGuardSources))('%s avoids decorative or oversized styling', (_path, source) => {
    for (const { name, pattern } of forbiddenPatterns) {
      expect(source, name).not.toMatch(pattern)
    }
  })
})
