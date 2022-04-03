import React, {useEffect, useState} from 'react';
import Sidebar from './components/Sidebar';
import {getFavicon} from './services/services';
import * as FaIcons from 'react-icons/ai'
import './App.css';

export interface Tag{
    id:string;
    name:string;
    description:string;
    caption:string;
    keywords:string;
    iconUrl:string;
}
export const App = () => {
    const [currentTab, setCurrentTab] = useState<string>('Tabs');
    const [urlValue, setUrl] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [keywords, setKeywords] = useState<string>('');
    const [caption, setCaption] = useState<string>('');
    const [tagList, setTagList] = useState<Array<Tag>>([]);
    const [editMode, setEditMode] = useState<boolean>(true);
    const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);

    const jsonRes = {
                'www.google.com': '{"name":"Google search","keywordsSplit":[""],"caption":"sas"}',
                'https://redis.io/docs/':'{"name":"Redis Lab","keywordsSplit":[""],"caption":"sas"}',
                'https://www.youtube.com/': '{"name":"youtube","keywordsSplit":[""],"caption":""}',
            };
           // setTagList(jsonRes);

    const db = process.env["DB"];

    /**
     * Get current URL
     */
    useEffect(() => {
        const queryInfo = {active: true, lastFocusedWindow: true};
        if (urlValue == '') {
            updateTagList(jsonRes);
            chrome.tabs && chrome.tabs.query(queryInfo, tabs => {
                const url = tabs[0].url || '';
                setUrl(url);
            });
        }

    }, []);


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
                        urlValue
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
        setCurrentTab('Copy');
    };

    /**
     * Remove link
     */
    const removeLink = () => {
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
                    }).then(() => {
                        console.log("MAII ::: ", response.json());
                    });

                };
                fetchData();
            })
        }
        setCurrentTab('List');
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

    /**
     * Display comment logic
     */
    const displayComment = (comment: string) => {
        if (comment?.length > 100) {
            return comment.substr(0, 100) + '...';
        }
        return comment || '';
    };

    //console.log("MAIII the list item is 1: ", tagList);
    const listItems = Object.keys(jsonRes);
    console.log("MAIII the list item is: ", currentTab);
    return (
        <div className="App">
            <Sidebar setCurrentTab={setCurrentTab}/>
            {currentTab === 'Tabs' && <div>
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
                        <input type="checkbox" id="private" name="scales"/>
                        <label htmlFor="private">Private</label>
                    </div>
                    <button className="tab_button" onClick={removeLink}>Remove</button>
                    <button className="tab_button" onClick={saveLink}>Save</button>
                </div>
            </div>}
            {currentTab === 'Copy' && <div id="user-links-page">
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
                             <td className="list_first_icon"><FaIcons.AiTwotoneDelete size={20} /></td>
                        </tr>
                       ))}
                </table>
            </div>
            }
        </div>
    );
};

export default App;
