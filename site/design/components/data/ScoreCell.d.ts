import * as React from "react";

/**
 * Score plus uncertainty, mono and tabular. Pass `on` instead of `plusMinus`
 * for a sample so thin that the honest caveat is the count itself.
 */
export interface ScoreCellProps {
  value: number;
  /** Half-width of the interval, drawn as ±x.x in orange. */
  plusMinus?: number;
  /** Answer count, for unrankable rows: renders "on 3". */
  on?: number;
}
export declare function ScoreCell(props: ScoreCellProps): React.JSX.Element;
