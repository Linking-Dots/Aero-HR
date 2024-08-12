/// <reference types="react" />
import { TableColumnBase } from './types';
export declare const CellBase: import("styled-components").IStyledComponent<"web", import("styled-components/dist/types").Substitute<import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLDivElement>, HTMLDivElement>, {
    $headCell?: boolean | undefined;
    $noPadding?: boolean | undefined;
}>>;
export type CellProps = Pick<TableColumnBase, 'button' | 'grow' | 'maxWidth' | 'minWidth' | 'width' | 'right' | 'center' | 'compact' | 'hide' | 'allowOverflow'>;
export declare const CellExtended: import("styled-components").IStyledComponent<"web", import("styled-components/dist/types").Substitute<Omit<import("styled-components/dist/types").FastOmit<import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "$headCell" | "$noPadding"> & {
    $headCell?: boolean | undefined;
    $noPadding?: boolean | undefined;
}, "ref"> & {
    ref?: ((instance: HTMLDivElement | null) => void) | import("react").RefObject<HTMLDivElement> | null | undefined;
}, CellProps>> & Omit<import("styled-components").IStyledComponent<"web", import("styled-components/dist/types").Substitute<import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLDivElement>, HTMLDivElement>, {
    $headCell?: boolean | undefined;
    $noPadding?: boolean | undefined;
}>>, keyof import("react").Component<any, {}, any>>;
