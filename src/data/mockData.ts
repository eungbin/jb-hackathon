export const dashboardData = {
  metrics: [
    { id: 'ai_pending', label: 'AI 사전 검토 대기', value: 24, helperText: '+5 vs Yesterday', tone: 'blue' },
    { id: 'ai_completed', label: 'AI 사전 검토 완료', value: 148, helperText: '92% Precision', tone: 'green' },
    { id: 'review_pending', label: '준법 검토 대기', value: 12, helperText: 'AVG 1.2h Delay', tone: 'orange' },
    { id: 'conditional', label: '조건부 승인', value: '08', helperText: 'Pending Edits', tone: 'blue' },
    { id: 'revision_rejected', label: '수정 요청/반려', value: '03', helperText: 'High Severity', tone: 'red' },
    { id: 'evidence_final', label: '최종 Evidence Pack 확정', value: 42, helperText: 'Ready for Audit', tone: 'purple' },
  ],
  priorityReviews: [
    { title: 'JB 청년우대 적금 모바일 배너', productCategory: 'Savings', riskLevel: 'CRITICAL', submittedAt: '2024.05.21 14:20' },
    { title: 'JB 청년우대 적금 바이럴 영상', productCategory: 'Savings', riskLevel: 'HIGH', submittedAt: '2024.05.21 15:45' },
    { title: 'JB 청년우대 적금 출시 이벤트 (SNS)', productCategory: 'Savings', riskLevel: 'MEDIUM', submittedAt: '2024.05.21 16:10' },
    { title: 'JB 청년우대 적금 가이드북', productCategory: 'Savings', riskLevel: 'LOW', submittedAt: '2024.05.22 09:30' },
  ],
  riskDistribution: { total: 205, critical: 15, high: 20, medium: 30, low: 35 },
  recurringRisks: [
    { rank: 1, name: '최고금리 조건 누락', count: 24 },
    { rank: 2, name: '대상 조건 누락', count: 18 },
    { rank: 3, name: '수수료 범위 불명확', count: 14 },
    { rank: 4, name: '대출 승인 보장 오인', count: 11 },
    { rank: 5, name: '필수 고지 미표시', count: 9 },
  ],
  learning: { approvalPending: 17, approved: 24, rejected: 3 },
  systemHealth: 'Nominal',
} as const

export const contentData = {
  draftRequest: {
    title: 'JB 청년우대 적금 하계 프로모션 푸시',
    originalText: '누구나 받을 수 있는 최고 연 7% 청년적금 혜택을 지금 확인해보세요.',
    productCategory: '적금/예금',
    productId: 'DEP-SAV-001',
    productName: 'JB 청년우대 적금',
    targetCustomers: ['청년 고객'],
    language: 'ko',
    urgency: 'NORMAL',
    channels: ['APP_PUSH'],
    plannedPublishDate: '2024.06.01',
    ragIndexVersion: 'v2024.11.05',
    appliedRuleCount: 142,
  },
  productTruthSummary: {
    verified: true,
    productName: 'JB 청년우대 적금',
    productId: 'DEP-SAV-001',
    version: 'v202606',
    eligibility: '만 19~34세',
    maxRate: '연 7.0%',
    monthlyLimit: '월 30만 원',
    sourceDocuments: ['상품설명서.pdf', '약관_청년우대.pdf', '금리표_202406.xlsx'],
  },
  checklist: [
    { title: '금리 오인 방지', description: '최고 금리 표기 시 반드시 기본 금리와 우대 조건을 명시해야 합니다.', tone: 'warning' },
    { title: '대상 고객 확인', description: '청년우대 조건인 연령 제한을 명확히 명시했는지 확인합니다.', tone: 'info' },
  ],
} as const

