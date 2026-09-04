import AdapterSidebar from "./AdapterSidebar";

interface WrapperLayoutProps {
  children: React.ReactNode;
  ptop?: boolean;
  adapterSidebar?: React.ReactNode;
  onAdapterSidebarClose?: () => void;
}

export default function WrapperLayout({ children, ptop = false, adapterSidebar, onAdapterSidebarClose }: WrapperLayoutProps) {
  return (
    <div className="flex w-full">
      <main className={`mx-auto w-full xl:px-50 lg:px-40 md:px-20 sm:px-10 ${ptop ? "pt-10" : ""}`}>{children}</main>

      {adapterSidebar && <AdapterSidebar onClose={onAdapterSidebarClose}>{adapterSidebar}</AdapterSidebar>}
    </div>
  );
}
