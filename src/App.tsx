import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { loginUser, readStoredUser, writeStoredUser } from './domains/auth/auth'
import type { LoginRequest } from './domains/auth/auth'
import { AuthProvider } from './domains/auth/AuthContext'
import { LoginPage } from './domains/auth/pages/LoginPage'
import {
  ComplianceReviewDetailPage,
  ComplianceReviewListPage,
  ContentCreatePage,
  DashboardPage,
  EvidencePackDetailPage,
  EvidencePackListPage,
  LearningLoopPage,
  ProductTruthCreatePage,
  ProductTruthPage,
  RulesSourcesPage,
} from './pages'

function App() {
  const [user, setUser] = useState(() => readStoredUser())

  async function handleLogin(credentials: LoginRequest) {
    const nextUser = await loginUser(credentials)

    writeStoredUser(nextUser)
    setUser(nextUser)
  }

  return (
    <BrowserRouter>
      {!user ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <AuthProvider user={user}>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/content/new" element={<ContentCreatePage />} />
              <Route path="/compliance-review" element={<ComplianceReviewListPage />} />
              <Route path="/compliance-review/:reviewId" element={<ComplianceReviewDetailPage />} />
              <Route path="/evidence-pack" element={<EvidencePackListPage />} />
              <Route path="/evidence-pack/:packId" element={<EvidencePackDetailPage />} />
              <Route path="/learning-loop" element={<LearningLoopPage />} />
              <Route path="/product-truth" element={<ProductTruthPage />} />
              <Route path="/product-truth/new" element={<ProductTruthCreatePage />} />
              <Route path="/rules-sources" element={<RulesSourcesPage />} />
              <Route path="*" element={<Navigate to="/compliance-review" replace />} />
            </Route>
          </Routes>
        </AuthProvider>
      )}
    </BrowserRouter>
  )
}

export default App
