import { Home, User, Settings, Search, ChevronDown, X, Eye, EyeOff, ShoppingCart, Globe, type LucideIcon } from "lucide-react";
import Colors from "@/domain/enum/colors";
import { InvalidIconError } from "@/domain/errors/InvalidIconError";

const icons = {
  home: Home,
  user: User,
  settings: Settings,
  search: Search,
  chevronDown: ChevronDown,
  x: X,
  eye: Eye,
  eyeOff: EyeOff,
  shoppingCart: ShoppingCart,
  globe: Globe,
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

export default function Icon({ name, color = Colors.Black, size = 24, strokeWidth = 2, absoluteStrokeWidth = false, className }: IconProps) {
  const IconComponent = icons[name];
  if (!IconComponent) throw InvalidIconError.notFound(name);

  return <IconComponent size={size} color={color}
    strokeWidth={strokeWidth} absoluteStrokeWidth={absoluteStrokeWidth} className={className} />;
}
