import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="space-y-5">
      <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
        404
      </p>
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-slate-950">
          Pagina nao encontrada
        </h1>
        <p className="max-w-2xl text-base leading-7 text-slate-600">
          A rota acessada nao existe ou foi removida.
        </p>
      </div>
      <Link
        to="/"
        className="inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
      >
        Voltar para o inicio
      </Link>
    </section>
  )
}
