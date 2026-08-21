import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ContextMenuProvider } from '@/config/interface/ContextMenuProvider'
import { useContextMenu } from '@/config/interface/useContextMenu'

const linkClassName = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-medium px-3 py-2 text-sm  font-medium  transition-colors',
    isActive
      ? 'bg-slate-900 text-white'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
  ].join(' ')

export function AppLayout() {
  return (
    <ContextMenuProvider>
      <AppLayoutContent />
    </ContextMenuProvider>
  )
}

function AppLayoutContent() {
  const navigate = useNavigate()
  const contextMenu = useContextMenu()

  function handleContextMenu(event: React.MouseEvent) {
    event.preventDefault()
    contextMenu.open([
      { label: 'Voltar', onClick: () => navigate(-1) },
    ], event.clientX, event.clientY)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950" onContextMenu={handleContextMenu}>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <NavLink to="/" className="text-lg font-semibold text-slate-950">
            Web App
          </NavLink>

          <nav className="flex items-center gap-2" aria-label="Principal">
            <NavLink to="/" className={linkClassName}>
              Inicio
            </NavLink>
            <NavLink to="/sobre" className={linkClassName}>
              Sobre
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  )
}
