let mySet = new Set();
chrome.tabs.onUpdated.addListener((tabId,change,tab) =>{
    if(change.url){
    if (/^https:\/\/www\.twitch/ .test(change.url) && !(mySet.has(tabId))){
        mySet.add(tabId)
        chrome.tabs.executeScript(null, {file:'./foreground.js'}, ()=>console.log('injected'))
    }
    else if(!(/^https:\/\/www\.twitch/ .test(change.url)) && mySet.has(tabId)){
        console.log(`left twitch ${tabId}`);
        mySet.delete(tabId);
    }
    }
});


