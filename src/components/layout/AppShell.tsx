import type { ComponentType } from 'react'
import { Bell, BookOpen, ClipboardCheck, Database, FileArchive, GraduationCap, Home, LogOut, PlusCircle, Search, Settings, ShieldCheck } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../domains/auth/AuthContext'
import { uiTokens } from '../../design/tokens'

const navItems: Array<{ label: string; path?: string; icon: ComponentType<{ size?: number }> }> = [
  { label: 'Dashboard', path: '/dashboard', icon: Home },
  { label: '콘텐츠 등록', path: '/content/new', icon: PlusCircle },
  { label: '준법 Review', path: '/compliance-review', icon: ClipboardCheck },
  { label: 'Evidence Pack', path: '/evidence-pack', icon: FileArchive },
  { label: 'Learning Loop', path: '/learning-loop', icon: GraduationCap },
  { label: 'Product Truth', path: '/product-truth', icon: Database },
  { label: 'Rules & Sources', path: '/rules-sources', icon: BookOpen },
  { label: '설정', icon: Settings },
]

export function AppShell() {
  const { user, logout } = useAuth()

  return (
    <div className={`min-h-screen ${uiTokens.color.page} ${uiTokens.color.headingText}`}>
      <aside className={`fixed inset-y-0 left-0 hidden w-[264px] border-r ${uiTokens.color.border} bg-white/95 px-4 py-6 ${uiTokens.shadow.panel} lg:block`}>
        <div className="flex items-center gap-3 px-2">
          <div className={`flex h-10 w-10 items-center justify-center ${uiTokens.radius.panel} ${uiTokens.color.primaryBg} text-white`}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className={uiTokens.typography.cardTitle}>ClaimProof AI</p>
            <p className={uiTokens.typography.helper}>AI Compliance Control</p>
          </div>
        </div>
        <nav className="mt-8 grid gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon
            if (!item.path) {
              return (
                <button
                  key={item.label}
                  className={`flex h-10 items-center gap-3 ${uiTokens.radius.compact} px-3 ${uiTokens.typography.label} ${uiTokens.color.subtleText}`}
                  type="button"
                  disabled
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              )
            }
            return (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  `flex h-10 items-center gap-3 ${uiTokens.radius.compact} border-l-4 px-3 ${uiTokens.typography.label} transition ${
                    isActive ? 'border-blue-700 bg-blue-50 text-blue-700' : 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
      </aside>

      <div className="lg:pl-[264px]">
        <header className={`sticky top-0 z-30 h-16 border-b ${uiTokens.color.border} bg-white/90 px-5 backdrop-blur lg:px-8`}>
          <div className="flex h-full items-center justify-between gap-4">
            <div className="relative w-full max-w-xl">
              <Search className="pointer-events-none absolute left-3 top-2.5 text-slate-400" size={17} />
              <input
                className={`h-10 w-full ${uiTokens.radius.compact} border ${uiTokens.color.border} ${uiTokens.color.surfaceMuted} pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100`}
                placeholder="콘텐츠, 상품, Evidence Pack 검색"
              />
            </div>
            <div className="flex items-center gap-3">
              <button className={`${uiTokens.radius.compact} border ${uiTokens.color.border} ${uiTokens.color.surface} p-2 ${uiTokens.color.mutedText}`} aria-label="알림">
                <Bell size={18} />
              </button>
              <button
                className={`flex h-10 items-center gap-2 whitespace-nowrap ${uiTokens.radius.compact} border ${uiTokens.color.border} ${uiTokens.color.surface} px-3 text-sm font-semibold ${uiTokens.color.mutedText} transition hover:text-slate-950`}
                type="button"
                onClick={logout}
              >
                <LogOut size={16} />
                로그아웃
              </button>
              <div className="hidden text-right sm:block">
                <p className={uiTokens.typography.label}>{user.userName}</p>
                <p className={uiTokens.typography.helper}>{user.userDept} · {user.userRank}</p>
              </div>
            </div>
          </div>
        </header>
        <main className={uiTokens.spacing.page}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
