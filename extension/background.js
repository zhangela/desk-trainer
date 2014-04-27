// Update the timer every 1 second
var UPDATE_INTERVAL = 1;

var DeskTrainer = {};
DeskTrainer.totalTimeOnBlackListPerWorkout = 30 * 1000; //120 minutes on facebook until next workout
DeskTrainer.timeLeftOnBlackList = DeskTrainer.totalTimeOnBlackListPerWorkout;
DeskTrainer.duration = 60; // 60 seconds of workout
DeskTrainer.activeTabUrl = null;
DeskTrainer.activeTabId = null;
DeskTrainer.shortenedTabUrl = null;


WEEKDAYS = {
    0: "sunday",
    1: "monday",
    2: "tuesday",
    3: "wednesday",
    4: "thursday",
    5: "friday",
    6: "saturday"
};

// if there are no settings, set default settings
chrome.storage.sync.get('Settings', function (result) {
    var settings = result["Settings"];
    
    if (! settings) {
        var defaultSettings = {
            blackListUrls: "facebook.com, twitter.com, reddit.com",
            duration: 60,
            endtime: "23:59",
            friday: true,
            monday: true,
            penalty: true,
            saturday: true,
            splitBlackListUrls: ["facebook.com", "twitter.com", "reddit.com"],
            starttime: "00:00",
            sunday: true,
            thursday: true,
            totalTimeOnBlackList: 30,
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

// procrastinating is defined as: 1) it is during a time when the user 
// indicated he wants to be productive and 2) the user is currently on
// a black listed website
DeskTrainer.executeIfProcrastinating = function(callback) {
    chrome.storage.sync.get("Settings", function (result) {

        // set this value here in case if it changed
        DeskTrainer.totalTimeOnBlackListPerWorkout = result["Settings"]["totalTimeOnBlackList"] * 60; //already in seconds
        DeskTrainer.duration = result["Settings"]["duration"];

        var now = new Date();
        var dayOfTheWeek = WEEKDAYS[now.getDay()];

        var startTime = result["Settings"]["starttime"];
        var endTime = result["Settings"]["endtime"];

        if (result["Settings"][dayOfTheWeek] && DeskTrainer.isTimeBetweenStartAndEnd(now, startTime, endTime)) {
            var blackListUrls = result["Settings"]["splitBlackListUrls"];
            var currentUrl = DeskTrainer.shortenedTabUrl;

            blackListUrls.forEach(function(blockedUrl) {
                if (currentUrl.indexOf(blockedUrl) > -1) {
                    callback();
                }
            });
        }
    });
};

DeskTrainer.isTimeBetweenStartAndEnd = function(time, startTime, endTime) {
    var hour = time.getHours();
    var minute = time.getMinutes();
    var cur = hour * 60 + minute;

    var startHour = parseInt(startTime.split(":")[0], 10);
    var startMinute = parseInt(startTime.split(":")[1], 10);
    var start = startHour * 60 + startMinute;

    var endHour = parseInt(endTime.split(":")[0], 10);
    var endMinute = parseInt(endTime.split(":")[1], 10);
    var end = endHour * 60 + endMinute;

    return (start <= cur && cur <= end);
};

DeskTrainer.hasTimerRanOut = function() {
    if (DeskTrainer.timeLeftOnBlackList <= 0) {
        DeskTrainer.timeLeftOnBlackList = DeskTrainer.totalTimeOnBlackListPerWorkout;
        return true;
    }
};

DeskTrainer.shouldWorkOut = function() {
    DeskTrainer.executeIfProcrastinating(function() {
        DeskTrainer.timeLeftOnBlackList -= UPDATE_INTERVAL;
        console.log(DeskTrainer.timeLeftOnBlackList);
        if (DeskTrainer.hasTimerRanOut()) {
            alert("ran out");
            chrome.tabs.update(DeskTrainer.activeTabId, {
                url: "http://desktrainer.meteor.com/workout?redirect=" + DeskTrainer.activeTabUrl +
                "&duration=" + DeskTrainer.duration +
                "&distraction=" + DeskTrainer.totalTimeOnBlackListPerWorkout
            });
        }
    });
};

setInterval(DeskTrainer.getCurrentTabUrl, UPDATE_INTERVAL * 500);
// Update timer every UPDATE_INTERVAL seconds
setInterval(DeskTrainer.shouldWorkOut, UPDATE_INTERVAL * 1000);