import type { ReactNode } from "react";
import type { SVGProps } from "react";

export type Icon32Props = Omit<SVGProps<SVGSVGElement>, "viewBox" | "children"> & {
  /** Accessible name when icon conveys meaning; omit for decorative icons. */
  title?: string;
  children: ReactNode;
};

/**
 * Base shell for the PayEasy / pack icons: 32×32 artboard, inherits `currentColor`.
 */
export function Icon32({ title, children, className, ...rest }: Icon32Props) {
  return (
    <svg
      viewBox="0 0 32 32"
      width="1em"
      height="1em"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}
