import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Button from './Button';
import Colors from '@/domain/enum/colors';
import { InvalidPropError } from '@/domain/errors/InvalidPropError';

describe('Button', () => {
  it('renders content as the button label and description as aria-label', () => {
    render(<Button content="Salvar" description="Salvar formulário" />);

    const button = screen.getByRole('button', { name: 'Salvar formulário' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Salvar');
  });

  it('does not set a title attribute when title is not provided', () => {
    render(<Button content="Salvar" description="Salvar formulário" />);

    expect(screen.getByRole('button')).not.toHaveAttribute('title');
  });

  it('sets the title attribute when provided', () => {
    render(<Button content="Salvar" description="Salvar formulário" title="Salvar tudo" />);

    expect(screen.getByRole('button')).toHaveAttribute('title', 'Salvar tudo');
  });

  it('defaults to rounded-medium', () => {
    render(<Button content="Salvar" description="desc" />);

    expect(screen.getByRole('button')).toHaveClass('rounded-medium');
  });

  it('applies rounded-full when rounded is true', () => {
    render(<Button content="Salvar" description="desc" rounded />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('rounded-full');
    expect(button).not.toHaveClass('rounded-medium');
  });

  it('defaults bgColor to Orange and txtColor to White', () => {
    render(<Button content="Salvar" description="desc" />);

    expect(screen.getByRole('button')).toHaveStyle({
      backgroundColor: Colors.Orange,
      color: Colors.White,
    });
  });

  it('respects custom bgColor and txtColor', () => {
    render(<Button content="Salvar" description="desc" bgColor={Colors.Green} txtColor={Colors.Black} />);

    expect(screen.getByRole('button')).toHaveStyle({
      backgroundColor: Colors.Green,
      color: Colors.Black,
    });
  });

  it('merges a custom className with the base classes', () => {
    render(<Button content="Salvar" description="desc" className="mt-4" />);

    expect(screen.getByRole('button')).toHaveClass('px-4', 'py-2', 'mt-4');
  });

  it('passes through native button attributes', () => {
    render(<Button content="Salvar" description="desc" disabled type="submit" />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('fires onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button content="Salvar" description="desc" onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('throws InvalidPropError when neither content nor icon is provided', () => {
    expect(() => render(<Button description="desc" />)).toThrow(InvalidPropError);
  });

  it('renders an icon alongside content', () => {
    const { container } = render(<Button content="Buscar" description="desc" icon={{ name: 'search' }} />);

    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('colors the icon with the same value as txtColor', () => {
    const { container } = render(
      <Button content="Buscar" description="desc" txtColor={Colors.Black} icon={{ name: 'search' }} />,
    );

    expect(container.querySelector('svg')).toHaveAttribute('stroke', Colors.Black);
  });

  it('defaults to icon after content (flex-row-reverse) when inverse is not set', () => {
    render(<Button content="Buscar" description="desc" icon={{ name: 'search' }} />);

    expect(screen.getByRole('button')).toHaveClass('flex-row-reverse');
  });

  it('places the icon before content (flex-row) when icon.inverse is true', () => {
    render(<Button content="Buscar" description="desc" icon={{ name: 'search', inverse: true }} />);

    expect(screen.getByRole('button')).toHaveClass('flex-row');
  });

  it('forces a 1:1 rounded shape when there is no content, ignoring the rounded prop', () => {
    render(<Button description="desc" icon={{ name: 'search' }} rounded={false} />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('aspect-square', 'rounded-full');
    expect(button).not.toHaveTextContent(/\S/);
  });

  it('keeps the regular px-4/py-2 sizing when content is present, even with an icon', () => {
    render(<Button content="Buscar" description="desc" icon={{ name: 'search' }} />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-4', 'py-2');
    expect(button).not.toHaveClass('aspect-square');
  });
});
