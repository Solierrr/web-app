import type { ReactNode } from "react";
import WrapperLayout from "@/config/WrapperLayout";
import OperationalPage from "@@/layout/operational-page/OperationalPage";

const DEFAULT_BANNER = "https://fastly.picsum.photos/id/918/1600/400.jpg?hmac=1gEvFp6O-XDh4848VnlwyOIrVy8s_aJNhYyTzxN9_JA";
const DEFAULT_AVATAR = "https://i.pravatar.cc/300";

interface ProfilePageProps {
  bannerUrl?: string;
  avatarUrl?: string;
  name: string;
  subtitle?: string;
  actions?: ReactNode;
  children?: ReactNode;
  operational?: boolean;
  operationalTitle?: string;
}

/**
 * ProfilePage
 *
 * Template de estrutura compartilhado pelos perfis de usuário e de empresa:
 * banner de fundo em largura total, foto de perfil sobreposta, nome/subtítulo
 * e uma área de ações (ex.: editar, entrar em contato). O conteúdo específico
 * de cada perfil é passado via `children`, já dentro do `WrapperLayout`.
 */
export default function ProfilePage({
  bannerUrl = DEFAULT_BANNER,
  avatarUrl = DEFAULT_AVATAR,
  name,
  subtitle,
  actions,
  children,
  operational = false,
  operationalTitle,
}: ProfilePageProps) {
  const ContentWrapper = operational ? "div" : WrapperLayout;
  const ContentMain = operational ? "div" : "main";
  const NameHeading = operational ? "h2" : "h1";
  const content = (
    <div className="pb-8">
      <section className="relative h-56 w-full bg-input-bg bg-cover bg-center sm:h-72" style={{ backgroundImage: `url(${bannerUrl})` }}>
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </section>

      <ContentWrapper className={operational ? "px-4 pb-8 sm:px-8 lg:px-10" : undefined}>
        <ContentMain className="flex flex-col gap-8">
          <header className="-mt-14 flex flex-col items-start justify-between gap-5 rounded-hard border border-black/5 bg-white p-5 shadow-soft sm:-mt-16 sm:flex-row sm:items-end sm:p-7">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end">
              <img
                src={avatarUrl}
                alt={name}
                className="h-28 w-28 rounded-full border-4 border-white bg-input-bg object-cover shadow-hard sm:h-32 sm:w-32"
              />
              <div className="flex flex-col gap-1 pb-2">
                <NameHeading className="text-xl font-semibold sm:text-2xl">{name}</NameHeading>
                {subtitle && <p className="text-sm text-input-text sm:text-base">{subtitle}</p>}
              </div>
            </div>

            {actions && !operational && <div className="flex flex-row gap-2">{actions}</div>}
          </header>

          <section className="flex flex-col gap-6">{children}</section>
        </ContentMain>
      </ContentWrapper>
    </div>
  );
  return operational ? (
    <OperationalPage title={operationalTitle ?? name} actions={actions} profile>
      {content}
    </OperationalPage>
  ) : (
    content
  );
}
