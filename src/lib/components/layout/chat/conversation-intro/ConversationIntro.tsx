import OrganicLogo from "@@/brand/logo/OrganicLogo";

/**
 * ConversationIntro
 *
 * Abertura das telas de conversa sem conteúdo: o logo girando, o título e o subtítulo, centralizados. É o padrão
 * único para a entrada do assistente, a conversa vazia e a tela de mensagens sem conversas.
 */
export default function ConversationIntro({ title, subtitle, as: Heading = "h2" }: { title: string; subtitle?: string; as?: "h1" | "h2" }) {
  return (
    <div className="flex w-full max-w-operational-form flex-col items-center gap-4 text-center">
      <OrganicLogo width={6} decorative motion="expressive" rotateSymbol rotateShape holdMs={1571} transitionMs={1000} />
      <div className="flex flex-col gap-2">
        <Heading className="text-operational-title font-semi-bold leading-8 text-operational-ink">{title}</Heading>
        {subtitle && <p className="mx-auto max-w-operational-copy text-body text-operational-muted">{subtitle}</p>}
      </div>
    </div>
  );
}
