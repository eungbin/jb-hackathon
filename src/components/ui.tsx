import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { uiTokens } from '../design/tokens'
import type { InputStatus, LearningStatus, ProductStatus, ReviewDecision, RiskLevel } from '../types'
import { decisionLabels, inputStatusLabels, learningLabels, productStatusLabels, riskLabels } from '../utils/labels'

type Tone = 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray'

export type DataTableSortDirection = 'asc' | 'desc' | null

export type DataTableHeader =
  | string
  | {
      label: string
      sortKey?: string
      sortable?: boolean
    }

export type DataTableSectionHeader = {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
}

export type DataTablePagination = {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  itemLabel?: string
}

export function getNextDataTableSortState(
  currentSortKey: string | null | undefined,
  currentSortDirection: DataTableSortDirection | undefined,
  selectedSortKey: string,
) {
  if (currentSortKey !== selectedSortKey) {
    return { sortKey: selectedSortKey, sortDirection: 'asc' as const }
  }

  if (currentSortDirection === 'asc') {
    return { sortKey: selectedSortKey, sortDirection: 'desc' as const }
  }

  if (currentSortDirection === 'desc') {
    return { sortKey: null, sortDirection: null }
  }

  return { sortKey: selectedSortKey, sortDirection: 'asc' as const }
}

const toneClasses: Record<Tone, string> = {
  blue: `${uiTokens.color.primaryBorder} ${uiTokens.color.primarySurface} ${uiTokens.color.primary}`,
  green: `${uiTokens.color.successBorder} ${uiTokens.color.successSurface} ${uiTokens.color.success}`,
  orange: `${uiTokens.color.warningBorder} ${uiTokens.color.warningSurface} ${uiTokens.color.warning}`,
  red: `${uiTokens.color.dangerBorder} ${uiTokens.color.dangerSurface} ${uiTokens.color.danger}`,
  purple: `${uiTokens.color.infoBorder} ${uiTokens.color.infoSurface} ${uiTokens.color.info}`,
  gray: `${uiTokens.color.border} ${uiTokens.color.surfaceMuted} text-slate-600`,
}

const toneAccentClasses: Record<Tone, string> = {
  blue: 'border-l-blue-700',
  green: 'border-l-emerald-600',
  orange: 'border-l-amber-500',
  red: 'border-l-rose-600',
  purple: 'border-l-violet-600',
  gray: 'border-l-slate-300',
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow && <p className={`text-xs font-bold uppercase tracking-wide ${uiTokens.color.primary}`}>{eyebrow}</p>}
        <h1 className={`mt-2 ${uiTokens.typography.pageTitle}`}>{title}</h1>
        {description && <p className={`mt-2 max-w-3xl ${uiTokens.typography.body} ${uiTokens.color.mutedText}`}>{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Card({
  title,
  subtitle,
  children,
  className = '',
}: {
  title?: string
  subtitle?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`${uiTokens.radius.panel} border ${uiTokens.color.border} ${uiTokens.color.surface} ${uiTokens.spacing.card} ${uiTokens.shadow.panel} ${className}`}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h2 className={uiTokens.typography.cardTitle}>{title}</h2>}
          {subtitle && <p className={`mt-1 ${uiTokens.typography.helper}`}>{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  )
}

export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
}) {
  const classes = {
    primary: `${uiTokens.color.primaryBg} text-white ${uiTokens.color.primaryBgHover}`,
    secondary: `border ${uiTokens.color.border} ${uiTokens.color.surface} ${uiTokens.color.bodyText} hover:border-blue-200 hover:text-blue-700`,
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
  }
  return (
    <button
      {...props}
      type={type}
      className={`inline-flex h-10 items-center justify-center gap-2 ${uiTokens.radius.control} px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${classes[variant]} ${className}`}
    />
  )
}

export function Badge({
  children,
  tone = 'gray',
}: {
  children: ReactNode
  tone?: Tone
}) {
  return (
    <span className={`inline-flex items-center ${uiTokens.radius.chip} border px-2.5 py-1 text-xs font-bold ${toneClasses[tone]}`}>
      {children}
    </span>
  )
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  const tone: Record<RiskLevel, Tone> = {
    LOW: 'green',
    MEDIUM: 'orange',
    HIGH: 'red',
    CRITICAL: 'purple',
  }
  return <Badge tone={tone[level]}>{riskLabels[level]}</Badge>
}

