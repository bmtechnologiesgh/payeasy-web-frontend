import type { SVGProps } from "react";
import { Icon32 } from "@/components/icons/Icon32";
import { iconStroke } from "@/components/icons/styles";

type Props = Omit<SVGProps<SVGSVGElement>, "children">;

/** Wall-mounted AC — louvers + airflow curves. */
export function IconCategoryAirConditioner(props: Props) {
  return (
    <Icon32 {...props}>
      <rect x="6" y="9" width="20" height="14" rx="2" {...iconStroke} />
      <path {...iconStroke} d="M9 14h14M9 17.5h14M9 21h14" />
      <path {...iconStroke} d="M11 26c2 1.5 4 2 5 2s3-.5 5-2M13 28c1.5.8 2.5 1 3 1s1.5-.2 3-1" />
    </Icon32>
  );
}

/** Generic major appliance — front-loader drum + panel. */
export function IconCategoryAppliance(props: Props) {
  return (
    <Icon32 {...props}>
      <rect x="7" y="6" width="18" height="21" rx="2.5" {...iconStroke} />
      <circle {...iconStroke} cx="16" cy="17" r="5.5" />
      <path {...iconStroke} d="M10 9.5h12" strokeWidth={1.03} />
      <path {...iconStroke} d="M12 11h8" strokeWidth={1.03} />
    </Icon32>
  );
}

/** Laptop — base + display. */
export function IconCategoryComputer(props: Props) {
  return (
    <Icon32 {...props}>
      <path {...iconStroke} strokeLinejoin="round" d="M7 21h18l-1.5-11h-15L7 21z" />
      <path {...iconStroke} d="M5 23h22" strokeLinecap="round" />
      <path {...iconStroke} d="M11 13h10" strokeLinecap="round" />
    </Icon32>
  );
}

/** True wireless earbuds — mirrored buds with stems. */
export function IconCategoryEarbuds(props: Props) {
  return (
    <Icon32 {...props}>
      <path {...iconStroke} strokeLinejoin="round" d="M9 14v8l2 4M23 14v8l-2 4" />
      <ellipse {...iconStroke} cx="9.5" cy="12" rx="3" ry="4" />
      <ellipse {...iconStroke} cx="22.5" cy="12" rx="3" ry="4" />
      <path {...iconStroke} d="M12.5 12c1.2-2 2.8-3 3.5-3s2.3 1 3.5 3" />
    </Icon32>
  );
}

/** Chest freezer — low profile + lid seam. */
export function IconCategoryFreezer(props: Props) {
  return (
    <Icon32 {...props}>
      <path {...iconStroke} strokeLinejoin="round" d="M5 17h22v9H5z" />
      <path {...iconStroke} d="M5 17l11-4 11 4" strokeLinejoin="round" />
      <path {...iconStroke} d="M16 13v4" strokeLinecap="round" />
      <path {...iconStroke} d="M9 22h14" strokeLinecap="round" />
    </Icon32>
  );
}

/** Refrigerator — tall twin doors. */
export function IconCategoryFridge(props: Props) {
  return (
    <Icon32 {...props}>
      <rect x="8" y="5" width="16" height="22" rx="2" {...iconStroke} />
      <path {...iconStroke} d="M16 5v22" />
      <path {...iconStroke} d="M11 14h3M11 18h3M20 14h3M20 18h3" strokeLinecap="round" />
      <circle cx="13.5" cy="24" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="18.5" cy="24" r="0.9" fill="currentColor" stroke="none" />
    </Icon32>
  );
}

/** Microwave — door window + keypad. */
export function IconCategoryMicrowaveOven(props: Props) {
  return (
    <Icon32 {...props}>
      <rect x="5" y="8" width="22" height="16" rx="2" {...iconStroke} />
      <circle {...iconStroke} cx="13" cy="16" r="4.5" />
      <path {...iconStroke} d="M19.5 12v1.5M19.5 15.5v1.5M19.5 19v1.5M22 12v1.5M22 15.5v1.5M22 19v1.5" strokeLinecap="round" />
    </Icon32>
  );
}

