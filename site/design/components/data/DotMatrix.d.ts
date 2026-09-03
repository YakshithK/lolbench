import * as React from "react";

export interface DotMatrixRow { label: string; n: number }

/**
 * Sample-size chart: squares for graded answers, so a perfect score on three
 * answers looks as thin as it is. Purely about volume, never about rank, so it
 * carries no leader colour.
 */
export interface DotMatrixProps {
  rows?: DotMatrixRow[];
  /** Answers per full square. Default 10. */
  per?: number;
  /** Below this n the row turns distrust orange. Default 10. */
  thinBelow?: number;
}
export declare function DotMatrix(props: DotMatrixProps): React.JSX.Element;
