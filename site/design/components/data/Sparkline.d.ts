import * as React from "react";

export interface SparklineBar {
  label: string;
  value: number;
  /** Best in its price tier. */
  leader?: boolean;
  /** Sample too thin to trust: drawn orange whatever its height. */
  thin?: boolean;
}

/**
 * The small bar summary inside a track panel: one bar per model plus stubs for
 * models still being judged.
 */
export interface SparklineProps {
  bars?: SparklineBar[];
  /** How many not-yet-judged stubs to draw. */
  pending?: number;
  min?: number;
  max?: number;
  label?: string;
}
export declare function Sparkline(props: SparklineProps): React.JSX.Element;
