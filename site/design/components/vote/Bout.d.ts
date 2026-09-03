import * as React from "react";

/**
 * The head-to-head pair a human votes on, stacked so both jokes read at full
 * width. Pair it with BallotControls and a Reveal in the same Panel.
 */
export interface BoutProps { a: React.ReactNode; b: React.ReactNode; labelA?: string; labelB?: string }
export declare function Bout(props: BoutProps): React.JSX.Element;
