import { Badge, Button, Drawer, Field, SelectField, TextareaField } from '../../../components/ui'
import { uiTokens } from '../../../design/tokens'
import type { ProductDocumentType, ProductFact, SourceDocument } from '../../../types'
import { documentTypeLabels } from '../../../utils/labels'

const documentTypeOptions: ProductDocumentType[] = ['PRODUCT_DESCRIPTION', 'TERMS', 'RATE_TABLE', 'FEE_TABLE', 'DISCLOSURE_GUIDE', 'OTHER']
const factTypeOptions = ['RATE', 'ELIGIBILITY', 'LIMIT', 'FEE', 'TERM', 'BENEFIT', 'RISK_NOTICE', 'CHANNEL', 'OTHER']

type ProductFactDrawerProps = {
  factDraft: ProductFact | null
  factIndex: number | null
  sourceDocuments: SourceDocument[]
  onChange: (fact: ProductFact) => void
  onClose: () => void
  onDelete?: () => void
  onSave: () => void
}

export function ProductFactDrawer({ factDraft, factIndex, sourceDocuments, onChange, onClose, onDelete, onSave }: ProductFactDrawerProps) {
  const currentFactTypeOptions = factDraft?.factType && !factTypeOptions.includes(factDraft.factType)
    ? [factDraft.factType, ...factTypeOptions]
    : factTypeOptions

  return (
    <Drawer
      title="Product Fact 입력 / 수정"
      open={factDraft !== null}
      onClose={onClose}
      width="lg"
      footer={
        <div className={`flex gap-2 ${factIndex !== null && onDelete ? 'justify-between' : 'justify-end'}`}>
          {factIndex !== null && onDelete && (
            <Button variant="danger" onClick={onDelete}>삭제</Button>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>{factIndex === null ? '취소' : '닫기'}</Button>
            <Button onClick={onSave}>{factIndex === null ? 'Fact 추가' : '변경 적용'}</Button>
          </div>
        </div>
      }
    >
      {factDraft && (
        <div className="grid gap-7">
          <div>
            <p className={`text-sm font-bold ${uiTokens.color.primary}`}>{factDraft.factName || 'Product Fact'}</p>
            {factDraft.factType && (
              <div className="mt-4">
                <Badge>{factDraft.factType}</Badge>
              </div>
            )}
          </div>

          <section className="grid gap-4">
            <h3 className={`border-b ${uiTokens.color.borderStrong} pb-2 ${uiTokens.typography.label} ${uiTokens.color.mutedText}`}>1. FACT 기본정보</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField label="Fact Type*" value={factDraft.factType} onChange={(value) => onChange({ ...factDraft, factType: value })} options={currentFactTypeOptions.map((type) => ({ value: type, label: type }))} />
              <Field label="Product Fact*" value={factDraft.factName} onChange={(value) => onChange({ ...factDraft, factName: value })} />
              <div>
                <p className={`${uiTokens.typography.label} ${uiTokens.color.mutedText}`}>상품명</p>
                <p className={`mt-1 text-sm font-semibold ${uiTokens.color.headingText}`}>{factDraft.productName || '-'}</p>
              </div>
              <div>
                <p className={`${uiTokens.typography.label} ${uiTokens.color.mutedText}`}>상품 코드</p>
                <p className={`mt-1 text-sm font-semibold ${uiTokens.color.headingText}`}>{factDraft.productCode || '-'}</p>
              </div>
              <div className="md:col-span-2">
                <p className={`${uiTokens.typography.label} ${uiTokens.color.mutedText}`}>Product Truth 버전</p>
                <p className={`mt-1 text-sm font-semibold ${uiTokens.color.headingText}`}>{factDraft.productTruthVersion || '-'}</p>
              </div>
            </div>
          </section>

          <section className="grid gap-4">
            <h3 className={`border-b ${uiTokens.color.borderStrong} pb-2 ${uiTokens.typography.label} ${uiTokens.color.mutedText}`}>2. 값 / 조건</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Value*" value={factDraft.value} onChange={(value) => onChange({ ...factDraft, value })} />
              <Field label="Unit*" value={factDraft.unit} onChange={(value) => onChange({ ...factDraft, unit: value })} />
              <div className="md:col-span-2">
                <Field label="표시값" value={factDraft.displayValue ?? ''} onChange={(value) => onChange({ ...factDraft, displayValue: value })} />
              </div>
              <div className="md:col-span-2">
                <Field label="Condition" value={factDraft.condition ?? ''} onChange={(value) => onChange({ ...factDraft, condition: value })} />
              </div>
            </div>
          </section>

          <section className="grid gap-4">
            <h3 className={`border-b ${uiTokens.color.borderStrong} pb-2 ${uiTokens.typography.label} ${uiTokens.color.mutedText}`}>3. 근거 문서 및 SOURCE LOCATOR</h3>
            <SelectField label="근거 문서*" value={factDraft.sourceDocumentId} onChange={(value) => onChange({ ...factDraft, sourceDocumentId: value })} options={sourceDocuments.map((document) => ({ value: document.documentId, label: document.fileName }))} />
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField label="문서 유형" value={factDraft.documentType ?? ''} onChange={(value) => onChange({ ...factDraft, documentType: value as ProductDocumentType })} options={documentTypeOptions.map((type) => ({ value: type, label: documentTypeLabels[type] }))} />
              <Field label="문서 버전" value={factDraft.documentVersion ?? ''} onChange={(value) => onChange({ ...factDraft, documentVersion: value })} />
              <Field label="페이지*" value={factDraft.page ?? ''} onChange={(value) => onChange({ ...factDraft, page: value })} />
              <Field label="섹션 / 조항" value={factDraft.section ?? ''} onChange={(value) => onChange({ ...factDraft, section: value })} />
              <div className="md:col-span-2">
                <Field label="Source Locator 표시값*" value={factDraft.sourceLocator} onChange={(value) => onChange({ ...factDraft, sourceLocator: value })} />
              </div>
              <div className="md:col-span-2">
                <TextareaField label="근거 원문 메모" value={factDraft.sourceMemo ?? ''} onChange={(value) => onChange({ ...factDraft, sourceMemo: value })} rows={4} />
              </div>
            </div>
          </section>
        </div>
      )}
    </Drawer>
  )
}
