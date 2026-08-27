import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import RegisterPage from './RegisterPage';

describe('RegisterPage', () => {
  it('renders the register form fields and submit button', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    expect(screen.getByPlaceholderText('seunomeaqui')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('seuemailaqui@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('suasenhaaqui')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('confirmesuasenha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cadastrar' })).toBeInTheDocument();
  });

  it('links back to the login route', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute('href', '/login');
  });
});
