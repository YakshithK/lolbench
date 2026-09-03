import * as React from "react";

/**
 * The three-up skill strip: each panel states what is being measured as a
 * question a reader can answer without looking anything up.
 */
export interface TrackPanelProps {
  /** "01", "02", "03". */
  index: string;
  /** Short state: "10 of 15 scored", "you are the judge", "next data drop". */
  status: string;
  statusTone?: "brand" | "ink" | "quiet";
  /** The question in plain words, in the display face. */
  question: React.ReactNode;
  /** One sentence of method, no jargon. */
  method: React.ReactNode;
  /** A Sparkline or equivalent. */
  chart?: React.ReactNode;
  /** Mono line naming what the colours mean. */
  caption?: React.ReactNode;
}
export declare function TrackPanel(props: TrackPanelProps): React.JSX.Element;
