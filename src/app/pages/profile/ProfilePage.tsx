import type { ReactNode } from "react";
import WrapperLayout from "@@/layout/wrappers/WrapperLayout";

const DEFAULT_BANNER =
  "https://fastly.picsum.photos/id/918/1600/400.jpg?hmac=1gEvFp6O-XDh4848VnlwyOIrVy8s_aJNhYyTzxN9_JA";
const DEFAULT_AVATAR = "https://i.pravatar.cc/300";

interface ProfilePageProps {
  bannerUrl?: string;
  avatarUrl?: string;
  name: string;
  subtitle?: string;
  actions?: ReactNode;
  children?: ReactNode;
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
}: ProfilePageProps) {
  return (
    <div>
      <section
        className="h-60 w-full bg-input-bg bg-cover bg-center sm:h-80"
        style={{ backgroundImage: `url(${bannerUrl})` }}
      />

      <WrapperLayout>
        <section className="flex flex-col gap-6">
          <div className="-mt-16 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end">
              <img
                src={avatarUrl}
                alt={name}
                className="h-32 w-32 rounded-full border-4 border-white bg-input-bg object-cover"
              />
              <div className="flex flex-col gap-1 pb-2">
                <h1>{name}</h1>
                {subtitle && <p className="text-input-text">{subtitle}</p>}
              </div>
            </div>

            {actions && <div className="flex flex-row gap-2">{actions}</div>}
          </div>

          {children}
        </section>
      </WrapperLayout>
    </div>
  );
}
