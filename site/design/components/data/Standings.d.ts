import * as React from "react";

export interface StandingsRow {
  label: string;
  /** Rendered score cell, usually a <ScoreCell />. */
  score: React.ReactNode;
  /** Best in its price tier: lime rank. */
  leader?: boolean;
}

/**
 * The ranked list. Rows are ordered as passed; unranked rows sit below the
 * ranking with an orange dash, and the footer must account for every model.
 */
export interface StandingsProps {
  rows?: StandingsRow[];
  /** Scored but unrankable rows, e.g. a perfect score on three answers. */
  unranked?: StandingsRow[];
  /** Sentence reconciling ranked + unranked + pending against the total. */
  footer?: React.ReactNode;
  /** Header label for the value column. */
  meta?: string;
}
export declare function Standings(props: StandingsProps): React.JSX.Element;