export const reviewListData = {
  summary: {
    totalPending: 128,
    critical: 12,
    dueToday: 34,
    myRequests: 8,
  },
  items: [
    { reviewId: 'REV-2024-00892', contentId: 'CNT-10293', title: '[앱푸시] JB 청년우대 적금 출시 알림', productName: 'JB 청년우대 적금', channel: 'APP_PUSH', riskLevel: 'CRITICAL', claimCount: 24, requester: '김철수', department: '마케팅팀', requestedAt: '2024.11.18', plannedPublishDate: '2024.11.25', status: 'PENDING' },
    { reviewId: 'REV-2024-00889', contentId: 'CNT-10291', title: '[인스타] 마이핏 정기예금 홍보 이벤트', productName: '마이핏 정기예금', channel: 'SNS', riskLevel: 'HIGH', claimCount: 12, requester: '이영희', department: '브랜드팀', requestedAt: '2024.11.17', plannedPublishDate: '2024.11.24', status: 'PENDING' },
    { reviewId: 'REV-2024-00885', contentId: 'CNT-10285', title: '[홈페이지] 퇴직연금 IRP 가입 가이드', productName: '퇴직연금 IRP', channel: 'BANNER', riskLevel: 'MEDIUM', claimCount: 18, requester: '박지민', department: '상품운영팀', requestedAt: '2024.11.17', plannedPublishDate: '2024.11.23', status: 'PENDING' },
    { reviewId: 'REV-2024-00882', contentId: 'CNT-10282', title: '[문자] 신규 서비스 약관 개정 안내', productName: '전체 서비스', channel: 'SMS', riskLevel: 'LOW', claimCount: 8, requester: '최민수', department: '법무팀', requestedAt: '2024.11.16', plannedPublishDate: '2024.11.22', status: 'PENDING' },
    { reviewId: 'REV-2024-00880', contentId: 'CNT-10280', title: '[배너] 연금저축 펀드 수익률 광고', productName: '연금저축 펀드', channel: 'BANNER', riskLevel: 'CRITICAL', claimCount: 15, requester: '정수아', department: '자산운용팀', requestedAt: '2024.11.16', plannedPublishDate: '2024.11.21', status: 'PENDING' },
  ],
} as const

export const reviewDetailData = {
  reviewId: 'REV-2024-00892',
  contentId: 'CNT-10293',
  contentTitle: 'JB 청년우대 적금 출시 알림',
  productName: 'JB 청년우대 적금',
  riskScore: 92,
  overallRisk: 'CRITICAL',
  summaryRisks: ['광고 금리 문구 사용', '수익률 과장 위험'],
  evidenceSources: [
    { type: 'Product Truth', title: '상품 기준정보', connectedClaims: 3 },
    { type: 'Regulation', title: '금융소비자보호법 시행령', connectedClaims: 1 },
    { type: 'Internal Checklist', title: '금융광고 자율심의 규정', connectedClaims: 2 },
  ],
  claims: [
    { claimId: 'CLM-001', statement: '누구나 받을 수 있다', claimType: 'ELIGIBILITY', verificationStatus: 'CONTRADICTED', riskLevel: 'CRITICAL', actionLabel: '근거 확인' },
    { claimId: 'CLM-002', statement: '최고 연 7%', claimType: 'RATE', verificationStatus: 'SUPPORTED_WITH_CONDITION_MISSING', riskLevel: 'HIGH', actionLabel: '근거 확인' },
    { claimId: 'CLM-003', statement: '청년적금 혜택', claimType: 'BENEFIT', verificationStatus: 'NEEDS_DISCLOSURE', riskLevel: 'MEDIUM', actionLabel: '근거 확인' },
  ],
  originalText: '본 금융상품은 누구나 받을 수 있다는 파격적인 조건을 제시하고 있습니다. 특히 최고 연 7%의 수익률을 보장하며, 가입 즉시 다양한 청년적금 혜택을 누리실 수 있습니다.',
  selectedClaimEvidence: {
    claimId: 'CLM-001',
    statement: '누구나 받을 수 있다',
    riskLevel: 'CRITICAL',
    productTruth: {
      productName: 'JB 청년우대 적금',
      productCode: 'DEP-SAV-001',
      version: 'v202606',
      baseRate: '연 3.0%',
      maxRate: '최고 연 7.0%',
      eligibility: '만 19~34세',
      monthlyLimit: '월 30만 원',
      sourceLocator: '금리표 2026.06 p.2',
    },
    rule: {
      ruleId: 'PE_RATE_001',
      severity: 'HIGH',
      source: '금융광고 자율심의 규정 v1.2',
      requiredDisclosure: '기본금리, 우대조건, 가입 대상, 납입 한도, 적용 기간을 함께 표시',
    },
    aiSummary: '해당 표현은 모든 고객이 가입 가능하다고 오인할 수 있습니다. 실제 상품 기준정보에는 만 19~34세 조건이 존재합니다.',
    suggestedRevision: '만 19~34세 조건 충족 고객에 한해 가입 가능한 청년우대 적금입니다.',
  },
} as const

