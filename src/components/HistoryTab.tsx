import React, { useState } from 'react'
import * as FaIcons from 'react-icons/ai'
import styled from 'styled-components'
import SearchBox from './SearchBox';
import {IHistory} from '../interfaces/IHistory';
import {getFavicon} from '../services/services';


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

const HistoryTab: React.FunctionComponent<{historyList:Array<IHistory>}> = ({historyList}) => {
    const [historyListDisplay, setHistoryListDisplay] = useState<Array<IHistory>>(historyList);

     const searchHistory = (value:string) => {
        chrome.history.search({text: value, maxResults: 20}, function (data) {
            const userHistoryItems: Array<IHistory> = [];
            data.forEach(function (page) {
                if (page.url) {
                    userHistoryItems.push({
                        ...page,
                        favicon: getFavicon(page.url),
                    })
                }
            });
            console.log("MAII in searchHistory", value, "-", userHistoryItems)
            setHistoryListDisplay(userHistoryItems);
        });
    };
    return (
        <>
            <div className="history_search">
                <SearchBox onSearchChange={searchHistory}/>
           </div>
           <table className="list_table">
                   {historyListDisplay.map(({
                           id,
                          favicon,
                          url,
                          title,
                          lastVisitTime,
                          typedCount,
                          visitCount,
                         }) => (
                       <tr className="list_row" key={id}>
                           <td className="list_name">
                               {favicon !== '' ? <img src={favicon} className="list_favicon"/> :
                                   <FaIcons.AiFillAlert size={30}/>}
                               <div className="list_name_title">
                                   <a href={url}>{title}</a>
                                   {lastVisitTime && <span>last visited at: {new Date(lastVisitTime).toDateString()}</span>}
                               </div>
                           </td>
                       </tr>
                   ))}
               </table>
        </>
    )
}

export default HistoryTab