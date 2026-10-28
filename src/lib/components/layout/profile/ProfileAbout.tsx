/** Apresentação da pessoa ou da empresa: título de seção e o texto completo, com a largura de leitura padrão. */
export default function ProfileAbout({ title, text }: { title: string; text?: string | null }) {
  if (!text?.trim()) return null;
  return (
    <section className="flex min-w-0 flex-col gap-4">
      <h2 className="text-label font-semi-bold text-operational-ink">{title}</h2>
      <p className="max-w-160 whitespace-pre-line break-words text-body leading-7 text-operational-muted">{text}</p>
    </section>
  );
}
