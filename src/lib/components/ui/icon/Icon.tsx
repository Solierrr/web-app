import { Menu, LogOut, MessageSquare, Users, PanelsTopLeft, Home, User, Settings, Search, ChevronDown, ChevronLeft, X, Eye, EyeOff, ShoppingCart, Globe, type LucideIcon, Heart, LoaderCircle, Building2, ChartColumn } from "lucide-react";
import Colors from "@/lib/shared/styles/colors/colors.enum";
import { InvalidIconError } from "@/features/error/invalid-icon/InvalidIcon.error";

const icons = {
  menu: Menu,
  logout: LogOut,
  messages: MessageSquare,
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
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;

interface IconProps {
  name: IconName;
  color?: Colors;
  size?: number;
  strokeWidth?: number;
  absoluteStrokeWidth?: boolean;

  className?: string;
}

export default function Icon({ name, color = Colors.BLACK, size = 24, strokeWidth = 2, absoluteStrokeWidth = false, className }: IconProps) {
  const IconComponent = icons[name];
  if (!IconComponent) throw InvalidIconError.notFound(name);

  return <IconComponent size={size} color={color} strokeWidth={strokeWidth} absoluteStrokeWidth={absoluteStrokeWidth} className={className} />;
}
