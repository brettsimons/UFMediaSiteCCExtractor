chrome.tabs.onUpdated.addListener(checkForValidUrl);
var transcript = "";
var requestUrl = "";
var isHttps = false;

function checkForValidUrl(tabId, changeInfo, tab) {
	transcript = "Loading... Please wait.";
	if (tab.url != null && (tab.url.indexOf("mediasite.video.ufl.edu/Mediasite/Play/") > 0 || tab.url.indexOf("warrington.video.ufl.edu/Mediasite/Play/") > 0)) {
		chrome.pageAction.show(tabId);
		
		if (tab.url.indexOf("https") == 0) {
		    requestUrl = "https://mediasite.video.ufl.edu/Mediasite/PlayerService/PlayerService.svc/json/GetPlayerOptions";
		    isHttps = true;
		}
		else {
		    requestUrl = "http://mediasite.video.ufl.edu/Mediasite/PlayerService/PlayerService.svc/json/GetPlayerOptions";
		}

		chrome.webRequest.onSendHeaders.addListener(initiate, { "urls": [requestUrl] }, ["requestHeaders"]);
	}
};

function initiate(details) {
	chrome.webRequest.onSendHeaders.removeListener(initiate);
	var headers = details.requestHeaders;
	var getPlayerOptionsRequest = {"getPlayerOptionsRequest":{"ResourceId": "", "QueryString": "", "UseScreenReader": false, "UrlReferrer": ""}};
	var xhr = new XMLHttpRequest();
	xhr.open("POST", requestUrl);
	
	xhr.setRequestHeader("Accept", "application/json, text/javascript, */*; q=0.01");
	xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
	xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

	if (isHttps) {
        xhr.withCredentials = true;
	}
	
	var urlOffset = 46;

	if (isHttps) urlOffset = 47;

	for (var i = 0; i < headers.length; i++) {
	    if (headers[i].name == "Referer") {
			var endOfResourceId = headers[i].value.indexOf('?', urlOffset);
			if (endOfResourceId > urlOffset) {
				getPlayerOptionsRequest.getPlayerOptionsRequest.ResourceId = headers[i].value.substr(urlOffset, endOfResourceId - urlOffset);
			}
			else {
				getPlayerOptionsRequest.getPlayerOptionsRequest.ResourceId = headers[i].value.substr(urlOffset, headers[i].value.length - urlOffset);
			}
			break;
		}
	}
	
	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4 && xhr.status == 200) {
			var input = JSON.parse(xhr.responseText);
			var array = input.d.Presentation.Transcript;
			transcript = "";
			
			for (var i = 0; i < array.length; i++) { 
				transcript += unescape(JSON.parse('"' + array[i].Text + '"')) +  " ";
			}
			
			chrome.runtime.sendMessage({updatePopup: true, data: transcript});
		}
	}
	
	xhr.send(JSON.stringify(getPlayerOptionsRequest));
};

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	if (message.requestUpdate) {
		chrome.runtime.sendMessage({updatePopup: true, data: transcript});
	}
});