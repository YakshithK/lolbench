import * as React from "react";

export interface TabItem { id: string; label: string }

/**
 * Compact view switcher, sized for a header row rather than a full-width bar.
 */
export interface TabsProps { tabs?: TabItem[]; value?: string; onChange?: (id: string) => void; label?: string }
export declare function Tabs(props: TabsProps): React.JSX.Element;
