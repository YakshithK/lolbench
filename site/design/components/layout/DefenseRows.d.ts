import * as React from "react";

export interface DefenseRow { risk: React.ReactNode; defense: React.ReactNode }

/**
 * Two-column protocol list: what could go wrong, and what stops it.
 */
export interface DefenseRowsProps { rows?: DefenseRow[] }
export declare function DefenseRows(props: DefenseRowsProps): React.JSX.Element;
