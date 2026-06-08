import { describe, expect, it } from 'vitest'
import { getNextDataTableSortState } from './ui'

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
