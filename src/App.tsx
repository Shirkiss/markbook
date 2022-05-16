import React, {useEffect, useState} from 'react';
import ReactTextareaAutocomplete , {ItemComponentProps} from '@webscopeio/react-textarea-autocomplete';
import Sidebar from './components/Sidebar';
import SearchBox from './components/SearchBox';
import HistoryTab from './components/HistoryTab';
import {getFaviconFromUrl, getWordsWithPrefixFromText} from './services/services';
import * as FaIcons from 'react-icons/ai'
import {IHistory} from './interfaces/IHistory';
import './App.css';
import {TAB_INFO, HISTORY, LIST, FRIENDS} from './consts/index'
import "@webscopeio/react-textarea-autocomplete/style.css";


export interface Link {
    id: string;
    urlValue: string;
    name: string;
    caption: string;
    keywords: Array<string>;
    favIconUrl: string;
    isPrivate: boolean;
}
export interface IElasticObject { _id: string; _source: any }
export interface ITag { name: string }
type Entity = { name: string , char: string}


export const App = () => {
    const [currentTab, setCurrentTab] = useState<string>(TAB_INFO);
    const [linkId, setLinkId] = useState<string>('');
    const [urlValue, setUrl] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [favIconUrl, setFavIconUrl] = useState<string>('');
    const [keywords, setKeywords] = useState<string>('');
    const [caption, setCaption] = useState<string>('');
    const [tagList, setTagList] = useState<Array<Link>>([]);
    const [userId, setUserId] = useState<string>('');
    const [isInEditMode, setIsInEditMode] = useState<boolean>(false);
    const [isPrivate, setIsPrivate] = useState<boolean>(false);
    const [historyList, setHistoryList] = useState<Array<IHistory>>([]);
    const [captionAutocompleteTags, setCaptionAutocompleteTags] = useState<Array<string>>([]);
    const [editUrlValue, setEditUrlValue] = useState<boolean>(false);

    /**
     * Get current URL
     */
    useEffect(() => {
        async function resetAppData() {
            const currUserId = await setCurrentUserId();
            await getAllKeywords(currUserId);
            await getAllLinks(currUserId);
            getHistory();


        }

        if (urlValue == '') {
            resetAppData();
            getTabData();
        }
    }, []);

    function setEditMode(itemId: string) {
        setIsInEditMode(true);
        setCurrentTab(TAB_INFO);
        setLinkId(itemId);
        const curr = tagList.find(item => item.id === itemId);
        setIsPrivate(curr?.isPrivate || false);
        setFavIconUrl(curr?.favIconUrl || '');
        setUrl(curr?.urlValue || '');
        setName(curr?.name || '')
        setCaption(curr?.caption || '');
    }

    function setHistoryEditMode(editItem: IHistory) {
        setIsInEditMode(true);
        setCurrentTab(TAB_INFO);
        setLinkId(editItem.id);
        setCaption('');
        setIsPrivate(false); // from options
        setFavIconUrl(editItem?.favicon || '');
        setUrl(editItem?.url || '');
        setName(editItem?.title || '')
    }

    function setCurrentUserId() {
        return new Promise<string>((resolve, reject) => {
            //here our function should be implemented
            chrome.storage.sync.get('userId', ({userId}) => {
                setUserId(userId);
                resolve(userId);
            });
        });

    }

    function updateLinkList(linkListObject: Array<IElasticObject>) {
        let arr: Link[] = [];
         linkListObject.map(item =>  {
            const obj: any = item._source;
            let currentLink: Link = {
                    urlValue: obj.urlValue,
                    name: obj.name,
                    id: item._id,
                    caption: obj.caption,
                    keywords: obj.keywordsSplit,
                    favIconUrl: obj.favIconUrl,
                    isPrivate: obj.isPrivate,
                };
            arr.push(currentLink);
         })

        setTagList(arr);
    }


    async function getAllLinks(userId: string) {
        const response = await fetch(`http://localhost:8000/links/getAllLinks/${userId}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        });
        const result = await response.json();

        updateLinkList(result);
    }

    async function filterSetCaption(value: string) {
        if (value[0] === '#') {
            await getFilterKeywords(value.substring(1));
        }
        setCaption(value)
    }

    async function getAllKeywords(userId: string) {
        const response = await fetch(`http://localhost:8000/keywords/initialKeywordsSuggestion/${userId}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        });
        const result = await response.json();
        setCaptionAutocompleteTags(result);
    }

    async function getFilterKeywords(prefix: string) {
        const response = await fetch(`http://localhost:8000/keywords/keywordsSuggestion/${userId}/${prefix}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        });
        let result = await response.json();
        result = result.filter((item: string, index: number) => result.indexOf(item) === index && item !== "");
        setCaptionAutocompleteTags(result);
    }


    /**
     * Save link
     */
    const saveLink = () => {
        chrome.storage.sync.get('userId', ({userId}) => {
            const fetchData = async () => {
                const keywordsSave = getWordsWithPrefixFromText(caption, '#').join();
                let data = new URLSearchParams({
                    name,
                    keywords: keywordsSave,
                    caption,
                    urlValue,
                    isPrivate: isPrivate.toString(),
                    favIconUrl,
                });

                let saveFunction = isInEditMode ? `editLink/${userId}` : `saveLink/${userId}`;
                await fetch(`http://localhost:8000/links/${saveFunction}`, {

                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: data,
                }).then((response) => {
                    response.json().then(data => {
                        updateLinkList(data);
                    });
                });
            };
            fetchData();
        })
        setCurrentTab(LIST);
    };

    /**
     * Remove link
     */
    const removeLink = (linkId: string) => {
        chrome.storage.sync.get('userId', ({userId}) => {
            const fetchData = async () => {
                await fetch(`http://localhost:8000/links/removeLink/${userId}`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams({
                        linkId
                    })
                }).then((response) => {
                    response.json().then(data => {
                        // do something with your data
                        updateLinkList(data);
                    });
                });

            };
            fetchData();
        })
        setCurrentTab(LIST);
    };


    const getHistory = () => {
        chrome.history.search({text: '', maxResults: 50}, function (data) {
            const userHistoryItems: Array<IHistory> = [];
            data.forEach(function (page) {
                if (page.url) {
                    userHistoryItems.push({
                        ...page,
                        favicon: getFaviconFromUrl(page.url),
                    })
                }
            });
            setHistoryList(userHistoryItems);
        });
    };

    function onChangeTab(tab: string) {
        setIsInEditMode(false);
        getTabData();
        setIsPrivate(false);
        setCurrentTab(tab);
    }

    function getTabData() {
        const queryInfo = {active: true, lastFocusedWindow: true};

        chrome.tabs && chrome.tabs.query(queryInfo, tabs => {
            const url = tabs[0].url || '';
            const name = tabs[0].title || '';
            const favIconUrl = tabs[0].favIconUrl || '';
            setUrl(url);
            setName(name);
            setFavIconUrl(favIconUrl);
        });
    }

    function setPrivateState() {
        if (typeof isPrivate == "string") {
            setIsPrivate(isPrivate !== "true");
        } else {
            setIsPrivate(!isPrivate);
        }
    }

    async function searchForPrefix(value: string) {
        if (value === "") {
            getAllLinks(userId);
        } else {
            let data = new URLSearchParams({prefix: value});
            const response = await fetch(`http://localhost:8000/links/searchAll/${userId}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: data,
            });
            const result = await response.json();

            updateLinkList(result);
        }
    }
    
    const Item = ( props: ItemComponentProps<any> ) => <div>{props.entity}</div>;

    return (
        <div className="App">
            <Sidebar setCurrentTab={onChangeTab} currentTab={currentTab}/>
            {currentTab === TAB_INFO && <div>
                 <div className="tab_data">
                    <img src={getFaviconFromUrl(urlValue)} className="list_favicon"/>
                    {!editUrlValue &&<div className='non_edit_mode'>{urlValue.replace(/(.{26})..+/, "$1…")}</div> }
                    {editUrlValue && <input type="text" className="edit_mode" id="urlBox" value={urlValue}
                           onChange={e => setUrl(e.target.value)}/>}
                    <FaIcons.AiTwotoneEdit size={30} onClick={() => setEditUrlValue(!editUrlValue)}/>
                </div>
                <div className="tab_data">
                    <label htmlFor="linkName" className="name_label">Name:</label>
                    <input type="text" className="tab_input_with_label" id="linkName" value={name}
                           onChange={e => setName(e.target.value)}/>
                </div>
                {captionAutocompleteTags}
                <div className="tab_data">
                    <ReactTextareaAutocomplete
                       className="tab_input"
                       loadingComponent={() => <span>Loading</span>}
                       onChange={e => filterSetCaption(e.target.value)}
                       minChar={0}
                       rows={4} 
                       cols={20}
                       listClassName="items_list"
                       onItemSelected={() => getAllKeywords(userId)}
                       trigger={{
                         "#": {
                           dataProvider: (token) => {
                               console.log("Dataprovider is being called", captionAutocompleteTags);
                               return captionAutocompleteTags;
                           },
                           component: Item,
                           output: (item: any, trigger) => `#${item}`
                         }
                       }} 
                     />
                </div>

                <div className="tab_footer">
                    <div className="tab_checkbox">
                        <input type="checkbox" id="private" name="scales" checked={isPrivate.toString() == 'true'}
                               onChange={setPrivateState}/>
                        <label htmlFor="private">Private</label>
                    </div>
                    <button className="tab_button" onClick={() => removeLink(linkId)}>Remove</button>
                    <button className="tab_button" onClick={saveLink}>Save</button>
                </div>
            </div>}
            {currentTab === HISTORY && <HistoryTab historyList={historyList} onEditHistory={setHistoryEditMode}/>}
            {currentTab === LIST && <div id="user-links-page">
                <SearchBox onSearchChange={searchForPrefix}/>
                <table className="list_table">
                    {tagList.map(({
                                    urlValue,
                                      id,
                                      name,
                                      caption,
                                      keywords,
                                      favIconUrl
                                  }) => (
                        <tr className="list_row" key={id}>
                            <td className="list_name">
                                {favIconUrl !== '' ? <img src={favIconUrl} className="list_favicon"/> :
                                    <FaIcons.AiFillAlert size={30}/>}
                                <div className="list_name_title">
                                    <a href={urlValue}>{name}</a>
                                    <span>{caption}</span>
                                </div>
                            </td>
                            <td className="list_second_icon"><FaIcons.AiTwotoneEdit size={20}
                                                                                    onClick={() => setEditMode(id)}/>
                            </td>
                            <td className="list_first_icon"><FaIcons.AiTwotoneDelete size={20}
                                                                                     onClick={() => removeLink(id)}/>
                            </td>
                        </tr>
                    ))}
                </table>
            </div>
            }
        </div>
    );
};

export default App;
