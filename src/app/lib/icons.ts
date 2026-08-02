import {
  Smartphone, Laptop, Headphones, Watch, Monitor, Gamepad2, Tv, Camera, Home,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

export const CATEGORY_ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  Smartphone, Laptop, Headphones, Watch, Monitor, Gamepad2, Tv, Camera, Home,
};
