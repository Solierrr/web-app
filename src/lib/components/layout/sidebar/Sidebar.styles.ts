export const SIDEBAR_ICON_SIZE = 18;

export function sidebarItemClass(collapsed: boolean): string {
  return `flex h-11 lg:h-9 min-w-0 shrink-0 cursor-pointer items-center overflow-hidden rounded-small py-2 text-sidebar font-medium leading-5 aria-[current=page]:font-semi-bold focus-visible:outline-2 focus-visible:outline-operational-ink focus-visible:-outline-offset-2 transition-[gap,background-color,color] duration-250 ease-in-out motion-reduce:transition-none ${collapsed ? "justify-center gap-0 px-0" : "gap-2 px-3"}`;
}

export function sidebarLabelClass(collapsed: boolean): string {
  return `min-w-0 truncate text-sidebar leading-5 transition-[max-width,opacity] duration-250 ease-in-out motion-reduce:transition-none ${collapsed ? "max-w-0 opacity-0" : "max-w-48 opacity-100"}`;
}
