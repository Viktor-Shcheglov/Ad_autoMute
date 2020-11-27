let mySet = new Set();
async function demo() {
    await new Promise(r => setTimeout(r, 2000));
  }
chrome.tabs.onUpdated.addListener((tabId,change,tab) =>{
    if (/^https:\/\/www\.twitch/.test(tab.url) && !(mySet.has(tabId))){
        mySet.add(tabId)
        console.log(tab.url,tabId);
        chrome.tabs.executeScript(tabId, {file:'./foreground.js'}, ()=>console.log('injected'))
    }
});

chrome.tabs.onRemoved.addListener((tabId,info) =>{
    if (mySet.has(tabId)){
        mySet.delete(tabId);
        console.log(`removed tab ${tabId}`);
    }
});
chrome.webRequest.onBeforeSendHeaders.addListener(
	({ requestHeaders }) => {
		for (const header of requestHeaders) {
			if (header.name.toLowerCase() === "origin")
				header.value = "https://player.twitch.tv";

			if (header.name.toLowerCase() === "referer")
				header.value = "https://player.twitch.tv/";
		}
		return { requestHeaders };
	},
	{ urls: ["*://*.hls.ttvnw.net/*"] },
	["blocking", "requestHeaders", "extraHeaders"]
);


