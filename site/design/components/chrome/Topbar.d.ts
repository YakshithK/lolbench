import * as React from "react";

export interface TopbarNavItem { label: string; href?: string; onClick?: (e: React.MouseEvent) => void }

/**
 * Page chrome: 56px, hairline-closed, lowercase mono nav, current item underlined
 * in brand lime.
 */
export interface TopbarProps {
  nav?: TopbarNavItem[];
  current?: string;
  /** Provenance stamp, e.g. "v0.1.0 · 15 models · $6.37 spent". */
  stamp?: string;
}
export declare function Topbar(props: TopbarProps): React.JSX.Element;
