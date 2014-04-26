// Update the timer every 1 second
var UPDATE_INTERVAL = 1;

var DeskTrainer = {};
DeskTrainer.timeSpentOnBlackList = 0;
DeskTrainer.totalTimeOnBlackListPerWorkout = 30;

DeskTrainer.hasTimerRanOut = function() {
    if (DeskTrainer.totalTimeOnBlackListPerWorkout <= DeskTrainer.timeSpentOnBlackList) {
        DeskTrainer.timeSpentOnBlackList = 0;
        return true;
    }
};

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

DeskTrainer.redirectToWorkOut = function() {
    if (DeskTrainer.hasTimerRanOut()) {
        window.location.replace("http://stackoverflow.com");
    }
};


DeskTrainer.updateTimeSpentOnBlackList = function() {
    DeskTrainer.executeIfCurrentUrlIsOnBlackList(function() {
        DeskTrainer.timeSpentOnBlackList += UPDATE_INTERVAL;
        console.log(DeskTrainer.timeSpentOnBlackList); //why are the numbers weird?
    });
};


DeskTrainer.shouldWorkOut = function() {
    DeskTrainer.executeIfCurrentUrlIsOnBlackList(DeskTrainer.redirectToWorkOut);
};

// Update timer data every UPDATE_INTERVAL seconds
setInterval(DeskTrainer.updateTimeSpentOnBlackList, UPDATE_INTERVAL * 1000);
setInterval(DeskTrainer.shouldWorkOut, UPDATE_INTERVAL * 1000);