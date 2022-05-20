import React, {Props, useState} from 'react'
import Select, {SingleValue, ActionMeta} from 'react-select'
import * as FaIcons from 'react-icons/ai'
import styled , { ThemedStyledFunction} from 'styled-components'
import SearchBox from './SearchBox';
import {IHistory} from '../interfaces/IHistory';
import {getFaviconFromUrl} from '../services/services';
import {getHistoryByDate, getMarkbooksSuggestions} from '../services/historyService';

interface ISelectedValue {
    value?: string|number;
    label: string;
}
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
`;

const SortIconUp = styled.div`
  border: solid black;
  border-width: 0 3px 3px 0;
  display: inline-block;
  padding: 3px;
  transform: rotate(-135deg);
  -webkit-transform: rotate(-135deg);
`;

const SortIconDown = styled.div`
  border: solid black;
  border-width: 0 3px 3px 0;
  display: inline-block;
  padding: 3px;
  transform: rotate(45deg);
  -webkit-transform: rotate(45deg);
`;



const HistoryTab: React.FunctionComponent<{ historyList: Array<IHistory>, onEditHistory: Function }> = ({
                                                                                                            historyList,
                                                                                                            onEditHistory
                                                                                                        }) => {
    const [historyListDisplay, setHistoryListDisplay] = useState<Array<IHistory>>(historyList);
    const [sortOpen, setSortOpen] = useState<Boolean>(false);
    const countOptions = [
        { value: 20, label: '20' },
        { value: 50, label: '50' },
        { value: 100, label: '100' },
        { value: 200, label: '200' },
    ]
    
    const timeOptions = [
        { value: 'Time', label: 'Time' },
        { value: 'Most visited', label: 'Most visited' },
        ]
    const [sortOrder, setSortOrder] = useState<ISelectedValue>(timeOptions[0]);
    const [sortAmount, setSortAmount] = useState<ISelectedValue>(countOptions[0]);


    const handleSortChanged = (newValue: SingleValue<ISelectedValue>, actionMeta: ActionMeta<ISelectedValue>) => {
        let countOfResults:number = sortAmount.value ? parseInt(sortAmount?.value.toString()) : 50;
        // Sort order was changed
        if (typeof newValue?.value === "string") {
            const selected:ISelectedValue = timeOptions.find(x => x.value == newValue?.value) ?? timeOptions[0];
            setSortOrder(selected);
            if (newValue?.value === 'Time') {
                getHistoryByDate(countOfResults, setHistoryListDisplay);
           } else {
                getMarkbooksSuggestions(countOfResults, setHistoryListDisplay);
           }
        } else {// Sort amount was changed
            countOfResults = newValue?.value ? parseInt(newValue?.value .toString()) : 50;
            const selected:ISelectedValue = countOptions.find(x => x.value == countOfResults) ?? countOptions[0];
            setSortAmount(selected);

            if (sortOrder.value === 'Time') {
                getHistoryByDate(countOfResults, setHistoryListDisplay);
           } else {
                getMarkbooksSuggestions(countOfResults, setHistoryListDisplay);
           } 
        }
  
    }

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
            setHistoryListDisplay(userHistoryItems);
        });
    };

    const style = {
        control: (base:any) => ({
          ...base,
          border: 0,
          maxWidth: "150px",
          // This line disable the blue border
          boxShadow: "none"
        }),
        indicatorSeparator: (base:any) => ({
           width:"0px"
        }),
      };
    
    return (
        <>
            <div className="history_search">
                <SearchBox onSearchChange={searchHistory}/>
                {sortOpen && <SortIconDown onClick={() => setSortOpen(!sortOpen)}/>}
                {!sortOpen && <SortIconUp onClick={() => setSortOpen(!sortOpen)}/>}
            </div>
            {sortOpen && <div className='sort_component'>
                <Select value={sortOrder} options={timeOptions} styles={style} onChange={handleSortChanged}/>
                <Select value={sortAmount} options={countOptions} styles={style} onChange={handleSortChanged}/>
            </div> }
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

export default HistoryTab;