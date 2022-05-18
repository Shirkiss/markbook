import {IHistory, HistoryItem} from '../interfaces/IHistory';
import {getFaviconFromUrl} from '../services/services';



function sortByVisitCount(userHistoryItems: (IHistory | HistoryItem)[]) {
    // @ts-ignore
    return userHistoryItems.sort(({visitCount: a}, {visitCount: b}) => (a === undefined) > (b === undefined) || a < b ? 1 : -1)
}

export function getHistoryByDate(numberOfSuggestions: number , callbackFunction: Function){
    const userHistoryItems: Array<IHistory> = [];
    chrome.history.search({text: '', maxResults: numberOfSuggestions}, function (data) {
        data.forEach(function (page) {
            if (page.url) {
                userHistoryItems.push({
                    ...page,
                    favicon: getFaviconFromUrl(page.url),
                })
            }
        });
        callbackFunction(userHistoryItems);
    });
};

export function getMarkbooksSuggestions(numberOfSuggestions: number, callbackFunction: Function) {
    chrome.history.search({text: '', maxResults: 1000}, function (data) {
        data = sortByVisitCount(data);
        const userHistoryItems: Array<IHistory> = [];
        const loopLength = Math.min(numberOfSuggestions, data.length);

        for (let i = 0; i < loopLength; i++) {
            if (data[i].url) {
                userHistoryItems.push({
                    ...data[i],
                    favicon: getFaviconFromUrl(data[i].url),
                })
            }
        }
        callbackFunction(userHistoryItems);
    });
}

// const deleteHistoryItem = (value: string, url: string) => {
//     chrome.history.deleteUrl({url}, () => searchHistory(value));
// }

// const deleteAllHistoryItems = (value: string) => {
//     chrome.history.deleteAll(() => searchHistory(value));
// }