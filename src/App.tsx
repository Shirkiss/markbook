import React, {useEffect, useState} from 'react';
import { ProSidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import 'react-pro-sidebar/dist/css/styles.css';
import './App.css';

export const App = () => {
    const [currentTab, setCurrentTab] = useState<string>('Tab');
        const [urlValue, setUrl] = useState<string>('');
       const [name, setName] = useState<string>('');
         const [keywords, setKeywords] = useState<string>('');
         const [comment, setComment] = useState<string>('');
         const [tagList, setTagList] = useState<object>({});
         const [editMode, setEditMode] = useState<boolean>(true);
         const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);


    const userId = 1;
    const db = process.env["DB"];

    /**
     * Get current URL
     */
    useEffect(() => {
        const queryInfo = {active: true, lastFocusedWindow: true};
        if (urlValue == ''){
            chrome.tabs && chrome.tabs.query(queryInfo, tabs => {
                  const url = tabs[0].url || '';
                  setUrl(url);
            });
        }

    }, []);


    /**
     * Save link
     */
    const saveLink = () => {

        if (db === 'local-storage') {
            // local storage
            chrome.storage.sync.get("links", ({links}) => {
                links[urlValue] = {"name": name, "keywords": keywords.split(","), "comment": comment};
                chrome.storage.sync.set({links});
                console.log(JSON.stringify(links));
            });
        } else {
            // redis
            const fetchData = async () => {
                let data = new URLSearchParams({"name": name, "keywords": keywords, "comment": comment, "link": urlValue});
                await fetch(`http://localhost:8000/saveLink/${userId}`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: data,
                });
            };
            fetchData();
        }
        setCurrentTab('List');
    };

    /**
     * Remove link
     */
    const removeLink = () => {
        if (db === 'local-storage') {
            // local storage
            chrome.storage.sync.get("links", ({links}) => {
                delete links[urlValue];
                chrome.storage.sync.set({links});
                console.log(JSON.stringify(links));
            });
        } else {
            // redis
            const fetchData = async () => {
            let data = new URLSearchParams({"url": urlValue});
                await fetch(`http://localhost:8000/removeLink/${userId}`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
            body: data,
                });
            };
            fetchData();
        }
        setCurrentTab('List');
    };



//     const updateListContainer = () => {
//         if (db === 'local-storage') {
//             // local storage
//             listContainer.innerHTML = '';
//             chrome.storage.sync.get("links", ({links}) => {
//                 let linksNames = Object.keys(links);
//                 for (let i = 0; i < linksNames.length; i++) {
//                     addLinkToList(listContainer, linksNames[i], links[linksNames[i]].name, links[linksNames[i]].comment)
//                 }
//             });
//         } else {
//             // redis
//             const fetchData = async () => {
//                 const result = await fetch(`http://localhost:8000/getAllLinks/${userId}`, {
//                     method: 'GET',
//                     headers: {
//                         Accept: 'application/json',
//                     },
//                 });
//                 const body = await result.json();
//                 const links = body.links;
//                 let linksNames = Object.keys(links);
//                 for (let i = 0; i < linksNames.length; i++) {
//                     let linkContent = JSON.parse(links[linksNames[i]]);
//                     addLinkToList(listContainer, linksNames[i], linkContent.name, linkContent.comment)
//                 }
//             };
//             fetchData();
//         }
//     };


    /**
     * Display comment logic
     */
    const displayComment = (comment: string) => {
        if (comment?.length > 100) {
            return comment.substr(0, 100) + '...';
        }
        return comment || '';
    };

    return (
        <div className="App">
            <ProSidebar>
              <Menu iconShape="square">
                <MenuItem active = {currentTab === 'Tab'} ><button onClick={()=>setCurrentTab('Tab')}>Tab</button></MenuItem>
                <MenuItem active = {currentTab === 'History'} ><button onClick={()=>setCurrentTab('History')}>History</button></MenuItem>
                <MenuItem active = {currentTab === 'List'} ><button onClick={()=>setCurrentTab('List')}>List</button></MenuItem>
                </Menu>
              </ProSidebar>
                   {currentTab === 'Tab' && <div>
                   <div>
                        <label htmlFor="linkName">Link:</label>
                        <input type="text" id="urlBox" value={urlValue} onChange={e => setUrl(e.target.value)}/>
                    </div>
                    <div>
                        <label htmlFor="linkName">Name:</label>
                        <input type="text" id="linkName" value={name} onChange={e => setName(e.target.value)}/>
                    </div>
                    <div>
                        <label htmlFor="keywords">Keywords:</label>
                        <input type="text" id="keywords" value={keywords} onChange={e => setKeywords(e.target.value)}/>
                    </div>
                    <div>
                        <label htmlFor="comment">Comment:</label>
                        <input type="text" id="comment" value={comment} onChange={e => setComment(e.target.value)}/>
                    </div>
                    <button onClick={saveLink}>Save</button>
                    <button onClick={removeLink}>Remove</button>
                    <button onClick={() => setCurrentTab('List')}>Your links</button>
                </div> }
                {currentTab === 'List ' && <div id="user-links-page" style={{"display": "none"}}>
                        <ul id="listContainer">
                        </ul>
                        <button onClick={() => setCurrentTab('Tab')}>Back</button>
                    </div>
                }
        </div>
    );
};

export default App;
