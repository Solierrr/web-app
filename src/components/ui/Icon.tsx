import { Home, User, Settings, Search, ChevronDown, X, Eye, EyeOff, ShoppingCart, type LucideIcon } from "lucide-react";
import Colors from "@/domain/enum/colors";
import { InvalidIconError } from "@/domain/errors/InvalidIconError";

const icons: Record<string, LucideIcon> = {
  home: Home,
  user: User,
  settings: Settings,
  search: Search,
  chevronDown: ChevronDown,
  x: X,
  eye: Eye,
  eyeOff: EyeOff,
  shoppingCart: ShoppingCart,
};

export type IconName = keyof typeof icons;

interface IconProps {
  name: IconName;
  color?: Colors;
  size?: number;
  strokeWidth?: number;
  absoluteStrokeWidth?: boolean;
  
  className?: string;
}

function Icon({ name, color = Colors.Black, size = 24, strokeWidth = 2, absoluteStrokeWidth = false, className }: IconProps) {
  const IconComponent = icons[name];
  if (!IconComponent) throw InvalidIconError.notFound(name);

  return <IconComponent size={size} color={color}
    strokeWidth={strokeWidth} absoluteStrokeWidth={absoluteStrokeWidth} className={className} />;
}

export default Icon;