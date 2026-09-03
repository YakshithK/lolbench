import * as React from "react";

export interface BarListRow { label: string; value: number }

/**
 * Progress against an assigned set, e.g. jokes written of 348. Neutral fill,
 * orange when a model has barely begun.
 */
export interface BarListProps {
  rows?: BarListRow[];
  /** Value that counts as a full set. */
  target?: number;
  /** At or below this percentage the bar turns orange. Default 10. */
  thinPct?: number;
}
export declare function BarList(props: BarListProps): React.JSX.Element;
