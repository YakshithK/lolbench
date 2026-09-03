import * as React from "react";

export interface ScatterPoint {
  label: string;
  /** Cost in dollars. 0 sits on the free axis. */
  x: number;
  /** Score. */
  y: number;
  /** Range bounds, drawn as the vertical distrust bar. */
  lo: number;
  hi: number;
  /** Best in its price tier: draws lime. */
  leader?: boolean;
  /** Sample too small to trust: fades the range bar. */
  thin?: boolean;
}

/**
 * The page's hero chart: score against what the model cost to run, with every
 * point carrying its uncertainty. Model names sit in a legend gutter under the
 * plot, in score order, never inside it.
 */
export interface ScatterProps {
  points?: ScatterPoint[];
  xMax?: number;
  /** Axis floor. Omit and it is derived from the lowest range bound, so no
   *  interval is ever silently truncated at the axis. */
  yMin?: number;
  yMax?: number;
  /** Fraction of xMax where the free/paid divider sits. */
  freeCut?: number;
  /** Optional horizontal annotation, e.g. the best score so far. */
  rule?: { at: number; label: string };
  label?: string;
  /** Render the legend gutter. Leave on: the plot has no in-chart labels. */
  legend?: boolean;
}
export declare function Scatter(props: ScatterProps): React.JSX.Element;
