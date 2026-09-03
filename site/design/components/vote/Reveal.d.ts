import * as React from "react";

/**
 * Who wrote which joke, revealed only after the ballot.
 */
export interface RevealProps { open?: boolean; children?: React.ReactNode }
export declare function Reveal(props: RevealProps): React.JSX.Element;
