import { Outlet, useNavigate } from 'react-router-dom'
import { ContextMenuProvider } from '@/config/contextMenu/provider/ContextMenuProvider'
import { useContextMenu } from '@/config/contextMenu/useContextMenu'

import Navbar from '@@/layout/navbar/Navbar'

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
    <div className="min-h-screen min-w-screen" onContextMenu={handleContextMenu}>
      <Navbar />
      <main className="mx-auto w-full xl:px-50 lg:px-40 md:px-20 sm:px-10">
        <Outlet />
      </main>
    </div>
  )
}
