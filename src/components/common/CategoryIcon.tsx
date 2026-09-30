import {
  Briefcase,
  Coins,
  Sparkles,
  ShoppingBag,
  Tv,
  Home,
  Car,
  Utensils,
  HeartPulse,
  TrendingUp,
  LineChart,
  Bitcoin,
  ShieldCheck,
  Landmark,
  CircleDollarSign,
  ArrowDownLeft,
  Building2,
  RotateCcw,
  Gift,
  Percent,
  Wallet,
  Laptop,
  GraduationCap,
  Banknote,
  Send,
  Plane,
  MoreHorizontal,
} from 'lucide-react';

interface CategoryIconProps {
  iconName?: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  iconName = '',
  className = 'h-5 w-5',
}) => {
  switch (iconName.toLowerCase()) {
    case 'briefcase':
      return <Briefcase className={className} />;
    case 'arrowdownleft':
      return <ArrowDownLeft className={className} />;
    case 'coins':
      return <Coins className={className} />;
    case 'sparkles':
      return <Sparkles className={className} />;
    case 'laptop':
      return <Laptop className={className} />;
    case 'building2':
    case 'building':
      return <Building2 className={className} />;
    case 'rotateccw':
      return <RotateCcw className={className} />;
    case 'gift':
      return <Gift className={className} />;
    case 'percent':
      return <Percent className={className} />;
    case 'wallet':
      return <Wallet className={className} />;
    case 'shoppingbag':
      return <ShoppingBag className={className} />;
    case 'tv':
      return <Tv className={className} />;
    case 'home':
      return <Home className={className} />;
    case 'car':
      return <Car className={className} />;
    case 'utensils':
      return <Utensils className={className} />;
    case 'heartpulse':
      return <HeartPulse className={className} />;
    case 'trendingup':
      return <TrendingUp className={className} />;
    case 'linechart':
      return <LineChart className={className} />;
    case 'bitcoin':
      return <Bitcoin className={className} />;
    case 'shieldcheck':
      return <ShieldCheck className={className} />;
    case 'vault':
      return <Landmark className={className} />;
    case 'graduationcap':
      return <GraduationCap className={className} />;
    case 'banknote':
      return <Banknote className={className} />;
    case 'send':
      return <Send className={className} />;
    case 'plane':
      return <Plane className={className} />;
    case 'morehorizontal':
      return <MoreHorizontal className={className} />;
    default:
      return <CircleDollarSign className={className} />;
  }
};
