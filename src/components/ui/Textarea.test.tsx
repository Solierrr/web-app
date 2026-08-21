import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Textarea } from './Textarea'

describe('Textarea', () => {
  it('renders the native textarea with name and placeholder', () => {
    render(<Textarea name="bio" placeholder="Fale sobre você" />)

    const textarea = screen.getByRole('textbox', { name: 'bio' })
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveAttribute('placeholder', 'Fale sobre você')
    expect(textarea).toHaveAttribute('name', 'bio')
  })

  it('wraps the textarea in a rounded-medium container with bg-input-bg', () => {
    render(<Textarea name="bio" />)

    const wrapper = screen.getByRole('textbox').parentElement
    expect(wrapper).toHaveClass('bg-input-bg', 'rounded-medium')
  })

  it('merges a custom className onto the wrapper', () => {
    render(<Textarea name="bio" className="mt-4" />)

    expect(screen.getByRole('textbox').parentElement).toHaveClass('mt-4')
  })

  it('passes through native textarea attributes', () => {
    render(<Textarea name="bio" disabled required rows={5} defaultValue="valor inicial" />)

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    expect(textarea).toBeDisabled()
    expect(textarea).toBeRequired()
    expect(textarea).toHaveAttribute('rows', '5')
    expect(textarea.value).toBe('valor inicial')
  })

  it('fires onChange with the typed value', () => {
    const handleChange = vi.fn()
    render(<Textarea name="bio" onChange={handleChange} />)

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'texto novo' } })

    expect(handleChange).toHaveBeenCalledTimes(1)
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('texto novo')
  })
})
