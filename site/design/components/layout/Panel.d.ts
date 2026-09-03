import * as React from "react";

/**
 * Hairline-outlined panel: display-face title, mono meta, body, caption strip.
 * Panels never nest and never carry shadows or radii.
 */
export interface PanelProps {
  title?: React.ReactNode;
  /** Right-aligned mono meta: the unit, the rule, the legend. */
  meta?: React.ReactNode;
  children?: React.ReactNode;
  /** Mono strip under the body explaining how to read the chart. */
  caption?: React.ReactNode;
  /** Set false for edge-to-edge charts. */
  pad?: boolean;
  /** lg for a page's primary panel, md elsewhere. */
  size?: "md" | "lg";
}
export declare function Panel(props: PanelProps): React.JSX.Element;
