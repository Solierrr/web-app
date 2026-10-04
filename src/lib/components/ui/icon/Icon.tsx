import MotionIcon from "./Icon.motion";
import { useId } from "react";
import {
  IconPlus,
  IconArchive,
  IconDownload as Download,
  IconZoomIn as ZoomIn,
  IconZoomOut as ZoomOut,
  IconMenu2 as Menu,
  IconLogin as LogIn,
  IconLogout as LogOut,
  IconMessages as MessagesSquare,
  IconMessage as MessageSquare,
  IconUsers as Users,
  IconSolarPanel as SolarPanel,
  IconHome as Home,
  IconUser as User,
  IconSettings as Settings,
  IconSearch as Search,
  IconAdjustmentsHorizontal as SlidersHorizontal,
  IconChevronDown as ChevronDown,
  IconChevronLeft as ChevronLeft,
  IconChevronRight as ChevronRight,
  IconChevronsLeft as ChevronsLeft,
  IconChevronsRight as ChevronsRight,
  IconX as X,
  IconEye as Eye,
  IconEyeOff as EyeOff,
  IconShoppingCart as ShoppingCart,
  IconWorld as Globe,
  IconHeart as Heart,
  IconLoader2 as LoaderCircle,
  IconBuilding as Building2,
  IconChartBar as ChartColumn,
  IconCheck as Check,
  IconLayoutSidebarLeftExpand as PanelLeftOpen,
  IconLayoutSidebarLeftCollapse as PanelLeftClose,
  IconSparkles as Sparkles,
  IconLayoutGrid as LayoutGrid,
  IconSend as Send,
  IconEdit as SquarePen,
  IconUserCheck as UserRoundCheck,
  IconArrowUp as ArrowUp,
  IconMinus as Minus,
  IconPaperclip as Paperclip,
  IconMicrophone as Mic,
  IconSquare as Square,
  IconPhoto as Image,
  IconFileText as FileText,
  IconRotateClockwise2 as History,
  IconClipboardCheck,
  IconBuildingCog,
  IconPasswordUser,
  IconFolder,
  IconFolderOpen,
  IconUserSquareRounded,
  IconUserHexagon,
  IconUserPentagon,
  IconClock as Clock,
  IconPencil as Pencil,
  IconTrash as Trash2,
  IconDots as Ellipsis,
  IconRefresh as RotateCw,
  IconFilterOff as FilterX,
  IconArrowsSort as ArrowDownUp,
  type TablerIcon,
} from "@tabler/icons-react";
import Colors from "@/lib/shared/styles/colors/colors.enum";
import { FcGoogle } from "react-icons/fc";
import { FaMicrosoft } from "react-icons/fa";
import { InvalidIconError } from "@/features/error/invalid-icon/InvalidIcon.error";

const icons = {
  archive: IconArchive,
  plus: IconPlus,
  companySettings: IconBuildingCog,
  registrations: IconClipboardCheck,
  employeeAccess: IconPasswordUser,
  folder: IconFolder,
  folderOpen: IconFolderOpen,
  account: IconUserSquareRounded,
  accountHexagon: IconUserHexagon,
  accountPentagon: IconUserPentagon,
  download: Download,
  zoomIn: ZoomIn,
  zoomOut: ZoomOut,
  more: Ellipsis,
  refresh: RotateCw,
  filterRemove: FilterX,
  sort: ArrowDownUp,
  sparkles: Sparkles,
  layoutGrid: LayoutGrid,
  send: Send,
  newConversation: SquarePen,
  userRoundCheck: UserRoundCheck,
  arrowUp: ArrowUp,
  minus: Minus,
  paperclip: Paperclip,
  microphone: Mic,
  stop: Square,
  image: Image,
  document: FileText,
  history: History,
  clock: Clock,
  edit: Pencil,
  trash: Trash2,
  google: FcGoogle,
  microsoft: FaMicrosoft,
  check: Check,
  panelLeftOpen: PanelLeftOpen,
  panelLeftClose: PanelLeftClose,
  menu: Menu,
  login: LogIn,
  logout: LogOut,
  messages: MessageSquare,
  messagesSquare: MessagesSquare,
  users: Users,
  panels: SolarPanel,
  home: Home,
  user: User,
  settings: Settings,
  search: Search,
  filter: SlidersHorizontal,
  chevronDown: ChevronDown,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronsLeft: ChevronsLeft,
  chevronsRight: ChevronsRight,
  x: X,
  eye: Eye,
  eyeOff: EyeOff,
  shoppingCart: ShoppingCart,
  globe: Globe,
  heart: Heart,
  loader: LoaderCircle,
  building: Building2,
  chart: ChartColumn,
} satisfies Record<string, TablerIcon | typeof FcGoogle>;

export type IconName = keyof typeof icons;

interface IconProps {
  name: IconName;
  color?: Colors | string;
  size?: number;
  strokeWidth?: number;
  absoluteStrokeWidth?: boolean;

  className?: string;
  gradient?: "orange";
  motion?: "folder" | "account";
}

export default function Icon({
  name,
  color = Colors.BLACK,
  size = 24,
  strokeWidth = 2,
  absoluteStrokeWidth = false,
  className,
  gradient,
  motion,
}: IconProps) {
  const gradientId = useId();
  const IconComponent = icons[name];
  if (!IconComponent) throw InvalidIconError.notFound(name);

  const gradientDefinition = gradient && (
    <defs>
      <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={24} y2={24}>
        <stop offset="0%" />
        <stop offset="25%" />
        <stop offset="50%" />
        <stop offset="75%" />
        <stop offset="100%" />
      </linearGradient>
    </defs>
  );

  if (motion) {
    return (
      <MotionIcon
        motion={motion}
        size={size}
        color={gradient ? `url(#${gradientId})` : color}
        strokeWidth={absoluteStrokeWidth && size > 0 ? (strokeWidth * 24) / size : strokeWidth}
        className={`${className ?? ""} ${gradient ? "ai-orange-gradient" : ""}`}>
        {gradientDefinition}
      </MotionIcon>
    );
  }
  return (
    <IconComponent
      size={size}
      color={gradient ? `url(#${gradientId})` : color}
      strokeWidth={absoluteStrokeWidth && size > 0 ? (strokeWidth * 24) / size : strokeWidth}
      aria-hidden="true"
      focusable="false"
      className={`${className ?? ""} ${gradient ? "ai-orange-gradient" : ""}`}>
      {gradientDefinition}
    </IconComponent>
  );
}