export const evidencePackListData = {
  items: [
    { packId: 'EP-2024-00892', contentId: 'CNT-10293', title: '[앱푸시] JB 청년우대 적금 리마인드', productName: 'JB 청년우대 적금', channel: 'APP_PUSH', finalDecision: 'CONDITIONALLY_APPROVED', riskLevel: 'HIGH', finalizedAt: '2024.11.24 14:22:05', reviewer: '이영희', reviewerRole: 'Compliance Lead', learningStatus: 'CANDIDATE_RAW' },
    { packId: 'EP-2024-00891', contentId: 'CNT-10291', title: '[배너] JB 첫사랑 적금 출시 기념', productName: 'JB 첫사랑 적금', channel: 'BANNER', finalDecision: 'APPROVED', riskLevel: 'LOW', finalizedAt: '2024.11.23 18:05:12', reviewer: '김철수', reviewerRole: 'Senior Associate', learningStatus: 'REDACTED' },
    { packId: 'EP-2024-00890', contentId: 'CNT-10285', title: '[SMS] 해외결제 5% 캐시백 이벤트', productName: 'JB 글로벌 카드', channel: 'SMS', finalDecision: 'REJECTED', riskLevel: 'CRITICAL', finalizedAt: '2024.11.23 11:30:45', reviewer: '박정훈', reviewerRole: 'Risk Director', learningStatus: 'EXCLUDED' },
  ],
  total: 1248,
} as const

export const finalEvidencePackData = {
  packId: 'EP-2024-00892',
  contentId: 'CNT-10293',
  immutable: true,
  sealed: true,
  productMetadata: {
    productName: 'JB 청년우대 적금',
    securityGrade: 'High',
    securityNotice: '금융감독원 가이드라인 제24-10호에 따라 10년간 영구 보존됩니다.',
  },
  timeline: [
    { event: '상품 콘텐츠 등록', timestamp: '2024.10.12 09:42:15', actor: '김철수 (Marketing)', system: 'JB-24-YTH' },
    { event: 'AI 분석 완료', timestamp: '2024.10.12 09:45:02', actor: 'Claude 3.5 Sonnet', system: 'Compliance Engine v2.4' },
    { event: '준법 심사 확정', timestamp: '2024.10.12 14:20:55', actor: '이영희 (Compliance Lead)', system: 'ClaimProof AI' },
  ],
  claimResults: [
    { claim: '최대 연 5.5% 금리 제공 (우대 포함)', basis: '상품 기준정보의 최고 금리와 일치함', riskLevel: 'LOW', source: 'Deposit_Product_Master_v2', locator: 'p.12, Sec 4.1' },
    { claim: '청년 누구나 조건 없이 가입', basis: '가입 연령 제한 위반 및 타깃 불일치', riskLevel: 'CRITICAL', source: 'Eligibility_Criteria_2024', locator: 'p.3, Sec 1.2' },
    { claim: '만기 시 복리 이자 혜택', basis: '복리 계산 방식에 대한 구체적 조건 고지 누락', riskLevel: 'MEDIUM', source: 'Interest_Calc_Manual_v1.2', locator: 'p.7, Formula 3-b' },
    { claim: '중도 해지 시에도 원금 100% 보장', basis: '약관 제9조 원금 보장 조건과 일치함', riskLevel: 'LOW', source: 'Terms_and_Conditions_JB', locator: 'p.21, Article 9' },
  ],
  finalComment: 'JB 청년우대 적금 상품은 최대 연 5.5% 표기는 적정하나, 누구나 가입 문구는 소득 제한 및 연령 제한 조건이 누락되어 있어 금융소비자보호법 위반 소지가 큽니다. 해당 문구 삭제 또는 명확한 가입 자격 표기로 최종 승인 처리합니다.',
  decision: 'CONDITIONALLY_APPROVED',
  reviewer: 'Lee Young-Hee',
  signedAt: '2024.10.12 14:15:00 KST',
} as const

