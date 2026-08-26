import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import LoginPage from './LoginPage'

describe('LoginPage', () => {
  it('renders the login form fields and submit button', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    expect(screen.getByPlaceholderText('seuemailaqui@email.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('suasenhaaqui')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Prosseguir' })).toBeInTheDocument()
  })

  it('links to the register and forgot-password routes', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Cadastre-se' })).toHaveAttribute('href', '/cadastro')
    expect(screen.getByRole('link', { name: 'Esqueci minha senha' })).toHaveAttribute('href', '/esqueci-senha')
  })
})
