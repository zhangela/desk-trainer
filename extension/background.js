// Update the timer every 1 second
var UPDATE_INTERVAL = 1;

var DeskTrainer = {};
DeskTrainer.timeLeftOnBlackList = 0;
DeskTrainer.totalTimeOnBlackListPerWorkout = 10;
DeskTrainer.activeTabUrl = null;
DeskTrainer.activeTabId = null;
DeskTrainer.shortenedTabUrl = null;

// if there are no settings, set default settings
chrome.storage.sync.get('Settings', function (result) {
    var settings = result["Settings"];
    
    if (! settings) {
        var defaultSettings = {
            blackListUrls: "facebook.com, twitter.com, reddit.com",
            duration: 120,
            endtime: "23:59",
            friday: true,
            monday: true,
            penalty: true,
            saturday: true,
            splitBlackListUrls: ["facebook.com", "twitter.com", "reddit.com"],
            starttime: "00:00",
            sunday: true,
            thursday: true,
            totalTimeOnBlackList: 120,
            tuesday: true,
            wednesday: true
        };

        chrome.storage.sync.set({'Settings': defaultSettings});
    }
});

DeskTrainer.getCurrentTabUrl = function() {
    chrome.tabs.getSelected(null, function(tab){
        DeskTrainer.shortenedTabUrl = tab.url.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[1];
        DeskTrainer.activeTabUrl = tab.url;
    });
};

DeskTrainer.executeIfCurrentUrlIsOnBlackList = function(callback) {
    chrome.storage.sync.get("BLOCKED_URLS", function (urls) {
        var blockedUrls = urls["BLOCKED_URLS"] || [];
        var currentUrl = DeskTrainer.shortenedTabUrl;

        blockedUrls.forEach(function(blockedUrl) {
            if (currentUrl.indexOf(blockedUrl) > -1) {
                callback();
            }
        });
    });
};

DeskTrainer.hasTimerRanOut = function() {
    if (DeskTrainer.timeLeftOnBlackList <= 0) {
        DeskTrainer.timeLeftOnBlackList = DeskTrainer.totalTimeOnBlackListPerWorkout;
        return true;
    }
};

DeskTrainer.shouldWorkOut = function() {

    DeskTrainer.executeIfCurrentUrlIsOnBlackList(function() {
        DeskTrainer.timeLeftOnBlackList -= UPDATE_INTERVAL;
        console.log(DeskTrainer.timeLeftOnBlackList);
        if (DeskTrainer.hasTimerRanOut()) {
            chrome.tabs.update(DeskTrainer.activeTabId, {url: "http://desktrainer.meteor.com/workout?redirect=" + DeskTrainer.activeTabUrl});
        }
    });
};

setInterval(DeskTrainer.getCurrentTabUrl, UPDATE_INTERVAL * 500);
// Update timer every UPDATE_INTERVAL seconds
setInterval(DeskTrainer.shouldWorkOut, UPDATE_INTERVAL * 1000);