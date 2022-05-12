import HistoryItem = chrome.history.HistoryItem;

export interface IHistory extends HistoryItem{
    favicon: string;
}

// id: "44592"
// lastVisitTime: 1650999603108.692
// title: "Typescript: Type 'string | undefined' is not assignable to type 'string' - Stack Overflow"
// typedCount: 0
// url: "https://stackoverflow.com/questions/54496398/typescript-type-string-undefined-is-not-assignable-to-type-string"
// visitCount: 2