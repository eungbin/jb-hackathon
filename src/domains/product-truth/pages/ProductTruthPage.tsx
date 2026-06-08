import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { productTruthData } from '../../../data/mockData'
import { Button, Card, DataTable, PageHeader } from '../../../components/ui'
import { uiTokens } from '../../../design/tokens'

const productFactPageSize = 2
type ProductId = (typeof productTruthData.products)[number]['productId']

export function ProductTruthPage() {
  const [selectedProductId, setSelectedProductId] = useState<ProductId>(productTruthData.selectedProductId)
  const [productFactPage, setProductFactPage] = useState(1)
  const selectedProduct = productTruthData.products.find((product) => product.productId === selectedProductId) ?? productTruthData.products[0]
  const selectedProductDetails = productTruthData.productDetails[selectedProduct.productId]
  const productFactTotalPages = Math.max(1, Math.ceil(selectedProductDetails.facts.length / productFactPageSize))
  const visibleProductFactPage = Math.min(productFactPage, productFactTotalPages)
  const paginatedFacts = selectedProductDetails.facts.slice((visibleProductFactPage - 1) * productFactPageSize, visibleProductFactPage * productFactPageSize)

  return (
    <div>
      <PageHeader
        eyebrow="Product Truth Layer > 기준정보 관리"
        title="Product Truth Layer - Source of Truth Management"
        description="금융상품 기준정보와 Product Fact를 조회합니다."
        actions={
          <Link to="/product-truth/new">
            <Button>
              <Plus size={16} />
              신규 상품 등록
            </Button>
          </Link>
        }
      />
      <div className={`${uiTokens.spacing.stack} xl:grid-cols-[520px_minmax(0,1fr)]`}>
        <Card title="상품 선택">
          <div className={uiTokens.spacing.stackCompact}>
            {productTruthData.products.map((product) => (
              <button
                key={product.productId}
                aria-pressed={selectedProductId === product.productId}
                className={`w-full text-left transition hover:border-blue-300 hover:bg-blue-50 ${uiTokens.radius.panel} border ${selectedProductId === product.productId ? `${uiTokens.color.primaryBorder} ${uiTokens.color.primarySurface}` : uiTokens.color.border} ${uiTokens.spacing.cardCompact}`}
                type="button"
                onClick={() => {
                  setSelectedProductId(product.productId)
                  setProductFactPage(1)
                }}
              >
                <p className={uiTokens.typography.cardTitle}>{product.productName}</p>
                <p className={`mt-1 ${uiTokens.typography.helper}`}>{product.productCode} · {product.category}/{product.subCategory}</p>
              </button>
            ))}
          </div>
        </Card>
        <Card title="Product Version Management">
          <div>
            <div>
              <p className={uiTokens.typography.metricValue}>{selectedProductDetails.version.label}</p>
              <p className={`mt-1 ${uiTokens.typography.helper}`}>{selectedProduct.productName} · {selectedProduct.productCode}</p>
            </div>
          </div>
          <div className={`mt-6 ${uiTokens.spacing.stackCompact} md:grid-cols-2`}>
            <div className={`${uiTokens.radius.panel} ${uiTokens.color.surfaceMuted} ${uiTokens.spacing.cardCompact}`}>
              <p className={uiTokens.typography.tableHeader}>Approved By</p>
              <p className={`mt-2 ${uiTokens.typography.cardTitle}`}>{selectedProductDetails.version.approvedBy}</p>
            </div>
            <div className={`${uiTokens.radius.panel} ${uiTokens.color.surfaceMuted} ${uiTokens.spacing.cardCompact}`}>
              <p className={uiTokens.typography.tableHeader}>Approved At</p>
              <p className={`mt-2 ${uiTokens.typography.cardTitle}`}>{selectedProductDetails.version.approvedAt}</p>
            </div>
          </div>
        </Card>
      </div>
      <Card className={uiTokens.spacing.section} title="Product Fact">
        <DataTable
          headers={['Product Fact', 'Value/Data', 'Condition', 'Source Locator', 'Effective Date']}
          pagination={{
            currentPage: visibleProductFactPage,
            itemLabel: 'Product Fact',
            onPageChange: setProductFactPage,
            pageSize: productFactPageSize,
            totalItems: selectedProductDetails.facts.length,
            totalPages: productFactTotalPages,
          }}
        >
          {paginatedFacts.map((fact) => (
            <tr key={fact.factId}>
              <td className={`${uiTokens.spacing.tableCellRelaxed} font-semibold ${uiTokens.color.headingText}`}>{fact.factName}</td>
              <td className={uiTokens.spacing.tableCellRelaxed}>{fact.valueData}</td>
              <td className={uiTokens.spacing.tableCellRelaxed}>{fact.condition}</td>
              <td className={uiTokens.spacing.tableCellRelaxed}>{fact.sourceLocator}</td>
              <td className={uiTokens.spacing.tableCellRelaxed}>{fact.effectiveDate}</td>
            </tr>
          ))}
        </DataTable>
      </Card>
    </div>
  )
}
