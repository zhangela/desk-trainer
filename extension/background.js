// Update the timer every 1 second
var UPDATE_INTERVAL = 1;

var DeskTrainer = {};
DeskTrainer.timeSpentOnBlackList = 0;
DeskTrainer.totalTimeOnBlackListPerWorkout = 10;
DeskTrainer.activeTabUrl = null;
DeskTrainer.activeTabId = null;

DeskTrainer.getCurrentTabUrl = function() {
    chrome.tabs.getSelected(null, function(tab){
      DeskTrainer.activeTabUrl = tab.url;
    });
};

DeskTrainer.executeIfCurrentUrlIsOnBlackList = function(callback) {
    chrome.storage.sync.get("BLOCKED_URLS", function (urls) {
        var blockedUrls = urls["BLOCKED_URLS"] || [];
        var currentUrl = DeskTrainer.activeTabUrl;

        blockedUrls.forEach(function(blockedUrl) {
            if (currentUrl.indexOf(blockedUrl) > -1) {
                callback();
            }
        });
    });
};

DeskTrainer.hasTimerRanOut = function() {
    if (DeskTrainer.totalTimeOnBlackListPerWorkout <= DeskTrainer.timeSpentOnBlackList) {
        DeskTrainer.timeSpentOnBlackList = 0;
        return true;
    }
};

DeskTrainer.shouldWorkOut = function() {

    DeskTrainer.executeIfCurrentUrlIsOnBlackList(function() {
        DeskTrainer.timeSpentOnBlackList += UPDATE_INTERVAL;
        console.log(DeskTrainer.timeSpentOnBlackList);
        if (DeskTrainer.hasTimerRanOut()) {
            chrome.tabs.update(DeskTrainer.activeTabId, {url: "http://meteor.com"});
        }
    });
};

// Update timer data every UPDATE_INTERVAL seconds
setInterval(DeskTrainer.getCurrentTabUrl, UPDATE_INTERVAL * 500);
setInterval(DeskTrainer.shouldWorkOut, UPDATE_INTERVAL * 1000);