import * as React from "react";

export interface BallotOption { id: string; label: string }

/**
 * The ballot: two jokes and an honest third option. Wire keyboard A / B / T at
 * the document level and ignore keys while focus is in a button or input.
 */
export interface BallotControlsProps { onVote?: (id: string) => void; options?: BallotOption[] }
export declare function BallotControls(props: BallotControlsProps): React.JSX.Element;
