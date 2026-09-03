import * as React from "react";

/**
 * The brand glyph: a confidence interval whose ends turn up into a smile. Use it
 * in the topbar lockup, as an avatar on the accent, and as the favicon.
 */
export interface MarkProps {
  /** Rendered width in px. Height follows the 26:17 ratio. Minimum 20. */
  width?: number;
  /** Stroke colour. Lime on the canvas, canvas on lime, ink when one-colour. */
  color?: string;
  title?: string;
}
export declare function Mark(props: MarkProps): React.JSX.Element;
