import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button, Card, DataTable, PageHeader } from '../../../components/ui'
import { uiTokens } from '../../../design/tokens'
import { fetchProductTruthProducts } from '../api'
import type { ProductTruthProduct } from '../api'

const productFactPageSize = 5
type ProductId = ProductTruthProduct['productId']

export function ProductTruthPage() {
  const [items, setItems] = useState<ProductTruthProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedProductId, setSelectedProductId] = useState<ProductId | null>(null)
  const [productFactPage, setProductFactPage] = useState(1)
  const selectedProduct = items.find((product) => product.productId === selectedProductId) ?? items[0] ?? null
  const selectedProductDetails = selectedProduct
  const selectedProductFacts = selectedProductDetails?.facts ?? []
  const productFactTotalPages = Math.max(1, Math.ceil(selectedProductFacts.length / productFactPageSize))
  const visibleProductFactPage = Math.min(productFactPage, productFactTotalPages)
  const paginatedFacts = selectedProductFacts.slice((visibleProductFactPage - 1) * productFactPageSize, visibleProductFactPage * productFactPageSize)

  useEffect(() => {
    let cancelled = false

    setIsLoading(true)
    fetchProductTruthProducts().then((products) => {
      if (cancelled) {
        return
      }

      setItems(products)
      setSelectedProductId((currentProductId) => {
        if (currentProductId && products.some((product) => product.productId === currentProductId)) {
          return currentProductId
        }

        return products[0]?.productId ?? null
      })
      setErrorMessage('')
    }).catch(() => {
      if (!cancelled) {
        setErrorMessage('Product Truth 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')
      }
    }).finally(() => {
      if (!cancelled) {
        setIsLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

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
      {(isLoading || errorMessage) && (
        <div className={`mb-6 ${uiTokens.radius.panel} border ${errorMessage ? 'border-red-200 bg-red-50' : uiTokens.color.border} ${uiTokens.spacing.cardCompact}`}>
          <p className={`${uiTokens.typography.body} ${errorMessage ? uiTokens.color.danger : uiTokens.color.bodyText}`}>
            {errorMessage || 'Product Truth 목록을 불러오는 중입니다.'}
          </p>
        </div>
      )}
      <div className={`${uiTokens.spacing.stack} xl:grid-cols-[520px_minmax(0,1fr)]`}>
        <Card title="상품 선택">
          <div className={uiTokens.spacing.stackCompact}>
            {items.map((product) => (
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
                <p className={`mt-1 ${uiTokens.typography.helper}`}>{product.productCode} · {product.productCategory}</p>
              </button>
            ))}
            {items.length === 0 && (
              <p className={`${uiTokens.typography.body} ${uiTokens.color.mutedText}`}>등록된 상품 기준정보가 없습니다.</p>
            )}
          </div>
        </Card>
        <Card title="Product Information">
          {selectedProductDetails ? (
            <>
              <div>
                <p className={uiTokens.typography.metricValue}>{selectedProductDetails.productCode}</p>
                <p className={`mt-1 ${uiTokens.typography.helper}`}>{selectedProductDetails.productName} · {selectedProductDetails.productCategory}</p>
                <p className={`mt-4 ${uiTokens.typography.body} ${uiTokens.color.bodyText}`}>{selectedProductDetails.productIntroduce}</p>
              </div>
              <div className={`mt-6 ${uiTokens.spacing.stackCompact} md:grid-cols-2`}>
                <div className={`${uiTokens.radius.panel} ${uiTokens.color.surfaceMuted} ${uiTokens.spacing.cardCompact}`}>
                  <p className={uiTokens.typography.tableHeader}>Product Category</p>
                  <p className={`mt-2 ${uiTokens.typography.cardTitle}`}>{selectedProductDetails.productCategory}</p>
                </div>
                <div className={`${uiTokens.radius.panel} ${uiTokens.color.surfaceMuted} ${uiTokens.spacing.cardCompact}`}>
                  <p className={uiTokens.typography.tableHeader}>Registered At</p>
                  <p className={`mt-2 ${uiTokens.typography.cardTitle}`}>{selectedProductDetails.productDate}</p>
                </div>
              </div>
            </>
          ) : (
            <p className={`${uiTokens.typography.body} ${uiTokens.color.mutedText}`}>상품을 선택하면 기준정보가 표시됩니다.</p>
          )}
        </Card>
      </div>
      <Card className={uiTokens.spacing.section} title="Product Fact">
        <DataTable
          headers={['Product Fact', 'Type', 'Value/Data', 'Condition', 'Source Locator', 'Source File', 'Note']}
          pagination={{
            currentPage: visibleProductFactPage,
            itemLabel: 'Product Fact',
            onPageChange: setProductFactPage,
            pageSize: productFactPageSize,
            totalItems: selectedProductFacts.length,
            totalPages: productFactTotalPages,
          }}
        >
          {paginatedFacts.map((fact) => (
            <tr key={fact.factId}>
              <td className={`${uiTokens.spacing.tableCellRelaxed} font-semibold ${uiTokens.color.headingText}`}>{fact.factName}</td>
              <td className={uiTokens.spacing.tableCellRelaxed}>{fact.factType}</td>
              <td className={uiTokens.spacing.tableCellRelaxed}>{fact.valueData}</td>
              <td className={uiTokens.spacing.tableCellRelaxed}>{fact.condition}</td>
              <td className={`${uiTokens.spacing.tableCellRelaxed} whitespace-pre-line`}>{fact.sourceLocator}</td>
              <td className={uiTokens.spacing.tableCellRelaxed}>{fact.sourceFile}</td>
              <td className={uiTokens.spacing.tableCellRelaxed}>{fact.note}</td>
            </tr>
          ))}
          {paginatedFacts.length === 0 && (
            <tr>
              <td className={`px-5 py-10 text-center ${uiTokens.typography.body} ${uiTokens.color.mutedText}`} colSpan={7}>
                표시할 Product Fact가 없습니다.
              </td>
            </tr>
          )}
        </DataTable>
      </Card>
    </div>
  )
}
