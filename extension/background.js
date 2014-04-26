// Update the timer every 1 second
var UPDATE_INTERVAL = 1;

var DeskTrainer = {};
DeskTrainer.timeSpentOnBlackList = 0;
DeskTrainer.totalTimeOnBlackListPerWorkout = 5;

DeskTrainer.executeIfCurrentUrlIsOnBlackList = function(callback) {
    chrome.storage.sync.get("BLOCKED_URLS", function (urls) {
        var blockedUrls = urls["BLOCKED_URLS"] || [];
        var currentUrl = location.href;

        blockedUrls.forEach(function(blockedUrl) {
            if (currentUrl.indexOf(blockedUrl) > -1) {
                callback();
            }
        });
    });
};

// checks if currently on black list site, if so, update time.
DeskTrainer.updateTimeSpentOnBlackList = function() {
    DeskTrainer.executeIfCurrentUrlIsOnBlackList(function() {
        DeskTrainer.timeSpentOnBlackList += UPDATE_INTERVAL;
        console.log(DeskTrainer.timeSpentOnBlackList); //why are the numbers weird?
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
        if (DeskTrainer.hasTimerRanOut()) {
            window.location.replace("http://stackoverflow.com");
        }
    });
};

// Update timer data every UPDATE_INTERVAL seconds
setInterval(DeskTrainer.updateTimeSpentOnBlackList, UPDATE_INTERVAL * 1000);
setInterval(DeskTrainer.shouldWorkOut, UPDATE_INTERVAL * 1000);