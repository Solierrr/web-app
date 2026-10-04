import { useId } from "react";
import {
  Menu,
  LogIn,
  LogOut,
  MessagesSquare,
  MessageSquare,
  Users,
  PanelsTopLeft,
  Home,
  User,
  Settings,
  Search,
  ChevronDown,
  ChevronLeft,
  X,
  Eye,
  EyeOff,
  ShoppingCart,
  Globe,
  type LucideIcon,
  Heart,
  LoaderCircle,
  Building2,
  ChartColumn,
  Check,
  PanelLeftOpen,
  PanelLeftClose,
  Sparkles,
  LayoutGrid,
  Send,
  SquarePen,
  UserRoundCheck,
  ArrowUp,
  Paperclip,
  Mic,
  Square,
  Image,
  FileText,
  History,
} from "lucide-react";
import Colors from "@/lib/shared/styles/colors/colors.enum";
import { FcGoogle } from "react-icons/fc";
import { FaMicrosoft } from "react-icons/fa";
import { InvalidIconError } from "@/features/error/invalid-icon/InvalidIcon.error";

const icons = {
  sparkles: Sparkles,
  layoutGrid: LayoutGrid,
  send: Send,
  newConversation: SquarePen,
  userRoundCheck: UserRoundCheck,
  arrowUp: ArrowUp,
  paperclip: Paperclip,
  microphone: Mic,
  stop: Square,
  image: Image,
  document: FileText,
  history: History,
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
  panels: PanelsTopLeft,
  home: Home,
  user: User,
  settings: Settings,
  search: Search,
  chevronDown: ChevronDown,
  chevronLeft: ChevronLeft,
  x: X,
  eye: Eye,
  eyeOff: EyeOff,
  shoppingCart: ShoppingCart,
  globe: Globe,
  heart: Heart,
  loader: LoaderCircle,
  building: Building2,
  chart: ChartColumn,
} satisfies Record<string, LucideIcon | typeof FcGoogle>;

export type IconName = keyof typeof icons;

interface IconProps {
  name: IconName;
  color?: Colors | string;
  size?: number;
  strokeWidth?: number;
  absoluteStrokeWidth?: boolean;

  className?: string;
  gradient?: "orange";
}

export default function Icon({
  name,
  color = Colors.BLACK,
  size = 24,
  strokeWidth = 2,
  absoluteStrokeWidth = false,
  className,
  gradient,
}: IconProps) {
  const gradientId = useId();
  const IconComponent = icons[name];
  if (!IconComponent) throw InvalidIconError.notFound(name);

  return (
    <IconComponent
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      absoluteStrokeWidth={absoluteStrokeWidth}
      className={`${className ?? ""} ${gradient ? "ai-orange-gradient" : ""}`}
      {...(gradient ? { stroke: `url(#${gradientId})` } : {})}>
      {gradient && (
        <defs>
          <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={24} y2={24}>
            <stop offset="0%" />
            <stop offset="25%" />
            <stop offset="50%" />
            <stop offset="75%" />
            <stop offset="100%" />
          </linearGradient>
        </defs>
      )}
    </IconComponent>
  );
}
