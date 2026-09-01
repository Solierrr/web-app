import Skeleton from "@@/feedbacks/skeleton/Skeleton";
import WrapperLayout from "@/config/WrapperLayout";

/**
 * ProfilePageSkeleton
 *
 * Placeholder de carregamento para o template `ProfilePage`, usado por todas
 * as páginas de perfil (usuário, empresa, profissional) enquanto o service
 * ainda não resolveu os dados.
 */
export default function ProfilePageSkeleton() {
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
