import Image from "next/image";
import { hasProductImage } from "@/lib/product-image";

type Props = {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  category?: string;
};

export function ProductImage({ src, alt, className = "object-contain p-4", fill = true, sizes, priority, category }: Props) {
  if (!hasProductImage(src)) {
    const label = category?.slice(0, 2).toUpperCase() || "—";

    return (
      <div
        className={`flex items-center justify-center bg-[color:var(--color-muted-bg)] text-sm font-bold text-[color:var(--color-muted)] ${fill ? "absolute inset-0" : "size-full min-h-[120px]"}`}
        aria-hidden
      >
        {label}
      </div>
    );
  }

  return (
    <Image src={src} alt={alt} fill={fill} sizes={sizes} priority={priority} className={className} unoptimized />
  );
}
