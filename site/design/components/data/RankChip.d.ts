import * as React from "react";

/**
 * Zero-padded rank. Lime marks a price-tier leader; null renders the orange dash
 * used for rows that cannot honestly be ranked.
 */
export interface RankChipProps { rank?: number | null; leader?: boolean }
export declare function RankChip(props: RankChipProps): React.JSX.Element;
