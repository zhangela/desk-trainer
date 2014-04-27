var splitOnCommaAndStripSpaces = function(str_list) {
    return str_list.replace(/^\s+|\s+$/g,"").split(/\s*,\s*/);
};

// var saveOptions = function() {
//     var el_entries = document.getElementById('textarea_urls_to_block');
//     var entries = el_entries.value;
//     chrome.storage.sync.set({'BLOCKED_URLS': splitOnCommaAndStripSpaces(entries)});
// };

$(function() {
    $("form").submit(function(event) {
        event.preventDefault();
        var formData = FormUtils.serializeForm(event.target);
        console.log(formData);
        formData.splitBlackListUrls = splitOnCommaAndStripSpaces(formData.blackListUrls);
        chrome.storage.sync.set({'Settings': formData});
    });



});


var loadOptions = function() {
    chrome.storage.sync.get('Settings', function (result) {
        var settings = result["Settings"];
        FormUtils.populateForm($("form").get(0), settings);
    });
};

window.addEventListener("load", loadOptions);