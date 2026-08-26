import { render, screen, fireEvent, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { ContextMenuProvider } from './ContextMenuProvider'
import { useContextMenu } from '../useContextMenu'

function Trigger() {
  const contextMenu = useContextMenu()

  return (
    <button
      onClick={() => contextMenu.open([{ label: 'Editar', onClick: vi.fn() }], 30, 40)}
    >
      abrir
    </button>
  )
}

describe('ContextMenuProvider', () => {
  it('throws when useContextMenu is used outside the provider', () => {
    expect(() => renderHook(() => useContextMenu())).toThrow(
      'useContextMenu: deve ser usado dentro de um ContextMenuProvider.',
    )
  })

  it('opens the shared menu at the position requested by a descendant', () => {
    render(
      <ContextMenuProvider>
        <Trigger />
      </ContextMenuProvider>,
    )

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'abrir' }))

    const menu = screen.getByRole('menu')
    expect(menu.style.left).toBe('30px')
    expect(menu.style.top).toBe('40px')
    expect(screen.getByRole('menuitem', { name: 'Editar' })).toBeInTheDocument()
  })

  it('closes the shared menu via close()', () => {
    function CloseTrigger() {
      const contextMenu = useContextMenu()
      return <button onClick={() => contextMenu.close()}>fechar</button>
    }

    render(
      <ContextMenuProvider>
        <Trigger />
        <CloseTrigger />
      </ContextMenuProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'abrir' }))
    expect(screen.getByRole('menu')).toBeInTheDocument()

    act(() => fireEvent.click(screen.getByRole('button', { name: 'fechar' })))

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})
