import Icon from "@@/ui/icon/Icon";

interface AdapterSidebarProps {
  children: React.ReactNode;
  onClose?: () => void;
}

export default function AdapterSidebar({ children, onClose }: AdapterSidebarProps) {
  return (
    <aside className="fixed inset-0 z-50 flex h-full w-full flex-col bg-white lg:static lg:z-auto lg:w-96 lg:shrink-0 lg:shadow-soft-black">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="flex items-center-safe justify-center self-end p-2 m-2 rounded-medium cursor-pointer hover:bg-input-bg">
          <Icon name="x" />
        </button>
      )}

      <div className="flex-1 overflow-y-auto">{children}</div>
    </aside>
  );
}
