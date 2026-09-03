import * as React from "react";

export interface HeatmapRow {
  label: string;
  /** Column key to score, 0-100. Omit a key entirely for "no data yet". */
  values: Record<string, number | null | undefined>;
}

/**
 * Where each model wins and where it collapses, one cell per joke mechanism.
 * The chart that shows F6 breaking every model at once.
 */
export interface HeatmapProps {
  /** Column keys in order, e.g. ["F1","F2","F3","F4","F5","F6"]. */
  columns?: string[];
  rows?: HeatmapRow[];
  /** Column whose header should read as a warning, e.g. "F6". */
  warnColumn?: string;
}
export declare function Heatmap(props: HeatmapProps): React.JSX.Element;
