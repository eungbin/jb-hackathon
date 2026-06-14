import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { DataTable, getNextDataTableSortState } from './ui'

describe('DataTable sorting', () => {
  it('cycles from none to ascending to descending to none', () => {
    expect(getNextDataTableSortState(null, null, 'riskLevel')).toEqual({ sortKey: 'riskLevel', sortDirection: 'asc' })
    expect(getNextDataTableSortState('riskLevel', 'asc', 'riskLevel')).toEqual({ sortKey: 'riskLevel', sortDirection: 'desc' })
    expect(getNextDataTableSortState('riskLevel', 'desc', 'riskLevel')).toEqual({ sortKey: null, sortDirection: null })
  })

  it('starts at ascending when switching to a different column', () => {
    expect(getNextDataTableSortState('riskLevel', 'desc', 'statement')).toEqual({ sortKey: 'statement', sortDirection: 'asc' })
  })
})

describe('DataTable empty state', () => {
  it('shows a default empty message when there are no rows', () => {
    const markup = renderToStaticMarkup(createElement(DataTable, { headers: ['Name', 'Status'] }, []))

    expect(markup).toContain('표시할 데이터가 없습니다.')
    expect(markup).toContain('colSpan="2"')
  })

  it('uses a custom empty message when provided', () => {
    const markup = renderToStaticMarkup(createElement(DataTable, { headers: ['Name'], emptyMessage: '등록된 항목이 없습니다.' }, []))

    expect(markup).toContain('등록된 항목이 없습니다.')
  })
})
