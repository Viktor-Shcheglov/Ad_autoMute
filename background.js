
chrome.tabs.onUpdated.addListener((tabId,change,tab) =>{
    if(change.url){
    console.log(change.url);
    if (/^https:\/\/www\.twitch/ .test(change.url)){
        chrome.tabs.executeScript(null, {file:'./foreground.js'}, ()=>console.log('injected'))
    }
    }
});


