import { useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Plus, ShieldAlert } from 'lucide-react'
import { Button, Card, DataTable, Field, InputStatusBadge, PageHeader, TextareaField } from '../../../components/ui'
import { uiTokens } from '../../../design/tokens'
import type { ProductFact, SourceDocument } from '../../../types'
import { documentTypeLabels, factTypeLabels } from '../../../utils/labels'
import { useAuth } from '../../auth/AuthContext'
import { analyzeProductFiles, createProduct } from '../api'
import { ProductFactDrawer } from '../components/ProductFactDrawer'
import { SourceDocumentDrawer } from '../components/SourceDocumentDrawer'
import { applyProductAiAnalysisResult, createInitialProductForm, emptyFact, statusFromDocument, statusFromFact } from '../utils/productForm'
import { determineProductStatus, validateProductCreate, type ProductCreateForm } from '../utils/productCreateValidation'

export function ProductTruthCreatePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState<ProductCreateForm>(() => createInitialProductForm())
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [registeredStatus, setRegisteredStatus] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [documentIndex, setDocumentIndex] = useState<number | null>(null)
  const [documentDraft, setDocumentDraft] = useState<SourceDocument | null>(null)
  const [factIndex, setFactIndex] = useState<number | null>(null)
  const [factDraft, setFactDraft] = useState<ProductFact | null>(null)

  const setField = (field: keyof ProductCreateForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const setProductCategory = (value: string) => {
    setForm((current) => ({ ...current, category: value, subCategory: value }))
  }

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(event.currentTarget.files ?? [])

    setUploadedFiles(nextFiles)
    setRegisteredStatus(null)

    if (nextFiles.length === 0) {
      return
    }

    setForm((current) => ({
      ...current,
      sourceDocuments: nextFiles.map((file, index) => {
        const document: SourceDocument = {
          documentId: `DOC-${String(index + 1).padStart(3, '0')}`,
          fileName: file.name,
          documentType: '',
          version: current.versionLabel,
          effectiveStartDate: current.effectiveStartDate,
          description: '',
          note: '',
          inputStatus: 'MISSING_REQUIRED',
        }

        return {
          ...document,
          inputStatus: statusFromDocument(document),
        }
      }),
      productFacts: [],
    }))
  }

  const analyzeDraft = async () => {
    if (uploadedFiles.length === 0) {
      setErrors(['AI 초안 작성을 위해 근거 문서를 먼저 업로드해 주세요.'])
      return
    }

    setIsAnalyzing(true)
    setErrors([])

    try {
      const analysis = await analyzeProductFiles(uploadedFiles)
      setForm((current) => applyProductAiAnalysisResult(current, uploadedFiles, analysis))
      setRegisteredStatus('근거문서 기반 AI 초안 작성이 완료되었습니다. 내용을 확인한 뒤 등록해 주세요.')
    } catch {
      setErrors(['AI 분석 요청에 실패했습니다. 파일 형식과 용량을 확인한 뒤 다시 시도해 주세요.'])
    } finally {
      setIsAnalyzing(false)
    }
  }

  const registration = async () => {
    const result = validateProductCreate(form)
    setErrors(result.errors)

    if (!result.ok) {
      return
    }

    setIsSubmitting(true)

    try {
      const productId = await createProduct(form, uploadedFiles, user.userId)
      setRegisteredStatus(`상품 등록이 완료되었습니다. Product ID: ${productId}`)
      setErrors([])
    } catch {
      setErrors(['상품 등록 요청에 실패했습니다. 입력값과 업로드 파일을 확인한 뒤 다시 시도해 주세요.'])
    } finally {
      setIsSubmitting(false)
    }
  }

  const saveDocument = () => {
    if (documentDraft === null || documentIndex === null) {
      return
    }
    const nextDocument = { ...documentDraft, inputStatus: statusFromDocument(documentDraft) }
    setForm((current) => ({
      ...current,
      sourceDocuments: current.sourceDocuments.map((document, index) => (index === documentIndex ? nextDocument : document)),
    }))
    setDocumentDraft(null)
    setDocumentIndex(null)
  }

  const saveFact = () => {
    if (factDraft === null) {
      return
    }
    const nextFact = { ...factDraft, inputStatus: statusFromFact(factDraft) }
    setForm((current) => ({
      ...current,
      productFacts: factIndex === null ? [...current.productFacts, nextFact] : current.productFacts.map((fact, index) => (index === factIndex ? nextFact : fact)),
    }))
    setFactDraft(null)
    setFactIndex(null)
  }

  return (
    <>
      <PageHeader
        eyebrow="Product Truth Layer > 신규 상품 등록"
        title="신규 상품 등록"
        description="Claim 검증에 사용할 금융상품 기준정보와 근거 문서를 직접 등록합니다."
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('/product-truth')}>
              취소
            </Button>
            <Button disabled={isSubmitting} onClick={registration}>{isSubmitting ? '등록 중' : '등록'}</Button>
          </>
        }
      />
      {errors.length > 0 && (
        <Card className="mb-6 border-rose-200 bg-rose-50">
          <div className="flex items-start gap-3 text-rose-800">
            <ShieldAlert size={20} />
            <div>
              <p className="font-bold">확인 필요</p>
              <ul className="mt-2 list-disc pl-5 text-sm">
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}
      {registeredStatus && (
        <Card className="mb-6 border-emerald-200 bg-emerald-50">
          <div className="flex items-center gap-3 text-emerald-800">
            <CheckCircle2 size={20} />
            <p className="font-bold">등록 결과: {registeredStatus}</p>
          </div>
        </Card>
      )}
      <div className={`${uiTokens.spacing.stack} xl:grid-cols-[250px_minmax(0,936px)_387px]`}>
        <Card title="등록 단계">
          <div className={`mb-5 ${uiTokens.radius.panel} ${uiTokens.color.primarySurface} ${uiTokens.spacing.cardCompact}`}>
            <p className={`${uiTokens.typography.tableHeader} ${uiTokens.color.primary}`}>Completion</p>
            <p className={`mt-1 ${uiTokens.typography.metricValue} ${uiTokens.color.primary}`}>72%</p>
            <div className="mt-3 h-2 rounded-full bg-blue-100">
              <div className="h-2 w-[72%] rounded-full bg-blue-700" />
            </div>
          </div>
          <ol className={`${uiTokens.spacing.stackCompact} ${uiTokens.typography.label}`}>
            {['근거 문서', '상품 기본정보', 'Product Fact'].map((step, index) => (
              <li key={step} className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-xs text-blue-700">{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </Card>
        <div className={uiTokens.spacing.stack}>
          <Card title="근거 문서">
            <label className={`mb-4 flex cursor-pointer items-center justify-center ${uiTokens.radius.compact} border border-dashed ${uiTokens.color.borderStrong} ${uiTokens.color.surfaceMuted} px-4 py-8 ${uiTokens.typography.label} ${uiTokens.color.mutedText}`}>
              파일 업로드 UI
              <input
                className="sr-only"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.hwp,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
              />
            </label>
            <DataTable headers={['문서명', '문서 유형', '상태', 'ACTION']}>
              {form.sourceDocuments.map((document, index) => (
                <tr key={document.documentId}>
                  <td className={`${uiTokens.spacing.tableCell} font-semibold ${uiTokens.color.headingText}`}>{document.fileName}</td>
                  <td className={uiTokens.spacing.tableCell}>{document.documentType ? documentTypeLabels[document.documentType] : '-'}</td>
                  <td className={uiTokens.spacing.tableCell}>
                    <InputStatusBadge status={document.inputStatus} />
                  </td>
                  <td className={uiTokens.spacing.tableCell}>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setDocumentIndex(index)
                        setDocumentDraft(document)
                      }}
                    >
                      수정
                    </Button>
                  </td>
                </tr>
              ))}
            </DataTable>
          </Card>
          <div className="flex justify-end">
            <Button variant="secondary" disabled={isAnalyzing || uploadedFiles.length === 0} onClick={analyzeDraft}>
              {isAnalyzing ? 'AI 초안 작성 중' : '근거문서 기반 AI 초안 작성'}
            </Button>
          </div>
          <Card title="상품 기본정보">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="상품명" value={form.productName} onChange={(value) => setField('productName', value)} />
              <Field label="상품 코드" value={form.productCode} onChange={(value) => setField('productCode', value)} />
              <Field label="상품 카테고리" value={form.subCategory} onChange={setProductCategory} />
            </div>
            <div className="mt-4">
              <TextareaField label="상품 설명" value={form.description} onChange={(value) => setField('description', value)} rows={4} />
            </div>
          </Card>
          <Card
            title="Product Fact"
            subtitle="상품 Claim 검증에 사용되는 기준값입니다."
          >
            <div className="mb-4 flex justify-end">
              <Button variant="secondary" onClick={() => {
                setFactIndex(null)
                setFactDraft(emptyFact(form))
              }}>
                <Plus size={16} />
                Product Fact 추가
              </Button>
            </div>
            <DataTable headers={['FACT TYPE', 'PRODUCT FACT', 'VALUE', 'UNIT', 'CONDITION', 'SOURCE LOCATOR', 'STATUS', 'ACTION']}>
              {form.productFacts.map((fact, index) => (
                <tr key={fact.factId}>
                  <td className={uiTokens.spacing.tableCell}>{fact.factType ? factTypeLabels[fact.factType] : '-'}</td>
                  <td className={`${uiTokens.spacing.tableCell} font-semibold ${uiTokens.color.headingText}`}>{fact.factName}</td>
                  <td className={uiTokens.spacing.tableCell}>{fact.value}</td>
                  <td className={uiTokens.spacing.tableCell}>{fact.unit}</td>
                  <td className={uiTokens.spacing.tableCell}>{fact.condition || '-'}</td>
                  <td className={uiTokens.spacing.tableCell}>{fact.sourceLocator || '-'}</td>
                  <td className={uiTokens.spacing.tableCell}>
                    <InputStatusBadge status={fact.inputStatus} />
                  </td>
                  <td className={uiTokens.spacing.tableCell}>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setFactIndex(index)
                        setFactDraft(fact)
                      }}
                    >
                      수정
                    </Button>
                  </td>
                </tr>
              ))}
            </DataTable>
          </Card>
        </div>
        <Card title="등록 요약" className="self-start">
          <dl className={`${uiTokens.spacing.stackCompact} text-sm`}>
            <div className="flex justify-between gap-4">
              <dt className={uiTokens.color.mutedText}>상품명</dt>
              <dd className={`font-semibold ${uiTokens.color.headingText}`}>{form.productName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className={uiTokens.color.mutedText}>버전</dt>
              <dd className={`font-semibold ${uiTokens.color.headingText}`}>{form.versionLabel}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className={uiTokens.color.mutedText}>근거 문서</dt>
              <dd className={`font-semibold ${uiTokens.color.headingText}`}>{form.sourceDocuments.length}건</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className={uiTokens.color.mutedText}>Product Fact</dt>
              <dd className={`font-semibold ${uiTokens.color.headingText}`}>{form.productFacts.length}건</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className={uiTokens.color.mutedText}>예상 상태</dt>
              <dd className={`font-semibold ${uiTokens.color.headingText}`}>{determineProductStatus(form.effectiveStartDate, '2026-06-01')}</dd>
            </div>
          </dl>
        </Card>
      </div>
      <SourceDocumentDrawer
        documentDraft={documentDraft}
        onChange={setDocumentDraft}
        onClose={() => setDocumentDraft(null)}
        onSave={saveDocument}
      />
      <ProductFactDrawer
        factDraft={factDraft}
        factIndex={factIndex}
        sourceDocuments={form.sourceDocuments}
        onChange={setFactDraft}
        onClose={() => setFactDraft(null)}
        onSave={saveFact}
      />
    </>
  )
}
