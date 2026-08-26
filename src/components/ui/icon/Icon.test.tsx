import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Icon, { type IconName } from './Icon'
import Colors from '@/domain/enum/colors'
import { InvalidIconError } from '@/domain/errors/InvalidIconError'

describe('Icon', () => {
  it('renders an svg for a known icon name', () => {
    const { container } = render(<Icon name="home" />)

    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('throws InvalidIconError for an unknown icon name', () => {
    expect(() => render(<Icon name={'not-an-icon' as IconName} />)).toThrow(InvalidIconError)
  })

  it('applies default size, color and strokeWidth', () => {
    const { container } = render(<Icon name="home" />)

    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '24')
    expect(svg).toHaveAttribute('height', '24')
    expect(svg).toHaveAttribute('stroke', Colors.Black)
    expect(svg).toHaveAttribute('stroke-width', '2')
  })

  it('respects custom size, color and strokeWidth', () => {
    const { container } = render(
      <Icon name="user" size={48} color={Colors.Orange} strokeWidth={1.5} />,
    )

    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '48')
    expect(svg).toHaveAttribute('height', '48')
    expect(svg).toHaveAttribute('stroke', Colors.Orange)
    expect(svg).toHaveAttribute('stroke-width', '1.5')
  })

  it('scales strokeWidth relative to size when absoluteStrokeWidth is true', () => {
    const { container } = render(
      <Icon name="settings" size={48} strokeWidth={2} absoluteStrokeWidth />,
    )

    const svg = container.querySelector('svg')
    // absoluteStrokeWidth keeps the *visual* stroke width constant: strokeWidth * 24 / size
    expect(svg).toHaveAttribute('stroke-width', '1')
  })

  it('merges a custom className with the lucide default classes', () => {
    const { container } = render(<Icon name="search" className="mx-2" />)

    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('lucide', 'mx-2')
  })

  it('is aria-hidden by default (decorative icon)', () => {
    const { container } = render(<Icon name="home" />)

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })
})
