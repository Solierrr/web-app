import { useState, type ReactNode } from "react";
import WrapperLayout from "@/config/WrapperLayout";
import OperationalPage from "@@/layout/operational-page/OperationalPage";

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
  bannerUrl,
  avatarUrl,
  name,
  subtitle,
  actions,
  children,
  operational = false,
  operationalTitle,
}: ProfilePageProps) {
  const [failedBanner, setFailedBanner] = useState<string>();
  const [failedAvatar, setFailedAvatar] = useState<string>();
  const ContentWrapper = operational ? "div" : WrapperLayout;
  const ContentMain = operational ? "div" : "main";
  const NameHeading = operational ? "h2" : "h1";
  const content = (
    <div className="pb-8">
      <section className="relative h-56 w-full overflow-hidden bg-input-bg sm:h-72">
        {bannerUrl && failedBanner !== bannerUrl && (
          <>
            <img src={bannerUrl} alt="" className="h-full w-full object-cover" onError={() => setFailedBanner(bannerUrl)} />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </>
        )}
      </section>

      <ContentWrapper className={operational ? "px-4 pb-8 sm:px-8 lg:px-10" : undefined}>
        <ContentMain className="flex flex-col gap-8">
          <header className="-mt-14 flex flex-col items-start justify-between gap-5 rounded-surface border-ui bg-white p-5 shadow-surface sm:-mt-16 sm:flex-row sm:items-end sm:p-7">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end">
              {avatarUrl && failedAvatar !== avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="h-28 w-28 rounded-full border-4 border-white bg-input-bg object-cover shadow-hard sm:h-32 sm:w-32"
                  onError={() => setFailedAvatar(avatarUrl)}
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-input-bg text-label font-semi-bold text-operational-muted sm:h-32 sm:w-32">
                  {name.trim().charAt(0).toLocaleUpperCase()}
                </div>
              )}
              <div className="flex flex-col gap-1 pb-2">
                <NameHeading className="text-xl font-semi-bold sm:text-2xl">{name}</NameHeading>
                {subtitle && <p className="text-body text-input-text sm:text-body">{subtitle}</p>}
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
    <OperationalPage title={operationalTitle ?? name} actions={actions} profile centered sideBackground>
      {content}
    </OperationalPage>
  ) : (
    content
  );
}
