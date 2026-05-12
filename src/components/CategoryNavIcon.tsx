import type { ComponentType } from "react";
import type { SVGProps } from "react";
import {
  IconCategoryAirConditioner,
  IconCategoryAppliance,
  IconCategoryComputer,
  IconCategoryEarbuds,
  IconCategoryFreezer,
  IconCategoryFridge,
  IconCategoryGrid,
  IconCategoryMicrowaveOven,
  IconCategoryOfficeItEquipment,
  IconCategorySmartCharger,
  IconCategorySmartphone,
  IconCategorySmartTelevision,
  IconCategorySmartWatch,
  IconCategoryStove,
  IconCategoryTablet,
  IconCategoryVehicleAccessory,
  IconCategoryWashingMachine,
} from "@/components/icons/categoryPack";

type IconProps = Omit<SVGProps<SVGSVGElement>, "children">;

const iconClass = "h-5 w-5 shrink-0 text-[color:var(--color-muted)]";

const bySlug: Record<string, ComponentType<IconProps>> = {
  "air-conditioner": IconCategoryAirConditioner,
  appliance: IconCategoryAppliance,
  computer: IconCategoryComputer,
  earbuds: IconCategoryEarbuds,
  freezer: IconCategoryFreezer,
  fridge: IconCategoryFridge,
  "microwave-oven": IconCategoryMicrowaveOven,
  "office-and-it-equipment": IconCategoryOfficeItEquipment,
  "smart-charger": IconCategorySmartCharger,
  "smart-television": IconCategorySmartTelevision,
  "smart-watch": IconCategorySmartWatch,
  smartphone: IconCategorySmartphone,
  "smartphone-uk-used": IconCategorySmartphone,
  tablet: IconCategoryTablet,
  stove: IconCategoryStove,
  "vehicle-accessory": IconCategoryVehicleAccessory,
  "washing-machine": IconCategoryWashingMachine,
};

/** Sidebar category icons — 32×32 pack style, unique glyphs per slug where possible. */
export function CategoryNavIcon({ slug }: { slug: string; name: string }) {
  const Icon = bySlug[slug];
  if (Icon) {
    return <Icon className={iconClass} aria-hidden />;
  }
  return <IconCategoryGrid className={iconClass} aria-hidden />;
}
