import React, {useState} from 'react'
import * as FaIcons from 'react-icons/ai'
import styled from 'styled-components'
import SearchBox from './SearchBox';
import {IHistory} from '../interfaces/IHistory';
import HistoryItem = chrome.history.HistoryItem; // eslint-disable-line no-restricted-globals
import {getFaviconFromUrl} from '../services/services';

const History = styled.div`
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  width: 55%;
  height: 27px;
  border-radius: 16px;
  background: rgb(255, 255, 255);
  margin: 10px 0px 0px 10px;
  box-shadow: none;
  border: 1px solid rgb(81 84 89);
  padding-left: 10px;
`

function sortByVisitCount(userHistoryItems: (IHistory | HistoryItem)[]) {
    // @ts-ignore
    return userHistoryItems.sort(({visitCount: a}, {visitCount: b}) => (a === undefined) > (b === undefined) || a < b ? 1 : -1)
}

function getMarkbooksSuggestions(userHistoryItems: Array<IHistory>, numberOfSuggestions: number) {
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
        return userHistoryItems;
    });
}

const HistoryTab: React.FunctionComponent<{ historyList: Array<IHistory>, onEditHistory: Function }> = ({
                                                                                                            historyList,
                                                                                                            onEditHistory
                                                                                                        }) => {
    const [historyListDisplay, setHistoryListDisplay] = useState<Array<IHistory>>(historyList);

    const searchHistory = (value: string) => {
        chrome.history.search({text: value, maxResults: 50}, function (data) {
            const userHistoryItems: Array<IHistory> = [];
            data.forEach(function (page) {
                if (page.url) {
                    userHistoryItems.push({
                        ...page,
                        favicon: getFaviconFromUrl(page.url),
                    })
                }
            });
            // TODO: add here sort if needed
            setHistoryListDisplay(userHistoryItems);
        });
    };
    const deleteHistoryItem = (value: string, url: string) => {
        chrome.history.deleteUrl({url}, () => searchHistory(value));
    }

    const deleteAllHistoryItems = (value: string) => {
        chrome.history.deleteAll(() => searchHistory(value));
    }

    return (
        <>
            <div className="history_search">
                <SearchBox onSearchChange={searchHistory}/>
            </div>
            <table className="list_table">
                {historyListDisplay.map(item => (
                    <tr className="list_row" key={item.id}>
                        <td className="list_name">
                            {item.favicon !== '' ? <img src={item.favicon} className="list_favicon"/> :
                                <FaIcons.AiFillAlert size={30}/>}
                            <div className="list_name_title">
                                <a href={item.url}>{item.title}</a>
                                {item.lastVisitTime &&
                                <span>last visited at: {new Date(item.lastVisitTime).toDateString()}</span>}
                            </div>
                        </td>
                        <td className="list_second_icon"><FaIcons.AiTwotonePushpin size={20}
                                                                                   onClick={() => onEditHistory(item)}/>
                        </td>
                    </tr>
                ))}
            </table>
        </>
    )
}

export default HistoryTab