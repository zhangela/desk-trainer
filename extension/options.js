var splitOnCommaAndStripSpaces = function(str_list) {
    return str_list.replace(/^\s+|\s+$/g,"").split(/\s*,\s*/);
};

var save_options = function() {
    var el_entries = document.getElementById('textarea_urls_to_block');
    var entries = el_entries.value;
    chrome.storage.sync.set({'BLOCKED_URLS': splitOnCommaAndStripSpaces(entries)});
};

var load_options = function() {
    chrome.storage.sync.get('BLOCKED_URLS', function (di) {
        var entries = di["BLOCKED_URLS"].join(', ');
        var el_entries = document.getElementById('textarea_urls_to_block');
        el_entries.value = entries;
    });
    document.getElementsByClassName("btn_save")[0].addEventListener("click", save_options);
};

window.addEventListener("load", load_options);