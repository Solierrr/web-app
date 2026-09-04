import Sidebar from "@@/layout/sidebar/Sidebar";
import WrapperLayout from "./WrapperLayout";

interface SaaSLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  ptop?: boolean;
  adapterSidebar?: React.ReactNode;
  onAdapterSidebarClose?: () => void;
}

export default function SaaSLayout({ children, sidebar, ptop = false, adapterSidebar, onAdapterSidebarClose }: SaaSLayoutProps) {
  return (
    <div className="flex w-full">
      <Sidebar>{sidebar}</Sidebar>

      <WrapperLayout ptop={ptop} adapterSidebar={adapterSidebar} onAdapterSidebarClose={onAdapterSidebarClose}>
        {children}
      </WrapperLayout>
    </div>
  );
}
