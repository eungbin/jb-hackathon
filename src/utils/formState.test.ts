import { describe, expect, it } from 'vitest'
import { updateTextField } from './formState'

describe('editable form state helpers', () => {
  it('returns a new object with the edited field value', () => {
    const current = { title: '기존 제목', productId: 'DEP-SAV-001' }

    const next = updateTextField(current, 'title', '수정 제목')

    expect(next).toEqual({ title: '수정 제목', productId: 'DEP-SAV-001' })
    expect(current.title).toBe('기존 제목')
  })
})
