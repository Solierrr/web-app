import Skeleton from "@@/feedback/skeleton/Skeleton";
import WrapperLayout from "@/config/WrapperLayout";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { useTranslation } from "react-i18next";

/**
 * ProfilePageSkeleton
 *
 * Placeholder de carregamento para o template `ProfilePage`, usado por todas
 * as páginas de perfil (usuário, empresa, profissional) enquanto o service
 * ainda não resolveu os dados.
 */
export default function ProfilePageSkeleton({ operational = false, channel = false }: { operational?: boolean; channel?: boolean }) {
  const { t } = useTranslation("saas");
  if (operational) return <OperationalPage title={t("navigation.items.profile")} profile loading />;
  if (channel)
    return (
      <WrapperLayout className="max-w-marketplace-page px-5! pb-16 pt-6 sm:px-10! lg:px-18!">
        <div aria-busy="true" className="flex min-w-0 flex-col gap-10 sm:gap-12">
          <div className="h-56 w-full sm:h-72 lg:h-88">
            <Skeleton className="rounded-surface" />
          </div>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="size-20 shrink-0 sm:size-24">
              <Skeleton className="rounded-medium" />
            </div>
            <div className="flex flex-1 flex-col gap-3">
              <Skeleton height="2rem" width="75%" className="max-w-80" />
              <Skeleton height="1rem" width="50%" className="max-w-48" />
            </div>
          </div>
          <Skeleton height="5rem" className="w-full rounded-medium" />
        </div>
      </WrapperLayout>
    );
  return (
    <div aria-busy="true">
      <Skeleton height="15rem" className="rounded-none sm:h-80" />

      <WrapperLayout>
        <section className="flex flex-col gap-6">
          <div className="-mt-16 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end">
              <Skeleton height="8rem" width="8rem" className="rounded-full border-4 border-white" />
              <div className="flex flex-col gap-2 pb-2">
                <Skeleton height="1.65rem" width="12rem" />
                <Skeleton height="1.2rem" width="8rem" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Skeleton height="1.5rem" width="70%" />
            <Skeleton height="1.5rem" width="50%" />
          </div>
        </section>
      </WrapperLayout>
    </div>
  );
}