export function DecisionBadge({ decision }: { decision: ReviewDecision }) {
  const tone: Record<ReviewDecision, Tone> = {
    APPROVED: 'green',
    CONDITIONALLY_APPROVED: 'blue',
    REVISION_REQUESTED: 'orange',
    REJECTED: 'red',
    NEED_MORE_INFO: 'purple',
  }
  return <Badge tone={tone[decision]}>{decisionLabels[decision]}</Badge>
}

export function LearningBadge({ status }: { status: LearningStatus }) {
  const tone = status === 'EXCLUDED' ? 'red' : status.includes('APPROVED') ? 'green' : status.includes('REDACTED') ? 'blue' : 'orange'
  return <Badge tone={tone}>{learningLabels[status]}</Badge>
}

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const tone: Record<ProductStatus, Tone> = {
    ACTIVE: 'green',
    SCHEDULED: 'blue',
    INACTIVE: 'gray',
  }
  return <Badge tone={tone[status]}>{productStatusLabels[status]}</Badge>
}

export function InputStatusBadge({ status }: { status: InputStatus }) {
  return <Badge tone={status === 'COMPLETE' ? 'green' : 'orange'}>{inputStatusLabels[status]}</Badge>
}

export function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <label className={`grid ${uiTokens.spacing.field} ${uiTokens.typography.label}`}>
      {label}
      <input
        className={`h-10 ${uiTokens.radius.control} border ${uiTokens.color.borderStrong} ${uiTokens.color.surface} px-3 text-sm font-normal ${uiTokens.color.headingText} outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100`}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

