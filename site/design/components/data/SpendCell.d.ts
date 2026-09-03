import * as React from "react";

/**
 * The cost column: dollars, "free", or a state word. Never omitted beside a score.
 */
export interface SpendCellProps { usd?: number | null; state?: "queued" | "not started" }
export declare function SpendCell(props: SpendCellProps): React.JSX.Element;
