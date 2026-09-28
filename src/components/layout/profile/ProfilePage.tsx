import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import WrapperLayout from "@/config/WrapperLayout";

interface ProfilePageProps {
  bannerUrl?: string;
  avatarUrl?: string;
  name: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: ReactNode;
  children?: ReactNode;
}

export default function ProfilePage({ bannerUrl, avatarUrl, name, subtitle, eyebrow, actions, children }: ProfilePageProps) {
  const { t } = useTranslation("profile", { keyPrefix: "shared" });
  const bannerBackground = bannerUrl
    ? `linear-gradient(90deg, rgb(22 34 27 / 40%), rgb(22 34 27 / 4%)), url(${bannerUrl}), radial-gradient(ellipse at 78% 25%, rgb(255 255 255 / 50%), transparent 26%), radial-gradient(ellipse at 18% 110%, rgb(0 170 87 / 28%), transparent 40%), linear-gradient(110deg, #dce8dc, #edf0e8 54%, #f5e2c9)`
    : "radial-gradient(ellipse at 78% 25%, rgb(255 255 255 / 50%), transparent 26%), radial-gradient(ellipse at 18% 110%, rgb(0 170 87 / 28%), transparent 40%), linear-gradient(110deg, #dce8dc, #edf0e8 54%, #f5e2c9)";

  return (
    <div className="min-h-full bg-[#f7f7f5] pb-16">
      <section
        aria-label={name}
        className="relative h-48 w-full overflow-hidden bg-[#dfe7dc] bg-cover bg-center sm:h-64 lg:h-72"
        style={{ backgroundImage: bannerBackground }}>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-orange via-[#f0a64c] to-green" />
      </section>

      <WrapperLayout>
        <div className="mx-auto -mt-14 flex max-w-6xl flex-col gap-8 sm:-mt-16">
          <header className="relative flex flex-col gap-5 rounded-hard border border-black/5 bg-white p-5 pt-7 shadow-soft-black sm:flex-row sm:items-end sm:gap-6 sm:p-7 sm:pt-8">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="-mt-20 size-24 shrink-0 rounded-hard border-4 border-white bg-[#e8ece7] object-cover shadow-soft-black sm:-mt-20 sm:size-32"
              />
            ) : (
              <div
                aria-hidden="true"
                className="-mt-20 grid size-24 shrink-0 place-items-center rounded-hard border-4 border-white bg-green text-3xl font-bold text-white shadow-soft-black sm:-mt-20 sm:size-32">
                {name.trim().charAt(0).toLocaleUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1 pb-1">
              {eyebrow && <p className="mb-2 text-lower font-semi-bold uppercase tracking-[0.16em] text-green">{eyebrow}</p>}
              <h1 className="break-words text-subtitle sm:text-title">{name}</h1>
              {subtitle && <p className="mt-2 break-words text-black/65">{subtitle}</p>}
            </div>
            {actions && <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pb-1">{actions}</div>}
          </header>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="min-w-0 space-y-5">{children}</div>
            <aside className="hidden lg:block">
              <div className="sticky top-8 rounded-hard border border-black/5 bg-white p-5">
                <span aria-hidden="true" className="mb-4 block h-1 w-12 rounded-full bg-orange" />
                <p className="text-lower font-semi-bold uppercase tracking-[0.12em] text-black/45">{t("brand")}</p>
                <p className="mt-2 text-sm leading-6 text-black/65">{t("brandMessage")}</p>
              </div>
            </aside>
          </div>
        </div>
      </WrapperLayout>
    </div>
  );
}