export const learningData = {
  guide: 'Evidence Pack 원본은 적재 시 자동 비식별화됩니다. 승인된 문서만 참조 가능한 형태로 보관합니다.',
  items: [
    { candidateId: 'CP-LC-8945', sourcePackId: 'EP-2024-00892', productTitle: 'JB 청년우대 적금', loadStatus: 'APPROVED' },
    { candidateId: 'CP-LC-9021', sourcePackId: 'EP-2024-00915', productTitle: '종합부동산세 절세 가이드', loadStatus: 'PENDING' },
    { candidateId: 'CP-LC-9177', sourcePackId: 'EP-2024-00931', productTitle: '비대면 대출 금리 안내', loadStatus: 'REJECTED' },
    { candidateId: 'CP-LC-9210', sourcePackId: 'EP-2024-00942', productTitle: 'JB 첫사랑 적금', loadStatus: 'APPROVED' },
    { candidateId: 'CP-LC-9284', sourcePackId: 'EP-2024-00958', productTitle: '퇴직연금 IRP 가입 가이드', loadStatus: 'PENDING' },
    { candidateId: 'CP-LC-9342', sourcePackId: 'EP-2024-00977', productTitle: 'JB 글로벌 카드 캐시백', loadStatus: 'APPROVED' },
    { candidateId: 'CP-LC-9405', sourcePackId: 'EP-2024-00984', productTitle: '연금저축 펀드 수익률 안내', loadStatus: 'REJECTED' },
  ],
  selectedCandidate: {
    candidateId: 'CP-LC-8945',
    sourcePackId: 'EP-2024-00892',
    score: '98.2%',
    originalText: '안녕하세요, 김철수 님. JB 청년우대 적금 가입을 위해 010-1234-5678로 연락드렸습니다. 계좌번호는 110-223-456789 입니다.',
    maskedText: '안녕하세요, [NAME_MASKED] 님. JB 청년우대 적금 가입을 위해 [PHONE_MASKED] 로 연락드렸습니다. 계좌번호는 [ACCOUNT_PATTERN_DETECTED] 입니다.',
    metadata: { domain: 'Banking / Savings', aiConfidence: 0.96 },
  },
} as const

