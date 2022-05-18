export interface HistoryItem {
    /** Optional. The number of times the user has navigated to this page by typing in the address. */
    typedCount?: number | undefined;
    /** Optional. The title of the page when it was last loaded. */
    title?: string | undefined;
    /** Optional. The URL navigated to by a user. */
    url?: string | undefined;
    /** Optional. When this page was last loaded, represented in milliseconds since the epoch. */
    lastVisitTime?: number | undefined;
    /** Optional. The number of times the user has navigated to this page. */
    visitCount?: number | undefined;
    /** The unique identifier for the item. */
    id: string;
}
export interface IHistory extends HistoryItem{
    favicon: string;
}

// id: "44592"
// lastVisitTime: 1650999603108.692
// title: "Typescript: Type 'string | undefined' is not assignable to type 'string' - Stack Overflow"
// typedCount: 0
// url: "https://stackoverflow.com/questions/54496398/typescript-type-string-undefined-is-not-assignable-to-type-string"
// visitCount: 2