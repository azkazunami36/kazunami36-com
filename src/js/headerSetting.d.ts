export type ToolsType = {
    name?: string;
    url?: string;
    imageUrl?: string;
    script?: (elements: {
        tr: HTMLTableRowElement;
        td: HTMLTableCellElement;
        a: HTMLAnchorElement;
    }) => void;
}[];
export declare function headerSetting(): void;
