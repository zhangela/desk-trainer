var save_options = function() {
    // allowed urls
    var el_entries = document.getElementById('textarea_urls_to_block');
    var entries = el_entries.value;
    chrome.storage.sync.set({'BLOCKED_URLS': entries.split(",")});
    
    // on or off
    var el_on_or_off = document.getElementById('stayfocused_on_or_off');
    var on_or_off;
    if (el_on_or_off.checked) {
        on_or_off = "on";
    } else {
        on_or_off = "off";
    }
    localStorage["stayfocused_ON_OR_OFF"] = on_or_off;
    
};

var load_options = function() {
    chrome.storage.sync.get('BLOCKED_URLS', function (di) {
        var entries = di["BLOCKED_URLS"].join(', ');
        console.log(entries);
        var el_entries = document.getElementById('textarea_urls_to_block');
        el_entries.value = entries;
    });

    document.getElementsByClassName("btn_save")[0].addEventListener("click", save_options);
};


window.addEventListener("load", load_options);