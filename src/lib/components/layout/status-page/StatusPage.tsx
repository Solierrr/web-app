import type { ReactNode } from "react";
import SideCanvas from "@@/layout/access/canvas/SideCanvas";
import OrganicLogo from "@@/brand/logo/OrganicLogo";

interface StatusPageProps {
  title: string;
  message?: ReactNode;
  code?: string;
  children?: ReactNode;
  actions?: ReactNode;
  busy?: boolean;
}

/**
 * StatusPage
 *
 * Tela centralizada de estado (erro, indisponibilidade, retorno de deeplink): logo girando, título, mensagem e
 * ações empilhadas em largura total, pensada primeiro para o celular. É a base da tela de erro e das telas de
 * deeplink, para que todas tenham a mesma identidade.
 *
 * @param props - title, message, code, children (conteúdo extra abaixo da mensagem), actions e busy.
 */
export default function StatusPage({ title, message, code, children, actions, busy = false }: StatusPageProps) {
  return (
    <main
      aria-busy={busy}
      className="relative isolate flex min-h-dvh w-full items-center justify-center overflow-hidden bg-operational-surface px-6 py-12 pb-[max(3rem,env(safe-area-inset-bottom))]">
      <SideCanvas centerWidth="36rem" centerHeight="28rem" />
      <div className="relative flex w-full max-w-operational-copy flex-col items-center gap-6 p-4 text-center sm:p-6">
        <OrganicLogo width={8} holdMs={2500} transitionMs={500} rotateShape />
        {code && <p className="select-none text-8xl font-semi-bold leading-none tracking-tight text-orange sm:text-9xl">{code}</p>}
        <div className="flex max-w-operational-form flex-col gap-1">
          <h1 className="text-subtitle font-semi-bold leading-tight text-operational-ink">{title}</h1>
          {message && <p className="text-label leading-relaxed text-operational-muted [overflow-wrap:anywhere]">{message}</p>}
        </div>
        {children && <div className="flex w-full max-w-operational-form flex-col gap-3 text-left">{children}</div>}
        {actions && <div className="mt-2 flex w-full max-w-80 flex-col gap-3 [&>*]:w-full">{actions}</div>}
      </div>
    </main>
  );
}
