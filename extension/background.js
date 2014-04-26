var stayfocused = {};

stayfocused.isOnBlockedSite = function() {
    chrome.storage.sync.get("BLOCKED_URLS", function (urls) {
        var blockedUrls = urls["BLOCKED_URLS"] || [];
        console.log(blockedUrls);
        var current_url = location.href;

        blockedUrls.forEach(function(blockedUrl) {
            if (current_url.indexOf(blockedUrl) > -1) {
                return true;
            }
        });
    });
};

stayfocused.hasTimerRanOut = function() {
    return true;
};

stayfocused.shouldWorkOut = function() {
    if (stayfocused.isOnBlockedSite() && stayfocused.hasTimerRanOut()) {
        alert("you should work out!");
    }
};

stayfocused.shouldWorkOut();