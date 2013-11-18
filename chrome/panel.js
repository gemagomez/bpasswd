var prefs;

var updateOpts = function(onlyGlobal) {
    var salt = $('#bpasswd-salt').val();
    var found_salt = false;

    var cost = prefs.global_options.cost;
    var max_len = prefs.global_options.max_len;
    var gen_method = prefs.global_options.gen_method;

    /* Apply overrides */
    if (!onlyGlobal && typeof(prefs.salt_options[salt]) !== "undefined") {
        found_salt = true;
        if (typeof(prefs.salt_options[salt]["cost"]) !== "undefined")
            cost = prefs.salt_options[salt]["cost"];
        if (typeof(prefs.salt_options[salt]["max_len"]) !== "undefined")
            max_len = prefs.salt_options[salt]["max_len"];
        if (typeof(prefs.salt_options[salt]["gen_method"]) !== "undefined")
            gen_method = prefs.salt_options[salt]["gen_method"];
    }

    $('#more_max_len').val(max_len);
    $('#more_cost').val(cost);
    $('#more_gen_method').val(gen_method);

    console.log("called me; " + found_salt ? "yep" : "nope");
    if (found_salt)
        $('#found_salt_config').show();
    else
        $('#found_salt_config').hide();
}

$('#bpasswd-salt').change(function() {
    updateOpts(false);
});

$('#bpasswd-more-options').click(function() {
    $('#more-options').toggle();
});

$('#bpasswd-derive-key').click(function() {
    var salt = $('#bpasswd-salt').val();
    var pass = $('#bpasswd-password').val();

    var cost = $('#more_cost').val();
    var max_len = $('#more_max_len').val();
    var gen_method = $('#more_gen_method').val();

    console.log("max_len, gen_method: " + max_len + ", " + gen_method);

    var dkey = BPasswd.generate(salt, pass, cost, gen_method).substring(0, max_len);
    $('#bpasswd-dkey').val(dkey);
    $('#bpasswd-dkey').focus();
    $('#bpasswd-dkey').select();
    document.execCommand('Copy');
});

$('#bpasswd-show-options').click(function() {
    chrome.tabs.create({
        url: "options.html"
    });
});

$('#bpasswd-save-options').click(function() {
    var salt = $('#bpasswd-salt').val();
    var cost = $('#more_cost').val();
    var max_len = $('#more_max_len').val();
    var gen_method = $('#more_gen_method').val();

    if (salt == "")
        return;

    if (typeof(prefs.salt_options[salt]) === "undefined")
        prefs.salt_options[salt] = {};

    prefs.salt_options[salt].gen_method = gen_method;
    prefs.salt_options[salt].cost = cost;
    prefs.salt_options[salt].max_len = max_len;

    chrome.storage.sync.set({'salt_options': prefs.salt_options});

    updateOpts(false);

    $('#saved_salt_salt').html("" + salt);
    $('#saved_salt_config').show(100);
    $('#saved_salt_config').delay(3000).hide(100);
});

$('#bpasswd-show-pwd').change(function() {
    document.getElementById('bpasswd-password').type = $('#bpasswd-show-pwd').is(':checked') ? "text" : "password";
});

/*self.port.on("hide", function() {
    $('#bpasswd-password').val("");
    $('#bpasswd-salt').val("");
    $('#bpasswd-dkey').val("");
});*/

chrome.storage.sync.get(null, function(items) {
    console.log("found it...");
    console.dir(items);
    prefs = items;
    $('#bpasswd-password').focus();
    $('#saved_salt_config').hide();
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs.length > 0) {
            var u = URI(tabs[0].url);
            var domain = u.domain();
            var tld = u.tld();
            var url = domain.substring(0, domain.length-tld.length-1);
            $('#bpasswd-salt').val(url);
            updateOpts(false);
        }
    });
});


$(function() {
    $('input[type="number"]').inputNumber();
    $('#more-options').hide();
});
