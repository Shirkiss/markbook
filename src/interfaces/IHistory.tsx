export interface IHistory {
    id: string;
    favicon: string;
    url?: string | undefined;
    title?: string | undefined;
    lastVisitTime?: number | undefined;
    typedCount?: number | undefined;
    visitCount?: number | undefined;
}

// id: "44592"
// lastVisitTime: 1650999603108.692
// title: "Typescript: Type 'string | undefined' is not assignable to type 'string' - Stack Overflow"
// typedCount: 0
// url: "https://stackoverflow.com/questions/54496398/typescript-type-string-undefined-is-not-assignable-to-type-string"
// visitCount: 2