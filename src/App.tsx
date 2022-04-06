import React, {useEffect, useState} from 'react';
import Sidebar from './components/Sidebar';
import {getFavicon} from './services/services';
import * as FaIcons from 'react-icons/ai'
import './App.css';
import {TAB_INFO, HISTORY, LIST, FRIENDS} from './consts/index'

export interface Tag{
    id:string;
    name:string;
    description:string;
    caption:string;
    keywords:string;
    iconUrl:string;
}
export const App = () => {
    const [currentTab, setCurrentTab] = useState<string>(TAB_INFO);
    const [urlValue, setUrl] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [keywords, setKeywords] = useState<string>('');
    const [caption, setCaption] = useState<string>('');
    const [tagList, setTagList] = useState<Array<Tag>>([]);
    const [userId, setUserId] = useState<string>('');
    const [editMode, setEditMode] = useState<boolean>(true);
    const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);
    const [isPrivate, setIsPrivate] = useState<boolean>(false);


    const db = process.env["DB"];

    /**
     * Get current URL
     */
    useEffect(() => {
        const queryInfo = {active: true, lastFocusedWindow: true};

        async function resetAppData() {
            const currId = await setCurrentUserId();
            console.log(userId);
            await getAllLinks(currId);
        }
        if (urlValue == '') {
            resetAppData();
            chrome.tabs && chrome.tabs.query(queryInfo, tabs => {
                const url = tabs[0].url || '';
                setUrl(url);
            });
        }
    }, []);


    function setCurrentUserId() {
        return new Promise<string>((resolve,reject)=>{
            //here our function should be implemented
             chrome.storage.sync.get('userId', ({userId}) => {
                setUserId(userId);
                resolve(userId);
            });
        });

    }

    function updateTagList(tagListObject: any) {
       let arr: Tag[] = [];

       Object.keys(tagListObject).map(function(key){
            const obj: any = JSON.parse(tagListObject[key]);
            let currentTag: Tag = {
                                    name: obj.name,
                                    caption: obj.caption,
                                    id:key,
                                    description: "My description",
                                    keywords:obj.keywordsSplit,
                                    iconUrl:getFavicon(key),
                                }
           arr.push(currentTag)
           return arr;
       });
       setTagList(arr);
    }

    async function getAllLinks(userId:string) {
       const response = await fetch(`http://localhost:8000/getAllLinks/${userId}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        });
        const result = await response.json();
        updateTagList(result);
    }

    /**
     * Save link
     */
    const saveLink = () => {
        if (db === 'local-storage') {
            // local storage
            chrome.storage.sync.get('links', ({links}) => {
                links[urlValue] = {name, 'keywords': keywords.split(','), caption};
                chrome.storage.sync.set({links});
                console.log(JSON.stringify(links));
            });
        } else {
            // redis
            chrome.storage.sync.get('userId', ({userId}) => {
                const fetchData = async () => {
                    let data = new URLSearchParams({
                        name,
                        keywords,
                        caption,
                        urlValue,
                        isPrivate: isPrivate.toString()
                    });
                     await fetch(`http://localhost:8000/saveLink/${userId}`, {

                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: data,
                    }).then((response) => {
                        response.json().then(data => {
                          // do something with your data
                          updateTagList(data);
                        });
                    });
                };
                fetchData();
            })
        }
        setCurrentTab(LIST);
    };

    /**
     * Remove link
     */
    const removeLink = (urlValue:string) => {
        if (db === 'local-storage') {
            // local storage
            chrome.storage.sync.get('links', ({links}) => {
                delete links[urlValue];
                chrome.storage.sync.set({links});
                console.log(JSON.stringify(links));
            });
        } else {
            // redis
            chrome.storage.sync.get('userId', ({userId}) => {
                const fetchData = async () => {
                    let data = new URLSearchParams({urlValue});
                    const response: any = await fetch(`http://localhost:8000/removeLink/${userId}`, {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: data,
                   }).then((response) => {
                      response.json().then(data => {
                        // do something with your data
                        updateTagList(data);
                      });
                  });

                };
                fetchData();
            })
        }
        setCurrentTab(LIST);
    };


    const getHistory = () => {
        chrome.history.search({text: '', maxResults: 20}, function (data) {
            const userHistoryItems: { favicon: string; typedCount?: number | undefined; title?: string | undefined; url?: string | undefined; lastVisitTime?: number | undefined; visitCount?: number | undefined; id: string; }[] = [];
            data.forEach(function (page) {
                if (page.url) {
                    const favicon = getFavicon(page.url);
                    userHistoryItems.push({
                        ...page,
                        favicon: favicon
                    })
                }
            });
            return userHistoryItems;
        });
    };


    return (
        <div className="App">
            <Sidebar setCurrentTab={setCurrentTab} currentTab={currentTab}/>
            {currentTab === TAB_INFO && <div>
                <div className="tab_data">
                    <input type="text" className="tab_input" id="urlBox" value={urlValue}
                           onChange={e => setUrl(e.target.value)}/>
                </div>
                <div className="tab_data">
                    <label htmlFor="linkName" className="name_label">Name:</label>
                    <input type="text" className="tab_input_with_label" id="linkName" value={name}
                           onChange={e => setName(e.target.value)}/>
                </div>
                <div className="tab_data">
                    <textarea id="caption" className="tab_area" placeholder="Caption" name="caption" rows={4} cols={50}
                              onChange={e => setCaption(e.target.value)}/>
                </div>

                <div className="tab_footer">
                    <div className="tab_checkbox">
                        <input type="checkbox" id="private" name="scales" onChange={() => setIsPrivate(!isPrivate)}/>
                        <label htmlFor="private">Private</label>
                    </div>
                    <button className="tab_button" onClick={() => removeLink(urlValue)}>Remove</button>
                    <button className="tab_button" onClick={saveLink}>Save</button>
                </div>
            </div>}
            {currentTab === LIST && <div id="user-links-page">
                 <table className="list_table">
                  {tagList.map(({ id,
                                     name,
                                     description,
                                     caption,
                                     keywords,
                                     iconUrl}) => (
                         <tr className="list_row" key={id}>
                             <td className="list_name">
                                 {iconUrl !== '' ? <img src={iconUrl} /> : <FaIcons.AiFillAlert size={30} />}
                                 <div className="list_name_title">
                                     <span>{name}</span>
                                     <span>{description}</span>
                                 </div>
                             </td>
                             <td className="list_second_icon"><FaIcons.AiTwotoneEdit size={20} /></td>
                             <td className="list_first_icon"><FaIcons.AiTwotoneDelete size={20} onClick={() => removeLink(id)} /></td>
                        </tr>
                       ))}
                </table>
            </div>
            }
        </div>
    );
};

export default App;