export const productTruthData = {
  selectedProductId: 'PRD-001',
  products: [
    { productId: 'PRD-001', productCode: 'DEP-SAV-001', productName: 'JB 청년우대 적금', category: '수신', subCategory: '적립식 예금', status: 'ACTIVE' },
    { productId: 'PRD-002', productCode: 'LOAN-CRD-002', productName: '직장인 신용대출', category: '여신', subCategory: '가계대출', status: 'INACTIVE' },
    { productId: 'PRD-003', productCode: 'TRUST-PEN-003', productName: '연금저축 신탁', category: '투자', subCategory: '신탁상품', status: 'ACTIVE' },
  ],
  version: {
    label: 'v2024.06.01',
    status: 'ACTIVE',
    approvedAt: '2024.06.01 14:30',
    approvedBy: '준법검사부 이효준',
    baseRate: '4.5% (변동)',
  },
  facts: [
    { factId: 'FACT-001', factName: '최고 금리', valueData: '연 5.0%', condition: '우대금리 조건 충족 시', sourceLocator: '상품설명서 p.2', effectiveDate: '2024-06-01' },
    { factId: 'FACT-002', factName: '가입 대상', valueData: '만 19세~34세', condition: '개인 및 개인사업자', sourceLocator: '약관 p.4', effectiveDate: '2024-06-01' },
    { factId: 'FACT-003', factName: '중도해지 이율', valueData: '약정 이율의 50%', condition: '6개월 미만 유지 시', sourceLocator: '금리표 p.1', effectiveDate: '2024-06-01' },
  ],
  productDetails: {
    'PRD-001': {
      version: {
        label: 'v2024.06.01',
        approvedAt: '2024.06.01 14:30',
        approvedBy: '준법검사부 이효준',
      },
      facts: [
        { factId: 'FACT-001', factName: '최고 금리', valueData: '연 5.0%', condition: '우대금리 조건 충족 시', sourceLocator: '상품설명서 p.2', effectiveDate: '2024-06-01' },
        { factId: 'FACT-002', factName: '가입 대상', valueData: '만 19세~34세', condition: '개인 및 개인사업자', sourceLocator: '약관 p.4', effectiveDate: '2024-06-01' },
        { factId: 'FACT-003', factName: '중도해지 이율', valueData: '약정 이율의 50%', condition: '6개월 미만 유지 시', sourceLocator: '금리표 p.1', effectiveDate: '2024-06-01' },
      ],
    },
    'PRD-002': {
      version: {
        label: 'v2024.09.15',
        approvedAt: '2024.09.15 10:10',
        approvedBy: '준법검사부 박서윤',
      },
      facts: [
        { factId: 'FACT-101', factName: '대출 한도', valueData: '최대 1억 원', condition: '신용등급 및 소득 심사 결과에 따름', sourceLocator: '상품설명서 p.3', effectiveDate: '2024-09-15' },
        { factId: 'FACT-102', factName: '적용 금리', valueData: '연 4.8%~12.5%', condition: '개인 신용평점별 차등 적용', sourceLocator: '금리표 p.1', effectiveDate: '2024-09-15' },
        { factId: 'FACT-103', factName: '상환 방식', valueData: '원리금균등분할상환', condition: '12개월~60개월 선택 가능', sourceLocator: '약관 p.6', effectiveDate: '2024-09-15' },
      ],
    },
    'PRD-003': {
      version: {
        label: 'v2024.10.20',
        approvedAt: '2024.10.20 16:45',
        approvedBy: '준법검사부 최민정',
      },
      facts: [
        { factId: 'FACT-201', factName: '투자 대상', valueData: '채권형 및 혼합형 신탁', condition: '고객 투자성향 적합성 확인 필요', sourceLocator: '투자설명서 p.4', effectiveDate: '2024-10-20' },
        { factId: 'FACT-202', factName: '수수료', valueData: '연 0.35%', condition: '운용 유형에 따라 변동 가능', sourceLocator: '수수료표 p.2', effectiveDate: '2024-10-20' },
        { factId: 'FACT-203', factName: '중도 해지', valueData: '가능', condition: '세제 혜택 환수 및 수수료 발생 가능', sourceLocator: '약관 p.9', effectiveDate: '2024-10-20' },
      ],
    },
  },
} as const

export const rulesSourcesData = {
  rules: [
    { ruleId: 'INS-2024-001', name: '수익률 고지 누락 체크', severity: 'HIGH', triggerKeywords: ['수익률', '확정적'], requiredDisclosures: '예상 수익률 산정 근거 및 유의사항 고지', logic: 'IF contains(YIELD_KEYWORD) THEN require(YIELD_DISCLOSURE)' },
    { ruleId: 'FIN-2024-042', name: '필수 고지사항 누락 체크', severity: 'HIGH', triggerKeywords: ['수익률', '원금', '보장'], requiredDisclosures: '이 상품은 예금자보호법에 따라 보호 여부가 달라질 수 있습니다.', logic: "IF presence(KEYWORD_LIST) AND NOT presence(REQUIRED_DISCLOSURE) THEN ISSUE_ALERT(severity:HIGH, tag:'MISSING_NOTICE')" },
    { ruleId: 'GEN-2024-089', name: '최상급 표현 사용 제한', severity: 'MEDIUM', triggerKeywords: ['최상급', '1위'], requiredDisclosures: '근거 자료 출처 표기', logic: 'IF contains(SUPERLATIVE) THEN require(SOURCE_LOCATOR)' },
  ],
  sourceDocuments: [
    { documentId: 'SRC-001', title: '금융소비자보호법 2024', syncedAt: '2024-05-10 14:20', status: 'INDEXED' },
    { documentId: 'SRC-002', title: '생명보험 약관 가이드', syncedAt: '2024-05-10 16:45', status: 'INDEXED' },
  ],
} as const
