import type { FormEvent } from 'react'
import { useState } from 'react'
import { rulesSourcesData } from '../../../data/mockData'
import type { RiskLevel } from '../../../types'
import { Badge, Button, Card, DataTable, Drawer, Field, PageHeader, RiskBadge, SelectField, TextareaField } from '../../../components/ui'
import { uiTokens } from '../../../design/tokens'
import { updateTextField } from '../../../utils/formState'

type RuleDraft = {
  ruleId: string
  name: string
  severity: RiskLevel
  triggerKeywords: string
  requiredDisclosures: string
  logic: string
}

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

export function RulesSourcesPage() {
  const toRuleDraft = (rule: (typeof rulesSourcesData.rules)[number]): RuleDraft => ({
    ruleId: rule.ruleId,
    name: rule.name,
    severity: rule.severity,
    triggerKeywords: rule.triggerKeywords.join(', '),
    requiredDisclosures: rule.requiredDisclosures,
    logic: rule.logic,
  })
  const [selectedRule, setSelectedRule] = useState<RuleDraft | null>(null)
  const [filters, setFilters] = useState<RuleFilters>(initialFilters)
  const [appliedFilters, setAppliedFilters] = useState<RuleFilters>(initialFilters)
  const [currentPage, setCurrentPage] = useState(1)
  const setFilter = (field: keyof typeof filters, value: string) => {
    setFilters((current) => updateTextField(current, field, value))
  }
  const setRuleField = (field: keyof RuleDraft, value: string) => {
    setSelectedRule((current) => (current ? updateTextField(current, field, value) : current))
  }
  const filteredRules = rulesSourcesData.rules.filter((rule) => {
    const query = appliedFilters.query.trim().toLowerCase()
    const triggerKeywords = appliedFilters.triggerKeywords.trim().toLowerCase()
    const searchableText = [rule.ruleId, rule.name, rule.requiredDisclosures].join(' ').toLowerCase()
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

  return (
    <div>
      <PageHeader
        eyebrow="Rules & Sources > Rule Registry"
        title="심의 규칙 (Rules)"
        description="규칙, 근거 문서, 필수 고지 조건을 정적 UI로 관리합니다."
        actions={
          <>
            <Badge tone="green">Active: 142</Badge>
            <Badge tone="orange">초안: 12</Badge>
          </>
        }
      />
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
        headers={['Rule ID', '규칙명', '탐지 키워드 및 필수 고지 (Rules)', '적용일', '액션']}
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
            <td className={`${uiTokens.spacing.tableCellRelaxed} font-mono text-xs`}>{rule.ruleId}</td>
            <td className={uiTokens.spacing.tableCellRelaxed}>
              <p className={`font-semibold ${uiTokens.color.headingText}`}>{rule.name}</p>
              <RiskBadge level={rule.severity} />
            </td>
            <td className={uiTokens.spacing.tableCellRelaxed}>
              <p className={uiTokens.typography.body}>{rule.triggerKeywords.join(', ')}</p>
              <p className={`mt-1 ${uiTokens.typography.helper}`}>{rule.requiredDisclosures}</p>
            </td>
            <td className={`${uiTokens.spacing.tableCellRelaxed} ${uiTokens.color.mutedText}`}>2024.11.05</td>
            <td className={uiTokens.spacing.tableCellRelaxed}>
              <Button variant="secondary" onClick={() => setSelectedRule(toRuleDraft(rule))}>편집</Button>
            </td>
          </tr>
        ))}
      </DataTable>
      <Card className={uiTokens.spacing.section} title="RAG Source Library">
        <div className={`${uiTokens.spacing.stack} md:grid-cols-2`}>
          {rulesSourcesData.sourceDocuments.map((document) => (
            <div key={document.documentId} className={`${uiTokens.radius.panel} border ${uiTokens.color.border} ${uiTokens.spacing.cardCompact}`}>
              <p className={uiTokens.typography.cardTitle}>{document.title}</p>
              <p className={`mt-1 ${uiTokens.typography.helper}`}>{document.syncedAt}</p>
              <div className="mt-3">
                <Badge tone="green">{document.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Drawer
        title="규정 상세 편집"
        open={selectedRule !== null}
        onClose={() => setSelectedRule(null)}
        width="sm"
        footer={
          <div className="flex justify-end">
            <Button>변경사항 저장</Button>
          </div>
        }
      >
        {selectedRule && (
          <div className="grid gap-4">
            <SelectField label="위험등급" value={selectedRule.severity} onChange={(value) => setRuleField('severity', value)} options={riskOptions.map((risk) => ({ value: risk, label: risk }))} />
            <Field label="Rule ID" value={selectedRule.ruleId} onChange={(value) => setRuleField('ruleId', value)} />
            <Field label="Rule명" value={selectedRule.name} onChange={(value) => setRuleField('name', value)} />
            <TextareaField label="Trigger Keywords" value={selectedRule.triggerKeywords} onChange={(value) => setRuleField('triggerKeywords', value)} rows={3} />
            <TextareaField label="Required Disclosures" value={selectedRule.requiredDisclosures} onChange={(value) => setRuleField('requiredDisclosures', value)} rows={4} />
            <TextareaField label="Rule Engine Logic" value={selectedRule.logic} onChange={(value) => setRuleField('logic', value)} rows={5} />
          </div>
        )}
      </Drawer>
    </div>
  )
}
