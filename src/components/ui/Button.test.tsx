import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'
import Colors from '@/domain/enum/colors'

describe('Button', () => {
  it('renders content as the button label and description as aria-label', () => {
    render(<Button content="Salvar" description="Salvar formulário" />)

    const button = screen.getByRole('button', { name: 'Salvar formulário' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Salvar')
  })

  it('does not set a title attribute when title is not provided', () => {
    render(<Button content="Salvar" description="Salvar formulário" />)

    expect(screen.getByRole('button')).not.toHaveAttribute('title')
  })

  it('sets the title attribute when provided', () => {
    render(<Button content="Salvar" description="Salvar formulário" title="Salvar tudo" />)

    expect(screen.getByRole('button')).toHaveAttribute('title', 'Salvar tudo')
  })

  it('defaults to rounded-lg', () => {
    render(<Button content="Salvar" description="desc" />)

    expect(screen.getByRole('button')).toHaveClass('rounded-lg')
  })

  it('applies rounded-full when rounded is true', () => {
    render(<Button content="Salvar" description="desc" rounded />)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('rounded-full')
    expect(button).not.toHaveClass('rounded-lg')
  })

  it('defaults bgColor to Orange and txtColor to White', () => {
    render(<Button content="Salvar" description="desc" />)

    expect(screen.getByRole('button')).toHaveStyle({
      backgroundColor: Colors.Orange,
      color: Colors.White,
    })
  })

  it('respects custom bgColor and txtColor', () => {
    render(<Button content="Salvar" description="desc" bgColor={Colors.Green} txtColor={Colors.Black} />)

    expect(screen.getByRole('button')).toHaveStyle({
      backgroundColor: Colors.Green,
      color: Colors.Black,
    })
  })

  it('merges a custom className with the base classes', () => {
    render(<Button content="Salvar" description="desc" className="mt-4" />)

    expect(screen.getByRole('button')).toHaveClass('px-4', 'py-2', 'mt-4')
  })

  it('passes through native button attributes', () => {
    render(<Button content="Salvar" description="desc" disabled type="submit" />)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('fires onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button content="Salvar" description="desc" onClick={handleClick} />)

    fireEvent.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
