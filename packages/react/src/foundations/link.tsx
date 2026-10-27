import type { AnchorHTMLAttributes, Ref } from "react";

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  ref?: Ref<HTMLAnchorElement>;
}

/**
 * Framework-neutral link used inside components (e.g. Breadcrumb). It renders
 * a plain anchor so the library doesn't depend on a router; apps that want
 * client-side navigation can wrap their router's link around component usage.
 */
export function Link({ ref, ...props }: LinkProps) {
  return <a ref={ref} {...props} />;
}
