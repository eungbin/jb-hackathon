import type { FormEvent, ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, BadgeCheck, CalendarDays, ChevronDown, Info, Send } from 'lucide-react'
import { Button, PageHeader } from '../../../components/ui'
import { uiTokens } from '../../../design/tokens'
import { useAuth } from '../../auth/AuthContext'
import { fetchProductInfo, registerContent } from '../api'
import type { ProductInfo } from '../api'
import { createContentRegisterRequest } from '../registration'
import type { ContentRegistrationForm } from '../registration'

type RequestState = ContentRegistrationForm

const getTodayInputDate = () => {
  const today = new Date()
  const timezoneOffset = today.getTimezoneOffset() * 60_000

  return new Date(today.getTime() - timezoneOffset).toISOString().slice(0, 10)
}

const initialRequest: RequestState = {
  title: '',
  originalText: '',
  productCategory: '예금',
  productId: 0,
  urgency: '보통',
  channels: ['App Push'],
  plannedPublishDate: getTodayInputDate(),
}

const channelOptions = ['App Push', 'SMS', 'Banner', 'Homepage']
const productCategoryOptions = ['예금', '적금', '대출']

const labelClass = uiTokens.typography.tableHeader
const controlClass =
  `h-10 w-full ${uiTokens.radius.control} border ${uiTokens.color.borderStrong} ${uiTokens.color.surface} px-4 text-sm font-normal leading-6 ${uiTokens.color.headingText} outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-50`

function FieldShell({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`grid gap-1 ${className}`}>
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  )
}

function SelectField({
  label,
  value,
  options,
  onChange,
  className = '',
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
  className?: string
}) {
  return (
    <FieldShell label={label} className={className}>
      <span className="relative block">
        <select className={`${controlClass} appearance-none pr-10`} value={value} onChange={(event) => onChange(event.target.value)}>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${uiTokens.color.bodyText}`} size={18} />
      </span>
    </FieldShell>
  )
}

function ProductSelectField({
  value,
  options,
  onChange,
}: {
  value: number
  options: ProductInfo[]
  onChange: (value: number) => void
}) {
  return (
    <FieldShell label="상품 ID">
      <span className="relative block">
        <select
          className={`${controlClass} appearance-none pr-10`}
          value={value > 0 ? String(value) : ''}
          onChange={(event) => onChange(Number(event.target.value))}
          disabled={options.length === 0}
        >
          {options.length === 0 ? (
            <option value="">조회된 상품 없음</option>
          ) : (
            options.map((product) => (
              <option key={product.productId} value={product.productId}>
                {product.productName} ({product.productCode})
              </option>
            ))
          )}
        </select>
        <ChevronDown className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${uiTokens.color.bodyText}`} size={18} />
      </span>
    </FieldShell>
  )
}

function TagButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      className={`h-[30px] ${uiTokens.radius.chip} border px-4 text-xs font-bold leading-4 transition ${
        selected ? `${uiTokens.color.primaryBorder} ${uiTokens.color.primarySurface} ${uiTokens.color.primary}` : `${uiTokens.color.borderStrong} ${uiTokens.color.surface} ${uiTokens.color.headingText} hover:border-blue-700`
      }`}
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  )
}

function ProductFactRow({ label, value, emphasized = false }: { label: string; value: string; emphasized?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className={uiTokens.typography.helper}>{label}</dt>
      <dd className={`text-right text-sm leading-5 ${emphasized ? `font-bold ${uiTokens.color.primary}` : `font-medium ${uiTokens.color.headingText}`}`}>{value}</dd>
    </div>
  )
}