/** Monitor + desk / peripherals stack. */
export function IconCategoryOfficeItEquipment(props: Props) {
  return (
    <Icon32 {...props}>
      <rect x="5" y="7" width="14" height="10" rx="1.5" {...iconStroke} />
      <path {...iconStroke} d="M9 22h6M12 17v5" strokeLinecap="round" />
      <path {...iconStroke} strokeLinejoin="round" d="M20 10h6v12h-6z" />
      <path {...iconStroke} d="M21 13h4M21 16h4M21 19h3" strokeLinecap="round" />
    </Icon32>
  );
}

/** Wall charger + USB brick + cable hint. */
export function IconCategorySmartCharger(props: Props) {
  return (
    <Icon32 {...props}>
      <rect x="10" y="12" width="12" height="9" rx="1.5" {...iconStroke} />
      <path {...iconStroke} d="M13 21v4M19 21v4" strokeLinecap="round" />
      <path {...iconStroke} d="M16 25v2" strokeLinecap="round" />
      <path {...iconStroke} d="M6 14h3M6 17h3" strokeLinecap="round" />
      <path {...iconStroke} strokeLinejoin="round" d="M7 12v7h2" />
    </Icon32>
  );
}

/** Television — screen + stand. */
export function IconCategorySmartTelevision(props: Props) {
  return (
    <Icon32 {...props}>
      <rect x="5" y="8" width="22" height="14" rx="1.5" {...iconStroke} />
      <path {...iconStroke} d="M12 25h8M16 22v3" strokeLinecap="round" />
    </Icon32>
  );
}

export function IconCategorySmartphone(props: Props) {
  return (
    <Icon32 {...props}>
      <rect x="10" y="5" width="12" height="22" rx="2" {...iconStroke} />
      <path {...iconStroke} d="M14 24h4" strokeLinecap="round" />
    </Icon32>
  );
}

export function IconCategoryTablet(props: Props) {
  return (
    <Icon32 {...props}>
      <rect x="7" y="6" width="18" height="20" rx="2" {...iconStroke} />
      <path {...iconStroke} d="M16 23h.01" strokeLinecap="round" />
    </Icon32>
  );
}

export function IconCategorySmartWatch(props: Props) {
  return (
    <Icon32 {...props}>
      <path {...iconStroke} strokeLinejoin="round" d="M11 6h10l1 3H10l1-3zM10 24l1 3h10l1-3" />
      <rect x="9" y="9" width="14" height="14" rx="4" {...iconStroke} />
    </Icon32>
  );
}

export function IconCategoryWashingMachine(props: Props) {
  return (
    <Icon32 {...props}>
      <rect x="7" y="6" width="18" height="21" rx="2" {...iconStroke} />
      <circle {...iconStroke} cx="16" cy="17" r="5" />
      <path {...iconStroke} d="M10 9h12" strokeLinecap="round" />
      <circle cx="16" cy="17" r="1.2" fill="currentColor" stroke="none" />
    </Icon32>
  );
}

export function IconCategoryStove(props: Props) {
  return (
    <Icon32 {...props}>
      <rect x="6" y="10" width="20" height="14" rx="2" {...iconStroke} />
      <circle {...iconStroke} cx="11" cy="16" r="2.5" />
      <circle {...iconStroke} cx="21" cy="16" r="2.5" />
      <path {...iconStroke} d="M9 8h14" strokeLinecap="round" />
    </Icon32>
  );
}

export function IconCategoryVehicleAccessory(props: Props) {
  return (
    <Icon32 {...props}>
      <circle {...iconStroke} cx="10" cy="22" r="3.5" />
      <circle {...iconStroke} cx="22" cy="22" r="3.5" />
      <path {...iconStroke} strokeLinejoin="round" d="M7 22l3-8h12l3 8" />
      <path {...iconStroke} d="M10 14h12" strokeLinecap="round" />
    </Icon32>
  );
}

export function IconCategoryGrid(props: Props) {
  return (
    <Icon32 {...props}>
      <rect x="6" y="6" width="8" height="8" rx="1.5" {...iconStroke} />
      <rect x="18" y="6" width="8" height="8" rx="1.5" {...iconStroke} />
      <rect x="6" y="18" width="8" height="8" rx="1.5" {...iconStroke} />
      <rect x="18" y="18" width="8" height="8" rx="1.5" {...iconStroke} />
    </Icon32>
  );
}
