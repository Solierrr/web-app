import Skeleton from "@@/feedback/skeleton/Skeleton";
import WrapperLayout from "@/config/WrapperLayout";

export default function ProfilePageSkeleton() {
  return (
    <div aria-busy="true" className="min-h-full bg-[#f7f7f5] pb-16">
      <Skeleton height="18rem" className="rounded-none" />
      <WrapperLayout>
        <div className="mx-auto -mt-14 flex max-w-6xl flex-col gap-8 sm:-mt-16">
          <div className="flex flex-col gap-5 rounded-hard border border-black/5 bg-white p-5 pt-7 shadow-soft-black sm:flex-row sm:items-end sm:gap-6 sm:p-7 sm:pt-8">
            <Skeleton height="8rem" width="8rem" className="-mt-20 shrink-0 rounded-hard border-4 border-white sm:size-32" />
            <div className="flex flex-1 flex-col gap-3 pb-1">
              <Skeleton height="0.9rem" width="7rem" />
              <Skeleton height="2rem" width="16rem" />
              <Skeleton height="1.2rem" width="10rem" />
            </div>
            <Skeleton height="2.75rem" width="7rem" className="rounded-full" />
          </div>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="rounded-hard border border-black/5 bg-white p-5 sm:p-7">
              <Skeleton height="1.5rem" width="12rem" className="mb-5" />
              <Skeleton height="1.1rem" width="70%" className="my-3" />
              <Skeleton height="1.1rem" width="55%" className="my-3" />
            </div>
            <Skeleton height="8rem" className="hidden rounded-hard lg:block" />
          </div>
        </div>
      </WrapperLayout>
    </div>
  );
}
