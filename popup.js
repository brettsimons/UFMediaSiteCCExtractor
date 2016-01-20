var transcript = "";

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	if (message.updatePopup) {
		transcript = message.data;
		if (transcript != null && transcript != "" && transcript.indexOf("Loading... Please wait.") != 0) {
			document.getElementById('status').textContent = transcript;
			copyCC.style["display"] = "";
		}
		else {
			if (transcript == null || transcript == "") document.getElementById('status').textContent = "No Closed Captioning for this video.";
			else document.getElementById('status').textContent = transcript;
			copyCC.style["display"] = "none";
		}
	}
});

window.onload = function startup() {
	document.getElementById('status').textContent = "";
	chrome.runtime.sendMessage({requestUpdate: true});
	document.getElementById("copyCC").onclick = copyToClipboard;
};

function copyToClipboard() {
	var copyFrom = document.getElementById('status');
	copyFrom.focus();
	document.execCommand('selectAll', false, null);
};