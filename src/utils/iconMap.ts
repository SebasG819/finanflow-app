import {
  Bike,
  BriefcaseBusiness,
  CircleDollarSign,
  Fuel,
  Laptop,
  Plane,
  Receipt,
  RotateCcw,
  ShoppingCart,
  Utensils,
  Wifi,
} from 'lucide-react';

export const iconMap = {
  bike: Bike,
  briefcase: BriefcaseBusiness,
  cash: CircleDollarSign,
  fuel: Fuel,
  laptop: Laptop,
  plane: Plane,
  receipt: Receipt,
  refund: RotateCcw,
  shopping: ShoppingCart,
  utensils: Utensils,
  wifi: Wifi,
};

export type IconName = keyof typeof iconMap;