function ProductTruthPanel({ product }: { product: ProductInfo | undefined }) {
  return (
    <aside className={`self-start ${uiTokens.radius.panel} border ${uiTokens.color.border} ${uiTokens.color.surfaceMuted} p-5`}>
      <div className="grid gap-6 xl:sticky xl:top-20">
        <section>
          <div className="flex items-center justify-between">
            <h2 className={uiTokens.typography.sectionTitle}>Product Truth 요약</h2>
            <span className={`${uiTokens.radius.chip} border ${uiTokens.color.successBorder} ${uiTokens.color.successSurface} px-2 py-1 text-xs font-bold uppercase leading-none ${uiTokens.color.success}`}>Verified</span>
          </div>

          <div className={`mt-2 ${uiTokens.radius.panel} border ${uiTokens.color.borderStrong} ${uiTokens.color.surface} ${uiTokens.spacing.cardCompact} ${uiTokens.shadow.panel}`}>
            <div className="flex items-center gap-2">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center ${uiTokens.radius.panel} ${uiTokens.color.primarySurface} ${uiTokens.color.primary}`}>
                <BadgeCheck size={22} />
              </div>
              <div>
                <h3 className={uiTokens.typography.cardTitle}>{product ? product.productName : '상품을 선택해 주세요'}</h3>
                <div className={`mt-0.5 flex items-center gap-1 ${uiTokens.typography.helper}`}>
                  <span>ID: {product ? String(product.productId) : '-'}</span>
                </div>
              </div>
            </div>

            <dl className="mt-4 grid gap-4">
              <ProductFactRow label="상품 코드" value={product ? product.productCode : '-'} />
              <ProductFactRow label="상품군" value={product ? product.productCategory : '-'} emphasized />
              <ProductFactRow label="상품 ID" value={product ? String(product.productId) : '-'} />
            </dl>
          </div>
        </section>

        <section>
          <h2 className={uiTokens.typography.tableHeader}>주요 준법 체크리스트</h2>
          <div className="mt-4 grid gap-2">
            <div className={`${uiTokens.radius.compact} border-l-4 border-amber-500 ${uiTokens.color.surface} py-3 pl-4 pr-3 ${uiTokens.shadow.panel}`}>
              <div className={`flex items-center gap-1 text-xs font-bold leading-4 ${uiTokens.color.warning}`}>
                <AlertTriangle size={18} />
                표현 근거 확인
              </div>
              <p className={`mt-1 ${uiTokens.typography.body}`}>소비자가 오인할 수 있는 최상급·단정적 표현은 객관적 근거와 함께 사용해야 합니다.</p>
            </div>
            <div className={`${uiTokens.radius.compact} border-l-4 border-blue-700 ${uiTokens.color.surface} py-3 pl-4 pr-3 ${uiTokens.shadow.panel}`}>
              <div className={`flex items-center gap-1 text-xs font-bold leading-4 ${uiTokens.color.primary}`}>
                <Info size={18} />
                조건 고지 확인
              </div>
              <p className={`mt-1 ${uiTokens.typography.body}`}>상품별 세부 조건과 제한 사항이 원문에 충분히 설명되었는지 확인합니다.</p>
            </div>
          </div>
        </section>
      </div>
    </aside>
  )
}

export function ContentCreatePage() {
  const [request, setRequest] = useState<RequestState>(initialRequest)
  const [products, setProducts] = useState<ProductInfo[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const plannedDateInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { user } = useAuth()
  const todayDate = getTodayInputDate()
  const selectedProductOptions = useMemo(
    () => products.filter((product) => product.productCategory === request.productCategory),
    [products, request.productCategory],
  )
  const selectedProduct = useMemo(
    () => products.find((product) => product.productId === request.productId),
    [products, request.productId],
  )

  useEffect(() => {
    let cancelled = false

    fetchProductInfo().then((nextProducts) => {
      if (cancelled) {
        return
      }

      setProducts(nextProducts)
      setRequest((current) => {
        const currentProductStillAvailable = nextProducts.some((product) => (
          product.productId === current.productId
          && product.productCategory === current.productCategory
        ))

        if (currentProductStillAvailable) {
          return current
        }

        return {
          ...current,
          productId: nextProducts.find((product) => product.productCategory === current.productCategory)?.productId ?? 0,
        }
      })
    }).catch(() => {
      if (!cancelled) {
        setErrorMessage('상품 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  const updateField = <Key extends keyof RequestState>(field: Key, value: RequestState[Key]) => {
    setRequest((current) => ({ ...current, [field]: value }))
  }

  const updateProductCategory = (productCategory: string) => {
    const nextProductId = products.find((product) => product.productCategory === productCategory)?.productId ?? 0

    setRequest((current) => ({
      ...current,
      productCategory,
      productId: nextProductId,
    }))
  }

  const toggleChannel = (value: string) => {
    setRequest((current) => ({ ...current, channels: [value] }))
  }

  const submitRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')

    if (request.productId === 0) {
      setErrorMessage('상품을 선택해 주세요.')
      return
    }

    setIsSubmitting(true)

    try {
      await registerContent(createContentRegisterRequest(request, user.userId))
      navigate('/compliance-review')
    } catch {
      setErrorMessage('콘텐츠 등록에 실패했습니다. 입력값을 확인한 뒤 다시 시도해 주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openPlannedDatePicker = () => {
    const input = plannedDateInputRef.current
    if (!input) {
      return
    }

    const inputWithPicker = input as HTMLInputElement & { showPicker?: () => void }
    if (inputWithPicker.showPicker) {
      inputWithPicker.showPicker()
      return
    }

    input.focus()
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="flex justify-center">
        <div className="w-full max-w-[800px]">
          <PageHeader
            eyebrow="Content Registration > 신규 심의 요청"
            title="신규 콘텐츠 심의 요청"
            description="홍보 콘텐츠의 상세 내용을 입력하고 연결된 Product Truth Layer를 확인하세요."
          />

          {errorMessage && (
            <div className={`mb-6 ${uiTokens.radius.panel} border border-red-200 bg-red-50 ${uiTokens.spacing.cardCompact}`}>
              <p className={`font-bold ${uiTokens.color.danger}`}>{errorMessage}</p>
            </div>
          )}

          <form className={`${uiTokens.radius.panel} border ${uiTokens.color.borderStrong} ${uiTokens.color.surface} ${uiTokens.spacing.card} ${uiTokens.shadow.panel}`} onSubmit={submitRequest}>
            <div className="grid gap-x-6 gap-y-6 md:grid-cols-2">
              <FieldShell label="콘텐츠 제목" className="md:col-span-2">
                <input
                  className={`${controlClass} h-[41px]`}
                  placeholder="예: 신규 상품 프로모션 앱푸시"
                  value={request.title}
                  onChange={(event) => updateField('title', event.target.value)}
                />
              </FieldShell>

              <FieldShell label="원문 입력" className="md:col-span-2">
                <textarea
                  className={`min-h-[162px] w-full resize-none ${uiTokens.radius.control} border ${uiTokens.color.borderStrong} ${uiTokens.color.surface} px-4 py-2 text-sm font-normal leading-6 ${uiTokens.color.headingText} outline-none transition placeholder:text-slate-500 focus:border-blue-700 focus:ring-2 focus:ring-blue-50`}
                  placeholder="검토를 요청할 원문 콘텐츠를 입력해 주세요..."
                  value={request.originalText}
                  onChange={(event) => updateField('originalText', event.target.value)}
                />
              </FieldShell>

              <SelectField label="상품군" options={productCategoryOptions} value={request.productCategory} onChange={updateProductCategory} />

              <ProductSelectField options={selectedProductOptions} value={request.productId} onChange={(value) => updateField('productId', value)} />

              <FieldShell label="배포 예정일">
                <span className="relative block">
                  <input
                    ref={plannedDateInputRef}
                    className={`${controlClass} pr-11 [color-scheme:light] [&::-webkit-calendar-picker-indicator]:opacity-0`}
                    min={todayDate}
                    type="date"
                    value={request.plannedPublishDate}
                    onChange={(event) => updateField('plannedPublishDate', event.target.value)}
                  />
                  <button
                    aria-label="배포 예정일 선택"
                    className={`absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center ${uiTokens.radius.compact} ${uiTokens.color.headingText} transition hover:bg-slate-100`}
                    type="button"
                    onClick={openPlannedDatePicker}
                  >
                    <CalendarDays size={18} />
                  </button>
                </span>
              </FieldShell>

              <SelectField label="긴급도" options={['보통', '긴급', '낮음']} value={request.urgency} onChange={(value) => updateField('urgency', value)} />

              <div className="grid gap-1 md:col-span-2">
                <span className={labelClass}>채널</span>
                <div className="flex flex-wrap gap-1">
                  {channelOptions.map((channel) => (
                    <TagButton key={channel} label={channel} selected={request.channels.includes(channel)} onClick={() => toggleChannel(channel)} />
                  ))}
                </div>
              </div>
            </div>

            <div className={`mt-6 flex flex-col gap-5 border-t ${uiTokens.color.borderStrong} pt-6 md:flex-row md:items-center md:justify-between`}>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <div className="flex items-center gap-1">
                  <span className={uiTokens.typography.helper}>RAG Index 버전</span>
                  <span className={`font-mono text-sm font-medium leading-5 ${uiTokens.color.headingText}`}>v2024.11.05</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={uiTokens.typography.helper}>적용 Rule 수</span>
                  <span className={`text-sm font-medium leading-6 ${uiTokens.color.headingText}`}>142개</span>
                </div>
              </div>

              <Button className="h-11 min-w-[180px]" type="submit" disabled={isSubmitting || request.productId === 0}>
                <span>{isSubmitting ? '등록 중' : '심의 요청 제출'}</span>
                <Send size={18} />
              </Button>
            </div>
          </form>
        </div>
      </section>

      <ProductTruthPanel product={selectedProduct} />
    </div>
  )
}
