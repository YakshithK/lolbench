import * as React from "react";

export interface StatBandItem { label: string; value: React.ReactNode; note?: string }

/**
 * The four-up method band: jokes in the set, who grades, who decides funny, total
 * cost. Use it to close a page and to balance a short column.
 */
export interface StatBandProps { stats?: StatBandItem[] }
export declare function StatBand(props: StatBandProps): React.JSX.Element;