export function TextareaField({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  rows?: number
}) {
  return (
    <label className={`grid ${uiTokens.spacing.field} ${uiTokens.typography.label}`}>
      {label}
      <textarea
        className={`${uiTokens.radius.control} border ${uiTokens.color.borderStrong} ${uiTokens.color.surface} px-3 py-2 text-sm font-normal leading-6 ${uiTokens.color.headingText} outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100`}
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

export function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
}) {
  return (
    <label className={`grid ${uiTokens.spacing.field} ${uiTokens.typography.label}`}>
      {label}
      <select
        className={`h-10 ${uiTokens.radius.control} border ${uiTokens.color.borderStrong} ${uiTokens.color.surface} px-3 text-sm font-normal ${uiTokens.color.headingText} outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function DataTable({
  headers,
  children,
  header,
  filters,
  pagination,
  sortKey,
  sortDirection = null,
  onSortChange,
  className = '',
  tableContainerClassName = '',
}: {
  headers: DataTableHeader[]
  children: ReactNode
  header?: DataTableSectionHeader
  filters?: ReactNode
  pagination?: DataTablePagination
  sortKey?: string | null
  sortDirection?: DataTableSortDirection
  onSortChange?: (sortKey: string | null, sortDirection: DataTableSortDirection) => void
  className?: string
  tableContainerClassName?: string
}) {
  const pageNumbers = pagination ? Array.from({ length: pagination.totalPages }, (_, index) => index + 1) : []
  const startItem = pagination && pagination.totalItems > 0 ? (pagination.currentPage - 1) * pagination.pageSize + 1 : 0
  const endItem = pagination ? Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems) : 0

  return (
    <div className={className}>
      {header && (
        <div className={`flex flex-col gap-3 border-b ${uiTokens.color.border} px-5 py-4 sm:flex-row sm:items-center sm:justify-between`}>
          <div>
            <h2 className={uiTokens.typography.sectionTitle}>{header.title}</h2>
            {header.description && <p className={`mt-1 ${uiTokens.typography.helper}`}>{header.description}</p>}
          </div>
          {header.actions && <div className="flex flex-wrap gap-2">{header.actions}</div>}
        </div>
      )}
      {filters && <div className={`border-b ${uiTokens.color.border} p-5`}>{filters}</div>}
      <div className={`overflow-x-auto ${tableContainerClassName}`}>
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className={`border-b ${uiTokens.color.border} ${uiTokens.color.surfaceMuted} ${uiTokens.typography.tableHeader}`}>
              {headers.map((tableHeader) => {
                const normalizedHeader = typeof tableHeader === 'string' ? { label: tableHeader } : tableHeader
                const isSortable = Boolean(normalizedHeader.sortKey && normalizedHeader.sortable !== false && onSortChange)
                const isActive = Boolean(isSortable && sortDirection && normalizedHeader.sortKey === sortKey)

                return (
                  <th
                    key={normalizedHeader.label}
                    aria-sort={isActive ? (sortDirection === 'asc' ? 'ascending' : 'descending') : undefined}
                    className={`${uiTokens.spacing.tableCellRelaxed} font-bold`}
                  >
                    {isSortable && normalizedHeader.sortKey ? (
                      <button
                        className={`inline-flex items-center gap-1.5 text-left font-bold transition ${isActive ? uiTokens.color.primary : uiTokens.color.mutedText} hover:text-blue-700`}
                        type="button"
                        onClick={() => {
                          const nextSort = getNextDataTableSortState(sortKey, sortDirection, normalizedHeader.sortKey as string)

                          onSortChange?.(nextSort.sortKey, nextSort.sortDirection)
                        }}
                      >
                        {normalizedHeader.label}
                        {isActive ? sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} /> : <ArrowUpDown size={14} className={uiTokens.color.subtleText} />}
                      </button>
                    ) : (
                      normalizedHeader.label
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className={`divide-y divide-slate-100 ${uiTokens.color.bodyText}`}>{children}</tbody>
        </table>
      </div>
      {pagination && (
        <div className={`flex flex-col gap-4 border-t ${uiTokens.color.border} px-5 py-4 sm:flex-row sm:items-center sm:justify-between`}>
          <p className={uiTokens.typography.helper}>
            {pagination.itemLabel ?? '항목'} {startItem}-{endItem} / 총 {pagination.totalItems}개
          </p>
          {pagination.totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                aria-label="이전 페이지"
                className={`flex h-8 w-8 items-center justify-center ${uiTokens.radius.compact} border ${uiTokens.color.border} ${uiTokens.color.mutedText} disabled:cursor-not-allowed disabled:opacity-40`}
                disabled={pagination.currentPage === 1}
                type="button"
                onClick={() => pagination.onPageChange(Math.max(1, pagination.currentPage - 1))}
              >
                <ChevronLeft size={16} />
              </button>
              {pageNumbers.map((page) => (
                <button
                  key={page}
                  className={`h-8 w-8 ${uiTokens.radius.compact} text-xs font-extrabold ${page === pagination.currentPage ? `${uiTokens.color.primaryBg} text-white` : `border ${uiTokens.color.border} ${uiTokens.color.surface} ${uiTokens.color.mutedText}`}`}
                  type="button"
                  onClick={() => pagination.onPageChange(page)}
                >
                  {page}
                </button>
              ))}
              <button
                aria-label="다음 페이지"
                className={`flex h-8 w-8 items-center justify-center ${uiTokens.radius.compact} border ${uiTokens.color.border} ${uiTokens.color.mutedText} disabled:cursor-not-allowed disabled:opacity-40`}
                disabled={pagination.currentPage === pagination.totalPages}
                type="button"
                onClick={() => pagination.onPageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function Drawer({
  title,
  open,
  onClose,
  children,
  footer,
  width = 'md',
}: {
  title: string
  open: boolean
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  width?: 'sm' | 'md' | 'lg'
}) {
  if (!open) {
    return null
  }
  const widthClasses = {
    sm: 'max-w-[400px]',
    md: 'max-w-[480px]',
    lg: 'max-w-[520px]',
  }

  return (
    <div className="fixed inset-0 z-50">
      <button className="absolute inset-0 bg-slate-950/30" aria-label="닫기" type="button" onClick={onClose} />
      <aside className={`absolute right-0 top-0 flex h-full w-full ${widthClasses[width]} flex-col border-l ${uiTokens.color.borderStrong} ${uiTokens.color.surface} ${uiTokens.shadow.panel}`}>
        <div className={`flex items-center justify-between border-b ${uiTokens.color.border} px-6 py-4`}>
          <h2 className={uiTokens.typography.cardTitle}>{title}</h2>
          <Button variant="ghost" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className={`border-t ${uiTokens.color.border} px-6 py-4`}>{footer}</div>}
      </aside>
    </div>
  )
}

export function MetricCard({
  label,
  value,
  helperText,
  tone = 'blue',
  className = '',
}: {
  label: string
  value: string | number
  helperText?: string
  tone?: Tone
  className?: string
}) {
  return (
    <Card className={`min-h-[118px] border-l-4 p-5 ${toneAccentClasses[tone]} ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-xs font-semibold ${uiTokens.color.mutedText}`}>{label}</p>
          <p className={`mt-3 ${uiTokens.typography.metricValue}`}>{value}</p>
          {helperText && <p className={`mt-1 ${uiTokens.typography.helper} ${uiTokens.color.subtleText}`}>{helperText}</p>}
        </div>
        <span className={`h-9 w-9 rounded-md border ${toneClasses[tone]}`} />
      </div>
    </Card>
  )
}
