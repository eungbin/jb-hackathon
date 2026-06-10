import { Button, Drawer, Field, SelectField, TextareaField } from '../../../components/ui'
import type { ProductDocumentType, SourceDocument } from '../../../types'
import { documentTypeLabels } from '../../../utils/labels'

const documentTypeOptions: ProductDocumentType[] = ['PRODUCT_DESCRIPTION', 'TERMS', 'RATE_TABLE', 'FEE_TABLE', 'DISCLOSURE_GUIDE', 'OTHER']

type SourceDocumentDrawerProps = {
  documentDraft: SourceDocument | null
  onChange: (document: SourceDocument) => void
  onClose: () => void
  onSave: () => void
}

export function SourceDocumentDrawer({ documentDraft, onChange, onClose, onSave }: SourceDocumentDrawerProps) {
  return (
    <Drawer
      title="근거 문서 입력 / 수정"
      open={documentDraft !== null}
      onClose={onClose}
      width="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>닫기</Button>
          <Button onClick={onSave}>변경 적용</Button>
        </div>
      }
    >
      {documentDraft && (
        <div className="grid gap-5">
          <div>
            <p className="text-sm font-medium text-slate-500">파일명</p>
            <p className="mt-2 break-words text-sm font-semibold text-slate-950">{documentDraft.fileName}</p>
          </div>
          <SelectField label="문서 유형" value={documentDraft.documentType} onChange={(value) => onChange({ ...documentDraft, documentType: value as ProductDocumentType })} options={documentTypeOptions.map((type) => ({ value: type, label: documentTypeLabels[type] }))} />
          <TextareaField label="문서 설명" value={documentDraft.description ?? ''} onChange={(value) => onChange({ ...documentDraft, description: value })} rows={3} />
          <Field label="비고" value={documentDraft.note ?? ''} onChange={(value) => onChange({ ...documentDraft, note: value })} />
        </div>
      )}
    </Drawer>
  )
}
