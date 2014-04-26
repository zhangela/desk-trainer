var stayfocused = {};

stayfocused.shouldWorkOut = function() {

    chrome.storage.sync.get("BLOCKED_URLS", function (urls) {
        var blockedUrls = urls["BLOCKED_URLS"] || [];
        console.log(blockedUrls);
        var current_url = location.href;

        console.log(location.href);

        blockedUrls.forEach(function(blockedUrl) {
        if (current_url.indexOf(blockedUrl) > -1) {
            alert("you should work out!");
        }
    });

    });
};

stayfocused.shouldWorkOut();