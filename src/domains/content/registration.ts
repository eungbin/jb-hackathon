import type { ContentRegisterRequest } from './api'

export type ContentRegistrationForm = {
  title: string
  originalText: string
  productCategory: string
  productId: number
  urgency: string
  channels: string[]
  plannedPublishDate: string
}

const channelLabels: Record<string, string> = {
  'App Push': '앱푸시',
  SMS: 'SMS',
  Banner: '배너',
  Homepage: '홈페이지',
}

export function createContentRegisterRequest(form: ContentRegistrationForm, userId: number): ContentRegisterRequest {
  const channel = form.channels[0]

  return {
    userId,
    productId: form.productId,
    title: form.title,
    content: form.originalText,
    channel: channelLabels[channel],
    urgency: form.urgency,
    releaseAt: `${form.plannedPublishDate}T09:00:00`,
  }
}
