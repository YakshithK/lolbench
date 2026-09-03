import * as React from "react";

/**
 * The page headline in the display face. Set up the joke here; land it in Lede.
 */
export interface HeadlineProps {
  children: React.ReactNode;
  /** Override the fluid size. */
  size?: string;
}
export declare function Headline(props: HeadlineProps): React.JSX.Element;
