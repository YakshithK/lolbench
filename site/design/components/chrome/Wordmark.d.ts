import * as React from "react";

/**
 * The horizontal lockup: mark plus wordmark, the default everywhere.
 */
export interface WordmarkProps {
  href?: string;
  /** Wordmark font size in px; the mark scales with it. Default 14. */
  size?: number;
  /** Drop the glyph below ~12px, where it stops reading as a mouth. */
  showMark?: boolean;
}
export declare function Wordmark(props: WordmarkProps): React.JSX.Element;
