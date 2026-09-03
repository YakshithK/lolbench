import * as React from "react";

/**
 * The small mono state label in a panel header: "10 of 15 scored", "you are the
 * judge", "next data drop", "authors hidden".
 */
export interface StatusChipProps {
  children: React.ReactNode;
  /** brand = live, ink = a human is involved, quiet = nothing yet, warn = distrust. */
  tone?: "brand" | "ink" | "quiet" | "warn";
}
export declare function StatusChip(props: StatusChipProps): React.JSX.Element;
