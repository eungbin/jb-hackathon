import { describe, expect, it } from 'vitest'
import { uiTokens } from './tokens'

describe('ui design tokens', () => {
  it('defines shared color, spacing, and typography token groups', () => {
    expect(uiTokens.color).toMatchObject({
      page: expect.any(String),
      surface: expect.any(String),
      border: expect.any(String),
      primary: expect.any(String),
      danger: expect.any(String),
      warning: expect.any(String),
      success: expect.any(String),
      mutedText: expect.any(String),
    })

    expect(uiTokens.spacing).toMatchObject({
      page: expect.any(String),
      section: expect.any(String),
      card: expect.any(String),
      field: expect.any(String),
      tableCell: expect.any(String),
    })

    expect(uiTokens.typography).toMatchObject({
      pageTitle: expect.any(String),
      sectionTitle: expect.any(String),
      cardTitle: expect.any(String),
      body: expect.any(String),
      label: expect.any(String),
      helper: expect.any(String),
      linkText: expect.stringContaining('underline'),
      metricValue: expect.any(String),
      tableHeader: expect.any(String),
    })

    expect(uiTokens.radius).toMatchObject({
      chip: expect.any(String),
      compact: expect.any(String),
      control: expect.any(String),
      panel: expect.any(String),
    })
  })
})
