var splitOnCommaAndStripSpaces = function(str_list) {
    // first one replaces trailing commas
    // second one removes space
    // then split by comma
    var li = str_list.replace(/,+$/, "").replace(/^\s+|\s+$/g,"").split(/\s*,\s*/);
    return li.filter(function(item) {
        return item;
    });
};

$(function() {
    $("form").submit(function(event) {
        event.preventDefault();
        var formData = FormUtils.serializeForm(event.target);
        console.log(formData);
        formData.splitBlackListUrls = splitOnCommaAndStripSpaces(formData.blackListUrls);
        chrome.storage.sync.set({'Settings': formData});
    });

    var loadOptions = function() {
        chrome.storage.sync.get('Settings', function (result) {
            var settings = result["Settings"];
            FormUtils.populateForm($("form").get(0), settings);
            $(".btn-group input:checked").parent().addClass("active");
        });
    };

    loadOptions();
});