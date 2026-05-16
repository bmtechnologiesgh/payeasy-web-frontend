import type { MerchantNavItem } from "@/components/merchant/merchant-nav";

type Props = {
  name: MerchantNavItem["icon"];
  className?: string;
};

export function MerchantNavIcon({ name, className = "size-5" }: Props) {
  const stroke = "currentColor";
  const common = { className, fill: "none", stroke, strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  switch (name) {
    case "dashboard":
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...common}>
          <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
        </svg>
      );
    case "orders":
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...common}>
          <path d="M7 4h10l2 4v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4h2Z" />
          <path d="M9 9h6M9 13h6" />
        </svg>
      );
    case "products":
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...common}>
          <path d="M4 7.5 12 3l8 4.5V16.5L12 21l-8-4.5V7.5Z" />
          <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
        </svg>
      );
    case "profile":
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20a7 7 0 0 1 14 0" />
        </svg>
      );
    case "settings":
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      );
    default:
      return null;
  }
}
