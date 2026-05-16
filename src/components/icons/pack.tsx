import type { SVGProps } from "react";
import { Icon32 } from "@/components/icons/Icon32";
import { iconStroke } from "@/components/icons/styles";

type Props = Omit<SVGProps<SVGSVGElement>, "children">;

/** Compare — paths from pack reference (mirrored curves + accent dots). */
export function IconCompare(props: Props) {
  return (
    <Icon32 {...props}>
      <path
        fill="currentColor"
        d="M26.526 8.381c0 .378-.307.686-.686.686s-.686-.307-.686-.686c0-.378.307-.686.686-.686s.686.307.686.686z"
      />
      <path
        {...iconStroke}
        d="M24 11.429v0c-1.071.714-1.714 1.915-1.714 3.203v7.279c0 .606-.241 1.187-.67 1.616v0c-.893.893-2.339.893-3.232 0v0c-.429-.429-.67-1.01-.67-1.616v-13.323c0-3.175 2.297-5.975 5.4-6.273 2.494-.241 4.71 1.08 5.817 3.114.477.874-.001 1.881-.001 2.952s.478 2.078.001 2.952c-1.021 1.874-2.982 3.143-5.235 3.143l-1.296-.009"
      />
      <path
        {...iconStroke}
        strokeWidth={1.03}
        d="M20.654 8.381c0-1.683 1.365-3.048 3.048-3.048"
      />
      <path
        fill="currentColor"
        d="M5.474 14.095c0 .378.307.686.686.686s.686-.307.686-.686c0-.378-.307-.686-.686-.686s-.686.307-.686.686z"
      />
      <path
        {...iconStroke}
        d="M8 17.143v0c1.071.714 1.714 1.915 1.714 3.203v7.279c0 .606.241 1.187.67 1.616v0c.893.893 2.339.893 3.232 0v0c.429-.429.67-1.01.67-1.616v-13.323c0-3.175-2.297-5.975-5.4-6.273-2.494-.241-4.71 1.08-5.817 3.114-.477.874.001 1.881.001 2.952s-.478 2.078-.001 2.952c1.021 1.874 2.982 3.143 5.235 3.143l1.296-.009"
      />
      <path
        {...iconStroke}
        strokeWidth={1.03}
        d="M11.346 14.095c0-1.683-1.365-3.048-3.048-3.048"
      />
    </Icon32>
  );
}

export function IconMenu(props: Props) {
  return (
    <Icon32 {...props}>
      <path {...iconStroke} d="M7 10h18M7 16h18M7 22h18" />
    </Icon32>
  );
}

export function IconSearch(props: Props) {
  return (
    <Icon32 {...props}>
      <circle {...iconStroke} cx="14" cy="14" r="5.5" />
      <path {...iconStroke} d="M18.5 18.5l6 6" />
    </Icon32>
  );
}

export function IconUser(props: Props) {
  return (
    <Icon32 {...props}>
      <circle {...iconStroke} cx="16" cy="11" r="4.25" />
      <path {...iconStroke} d="M8 26.5v-.5c0-3 2.5-5.5 8-5.5s8 2.5 8 5.5v.5" />
    </Icon32>
  );
}

export function IconHeart(props: Props) {
  return (
    <Icon32 {...props}>
      <path
        {...iconStroke}
        strokeLinejoin="round"
        d="M16 26s-9-5.2-9-12a5.5 5.5 0 0110-3 5.5 5.5 0 0110 3c0 6.8-9 12-9 12z"
      />
    </Icon32>
  );
}

/** Orders / track parcel — closed box with lid seam (distinct from wishlist heart). */
export function IconPackage(props: Props) {
  return (
    <Icon32 {...props}>
      <path {...iconStroke} strokeLinejoin="round" d="M9 15h14v11a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 019 26V15z" />
      <path {...iconStroke} strokeLinejoin="round" d="M9 15V13.5A1.5 1.5 0 0110.5 12h11A1.5 1.5 0 0123 13.5V15" />
      <path {...iconStroke} strokeLinejoin="round" d="M9 15l7-3.5L23 15" />
    </Icon32>
  );
}

export function IconCart(props: Props) {
  return (
    <Icon32 {...props}>
      <path {...iconStroke} strokeLinejoin="round" d="M7 10h18l-2 11H10L7 10z" />
      <path {...iconStroke} d="M7 10l-1.5-3H4" />
      <circle cx="11.5" cy="26" r="1.35" fill="currentColor" stroke="none" />
      <circle cx="22.5" cy="26" r="1.35" fill="currentColor" stroke="none" />
    </Icon32>
  );
}

export function IconChevronLeft(props: Props) {
  return (
    <Icon32 {...props}>
      <path {...iconStroke} strokeLinejoin="round" d="M19 9l-7 7 7 7" />
    </Icon32>
  );
}

export function IconChevronRight(props: Props) {
  return (
    <Icon32 {...props}>
      <path {...iconStroke} strokeLinejoin="round" d="M13 9l7 7-7 7" />
    </Icon32>
  );
}

export function IconChevronDown(props: Props) {
  return (
    <Icon32 {...props}>
      <path {...iconStroke} strokeLinejoin="round" d="M9 13l7 7 7-7" />
    </Icon32>
  );
}

export function IconArrowUp(props: Props) {
  return (
    <Icon32 {...props}>
      <path {...iconStroke} strokeLinejoin="round" d="M16 26V7M16 7l-7 7M16 7l7 7" />
    </Icon32>
  );
}

/** Home tab — outline house (mobile bottom nav). */
export function IconHome(props: Props) {
  return (
    <Icon32 {...props}>
      <path {...iconStroke} strokeLinejoin="round" d="M6 14l10-8 10 8v12a1.5 1.5 0 01-1.5 1.5h-5v-7h-7v7H7.5A1.5 1.5 0 016 26V14z" />
    </Icon32>
  );
}

/** Shop tab — four-dot grid (per mobile reference). */
export function IconShop(props: Props) {
  return (
    <Icon32 {...props}>
      <circle {...iconStroke} cx="11" cy="11" r="2.25" />
      <circle {...iconStroke} cx="21" cy="11" r="2.25" />
      <circle {...iconStroke} cx="11" cy="21" r="2.25" />
      <circle {...iconStroke} cx="21" cy="21" r="2.25" />
    </Icon32>
  );
}

/** Quick view — eye (product card toolbar). */
export function IconEye(props: Props) {
  return (
    <Icon32 {...props}>
      <ellipse {...iconStroke} cx="16" cy="16" rx="9" ry="5.5" />
      <circle {...iconStroke} cx="16" cy="16" r="2.5" />
    </Icon32>
  );
}
