import type { ChangeEvent, FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import type { RiskLevel } from '../../../types'
import { Badge, Button, Card, DataTable, Drawer, Field, PageHeader, RiskBadge, SelectField, TextareaField } from '../../../components/ui'
import { uiTokens } from '../../../design/tokens'
import { updateTextField } from '../../../utils/formState'
import { createRule, fetchRulesSources, uploadRuleFile } from '../api'
import type { RuleCreateDraft, RuleRegistryRule, RulesSourcesData } from '../api'

type RuleDraftMode = 'create' | 'detail'

const riskOptions: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const pageSize = 5
type RuleFilters = {
  query: string
  risk: string
  triggerKeywords: string
}

const initialFilters: RuleFilters = {
  query: '',
  risk: 'ALL',
  triggerKeywords: '',
}

const emptyRuleDraft: RuleCreateDraft = {
  name: '',
  severity: '',
  triggerKeywords: '',
  requiredDisclosures: '',
}

function toRuleDraft(rule: RuleRegistryRule): RuleCreateDraft {
  return {
    name: rule.name,
    severity: rule.severity ?? '',
    triggerKeywords: rule.triggerKeywords.join(', '),
    requiredDisclosures: rule.requiredDisclosures === '-' ? '' : rule.requiredDisclosures,
  }
}

export function RulesSourcesPage() {
  const [data, setData] = useState<RulesSourcesData>({ rules: [], sourceDocuments: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [ruleDraft, setRuleDraft] = useState<RuleCreateDraft | null>(null)
  const [ruleDraftMode, setRuleDraftMode] = useState<RuleDraftMode>('create')
  const [isCreatingRule, setIsCreatingRule] = useState(false)
  const [isUploadingFile, setIsUploadingFile] = useState(false)
  const [filters, setFilters] = useState<RuleFilters>(initialFilters)
  const [appliedFilters, setAppliedFilters] = useState<RuleFilters>(initialFilters)
  const [currentPage, setCurrentPage] = useState(1)
  const setFilter = (field: keyof typeof filters, value: string) => {
    setFilters((current) => updateTextField(current, field, value))
  }
  const setRuleField = (field: keyof RuleCreateDraft, value: string) => {
    setRuleDraft((current) => (current ? updateTextField(current, field, value) : current))
  }

  useEffect(() => {
    let cancelled = false

    setIsLoading(true)
    fetchRulesSources().then((nextData) => {
      if (cancelled) {
        return
      }

      setData(nextData)
      setErrorMessage('')
    }).catch(() => {
      if (!cancelled) {
        setErrorMessage('Rules & Sources 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')
      }
    }).finally(() => {
      if (!cancelled) {
        setIsLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const filteredRules = data.rules.filter((rule) => {
    const query = appliedFilters.query.trim().toLowerCase()
    const triggerKeywords = appliedFilters.triggerKeywords.trim().toLowerCase()
    const searchableText = [rule.ruleUniqueId, rule.name, rule.requiredDisclosures].join(' ').toLowerCase()
    const triggerKeywordText = rule.triggerKeywords.join(' ').toLowerCase()

    return (
      (!query || searchableText.includes(query)) &&
      (appliedFilters.risk === 'ALL' || rule.severity === appliedFilters.risk) &&
      (!triggerKeywords || triggerKeywordText.includes(triggerKeywords))
    )
  })
  const totalPages = Math.max(1, Math.ceil(filteredRules.length / pageSize))
  const visiblePage = Math.min(currentPage, totalPages)
  const paginatedRules = filteredRules.slice((visiblePage - 1) * pageSize, visiblePage * pageSize)
  const applyFilters = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    setAppliedFilters(filters)
    setCurrentPage(1)
  }
  const resetFilters = () => {
    setFilters(initialFilters)
    setAppliedFilters(initialFilters)
    setCurrentPage(1)
  }
  const openCreateRule = () => {
    setRuleDraft({ ...emptyRuleDraft })
    setRuleDraftMode('create')
  }
  const openRuleDetails = (rule: RuleRegistryRule) => {
    setRuleDraft(toRuleDraft(rule))
    setRuleDraftMode('detail')
  }
  const closeRuleDrawer = () => {
    setRuleDraft(null)
  }
  const submitRule = async () => {
    if (!ruleDraft?.name.trim()) {
      setErrorMessage('룰 이름을 입력해 주세요.')
      return
    }

    setIsCreatingRule(true)
    setErrorMessage('')

    try {
      const ruleId = await createRule(ruleDraft)
      setStatusMessage(`룰 등록이 완료되었습니다. Rule ID: ${ruleId}`)
      closeRuleDrawer()
      setReloadKey((current) => current + 1)
    } catch {
      setErrorMessage('룰 등록 요청에 실패했습니다. 입력값을 확인한 뒤 다시 시도해 주세요.')
    } finally {
      setIsCreatingRule(false)
    }
  }
  const handleRuleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''

    if (!file) {
      return
    }

    setIsUploadingFile(true)
    setErrorMessage('')

    try {
      const ruleFileId = await uploadRuleFile(file)
      setStatusMessage(`RAG Source Library 업로드가 완료되었습니다. Rule File ID: ${ruleFileId}`)
      setReloadKey((current) => current + 1)
    } catch {
      setErrorMessage('RAG Source Library 업로드에 실패했습니다. 파일 형식과 용량을 확인해 주세요.')
    } finally {
      setIsUploadingFile(false)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Rules & Sources > Rule Registry"
        title="심의 규칙 (Rules)"
        description="규칙, 근거 문서, 필수 고지 조건을 API 기반으로 관리합니다."
        actions={
          <>
            <Badge tone="green">Active: {data.rules.length}</Badge>
            <Badge tone="orange">초안: 0</Badge>
            <Button onClick={openCreateRule}>
              <Plus size={16} />
              룰 추가
            </Button>
          </>
        }
      />
      {(isLoading || errorMessage || statusMessage) && (
        <div className={`${uiTokens.radius.panel} border ${errorMessage ? 'border-red-200 bg-red-50' : uiTokens.color.border} ${uiTokens.spacing.cardCompact} mb-6`}>
          <p className={`${uiTokens.typography.body} ${errorMessage ? uiTokens.color.danger : uiTokens.color.bodyText}`}>
            {errorMessage || statusMessage || 'Rules & Sources 목록을 불러오는 중입니다.'}
          </p>
        </div>
      )}
      <DataTable
        className={`overflow-hidden ${uiTokens.radius.panel} border ${uiTokens.color.border} ${uiTokens.color.surface} ${uiTokens.shadow.panel}`}
        filters={
          <form className="grid gap-4 md:grid-cols-3" onSubmit={applyFilters}>
            <Field label="검색어" value={filters.query} onChange={(value) => setFilter('query', value)} />
            <SelectField label="위험등급" value={filters.risk} onChange={(value) => setFilter('risk', value)} options={[{ value: 'ALL', label: '전체' }, ...riskOptions.map((risk) => ({ value: risk, label: risk }))]} />
            <Field label="Trigger Keywords" value={filters.triggerKeywords} onChange={(value) => setFilter('triggerKeywords', value)} />
            <div className="flex items-end gap-2 md:col-span-3 md:justify-end">
              <Button variant="secondary" className="min-w-24" type="button" onClick={resetFilters}>초기화</Button>
              <Button className="min-w-24" type="submit">조회</Button>
            </div>
          </form>
        }
        header={{ title: 'Rule Registry' }}
        headers={['Rule ID', '규칙명', '위험등급', '탐지 키워드 및 필수 고지 (Rules)', '액션']}
        pagination={{
          currentPage: visiblePage,
          itemLabel: 'Rule',
          onPageChange: setCurrentPage,
          pageSize,
          totalItems: filteredRules.length,
          totalPages,
        }}
      >
        {paginatedRules.map((rule) => (
          <tr key={rule.ruleId} className="hover:bg-slate-50">
            <td className={`${uiTokens.spacing.tableCellRelaxed} font-mono text-xs`}>{rule.ruleUniqueId}</td>
            <td className={uiTokens.spacing.tableCellRelaxed}>
              <p className={`font-semibold ${uiTokens.color.headingText}`}>{rule.name}</p>
            </td>
            <td className={uiTokens.spacing.tableCellRelaxed}>
              {rule.severity ? <RiskBadge level={rule.severity} /> : <Badge>미지정</Badge>}
            </td>
            <td className={uiTokens.spacing.tableCellRelaxed}>
              <p className={uiTokens.typography.body}>{rule.triggerKeywords.join(', ') || '-'}</p>
              <p className={`mt-1 ${uiTokens.typography.helper}`}>{rule.requiredDisclosures}</p>
            </td>
            <td className={uiTokens.spacing.tableCellRelaxed}>
              <Button variant="secondary" onClick={() => openRuleDetails(rule)}>상세</Button>
            </td>
          </tr>
        ))}
        {paginatedRules.length === 0 && (
          <tr>
            <td className={`px-5 py-10 text-center ${uiTokens.typography.body} ${uiTokens.color.mutedText}`} colSpan={5}>
              표시할 심의 규칙이 없습니다.
            </td>
          </tr>
        )}
      </DataTable>
      <Card className={uiTokens.spacing.section}>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className={uiTokens.typography.cardTitle}>RAG Source Library</h2>
            <p className={`mt-1 ${uiTokens.typography.helper}`}>준법심사 AI 분석에 전달되는 룰 근거 파일입니다.</p>
          </div>
          <label className={`inline-flex h-10 cursor-pointer items-center justify-center gap-2 ${uiTokens.radius.control} border ${uiTokens.color.border} ${uiTokens.color.surface} px-4 text-sm font-semibold ${uiTokens.color.bodyText} transition hover:border-blue-200 hover:text-blue-700`}>
            <Plus size={16} />
            {isUploadingFile ? '업로드 중' : '파일 추가'}
            <input
              className="sr-only"
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.hwp,.jpg,.jpeg,.png"
              disabled={isUploadingFile}
              onChange={handleRuleFileUpload}
            />
          </label>
        </div>
        <div className={`${uiTokens.spacing.stack} md:grid-cols-2`}>
          {data.sourceDocuments.map((document) => (
            <div key={document.documentId} className={`${uiTokens.radius.panel} border ${uiTokens.color.border} ${uiTokens.spacing.cardCompact}`}>
              <p className={uiTokens.typography.cardTitle}>{document.title}</p>
              <p className={`mt-1 ${uiTokens.typography.helper}`}>{document.syncedAt}</p>
            </div>
          ))}
          {data.sourceDocuments.length === 0 && (
            <div className={`${uiTokens.radius.panel} border ${uiTokens.color.border} ${uiTokens.spacing.cardCompact} ${uiTokens.color.mutedText}`}>
              등록된 RAG Source 파일이 없습니다.
            </div>
          )}
        </div>
      </Card>
      <Drawer
        title={ruleDraftMode === 'create' ? '룰 추가' : '규정 상세'}
        open={ruleDraft !== null}
        onClose={closeRuleDrawer}
        width="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={closeRuleDrawer}>닫기</Button>
            {ruleDraftMode === 'create' && <Button disabled={isCreatingRule} onClick={submitRule}>{isCreatingRule ? '등록 중' : '룰 생성'}</Button>}
          </div>
        }
      >
        {ruleDraft && (
          <div className="grid gap-4">
            <SelectField label="위험등급" value={ruleDraft.severity} onChange={(value) => setRuleField('severity', value)} options={[{ value: '', label: '미지정' }, ...riskOptions.map((risk) => ({ value: risk, label: risk }))]} />
            <Field label="Rule명" value={ruleDraft.name} onChange={(value) => setRuleField('name', value)} />
            <TextareaField label="Trigger Keywords" value={ruleDraft.triggerKeywords} onChange={(value) => setRuleField('triggerKeywords', value)} rows={3} />
            <TextareaField label="Required Disclosures" value={ruleDraft.requiredDisclosures} onChange={(value) => setRuleField('requiredDisclosures', value)} rows={4} />
          </div>
        )}
      </Drawer>
    </div>
  )
}
