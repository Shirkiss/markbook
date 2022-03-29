import React, {useEffect, useState} from 'react';
import Sidebar from './components/Sidebar'
import './App.css';

export const App = () => {
    const [currentTab, setCurrentTab] = useState<string>('Tabs');
        const [urlValue, setUrl] = useState<string>('');
       const [name, setName] = useState<string>('');
         const [keywords, setKeywords] = useState<string>('');
         const [caption, setCaption] = useState<string>('');
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
                links[urlValue] = {"name": name, "keywords": keywords.split(","), "comment": caption};
                chrome.storage.sync.set({links});
                console.log(JSON.stringify(links));
            });
        } else {
            // redis
            const fetchData = async () => {
                let data = new URLSearchParams({"name": name, "keywords": keywords, "comment": caption, "link": urlValue});
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
                   <Sidebar setCurrentTab={setCurrentTab}/>
                   {currentTab === 'Tabs' && <div>
                   <div className="tab_data">
                        <input type="text" className="tab_input" id="urlBox" value={urlValue} onChange={e => setUrl(e.target.value)}/>
                    </div>
                    <div className="tab_data">
                        <label htmlFor="linkName" className="name_label">Name:</label>
                        <input type="text" className="tab_input_with_label" id="linkName" value={name} onChange={e => setName(e.target.value)}/>
                    </div>
                    <div className="tab_data">
                        <textarea id="caption" className="tab_area" placeholder="Caption" name="caption" rows={4} cols={50} onChange={e => setCaption(e.target.value)} />
                    </div>

                    <div className="tab_footer">
                        <div className="tab_checkbox">
                          <input type="checkbox" id="private" name="scales" />
                          <label htmlFor="private">Private</label>
                        </div>
                        <button className="tab_button" onClick={removeLink}>Remove</button>
                        <button className="tab_button" onClick={saveLink}>Save</button>
                    </div>
                </div> }
                {currentTab === 'History ' && <div id="user-links-page" style={{"display": "none"}}>
                        <ul id="listContainer">
                        </ul>
                        <button onClick={() => setCurrentTab('Tab')}>Back</button>
                    </div>
                }
        </div>
    );
};

export default App;
