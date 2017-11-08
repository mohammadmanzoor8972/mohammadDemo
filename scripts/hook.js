var target = "home.html";
var targetPage = null;
var noticecounter = 1;
var calledRegister = false;
var stageURL = "https://appstage.capitaengage.co.uk/EngageService.svc/GetDeviceId";
var isStageURL = false;


//Method Name : setEncryptedStorage
//Description : This methpd is used to store data into localStorage in Ecnrypted Format.
//Developer   : Mohammad
function setEncryptedStorage(key, value) {
    if (value) {
        var encrypted = CryptoJS.AES.encrypt(value.toString(), key);
        var erDeviceId = encrypted.toString();
        localStorage.setItem(key, erDeviceId);
    }
}

//Method Name : getEncryptedStorage
//Description : This methpd is used to get data from localStorage and Dycrypted Format.
//Developer   : Mohammad
function getEncryptedStorage(key) {
    if (window.localStorage[key]) {
        var deviceKeyEncry = localStorage.getItem(key)
        var decrypted = CryptoJS.AES.decrypt(deviceKeyEncry, key);
        var deviceKeyId = decrypted.toString(CryptoJS.enc.Utf8);
        return deviceKeyId;
    } else {
        return null;
    }
}


function startSync() {
    if (getEncryptedStorage('deviceid') == null) {

        // var myUrl =  "https://appstage.capitaengage.co.uk/EngageService.svc/GetDeviceId";
        var myUrl =  "https://app.capitaengage.co.uk/EngageService.svc/GetDeviceId";
        if(isStageURL){
            myUrl = stageURL;
        }

        $.mobile.loading('show', { text: "Registering App", textVisible: true });
        $.ajax({
            dataType: "json",
            beforeSend: function(request) {
                request.setRequestHeader("homepage", appName);
            },
            url: myUrl,
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                setEncryptedStorage('deviceid', data.GetDeviceIdResult);
                $.mobile.loading('hide');
                syncContent("");
            },
            error: function() {
                $.mobile.loading('hide');
                alert('Unable to reach server. Check internet connection.');
                navigator.app.exitApp();
            },
        });
    } else {
        syncContent("");
    }
}

function sizeText(elementId, parentElementId) {
    var boxHeight = document.getElementById(parentElementId).offsetHeight;
    while (document.getElementById(elementId).offsetHeight > boxHeight) {
        var text = $("#" + elementId).text();
        var lastIndex = text.lastIndexOf(" ")
        if (lastIndex > 0) {
            text = text.substring(0, lastIndex) + "...";
        } else {
            text = "";
        }
        $("#" + elementId).text(text);
    }
}


function successHandler(result) {}

function errorHandler(error) {
    alert('Unable to register for notifications: ' + error);
}

function onNotification(e) {
    switch (e.event) {
        case 'registered':
            if (e.regid.length > 0) {
                var appurl = "https://app.capitaengage.co.uk/EngageService.svc/RegisterAndroidDevice/" + e.regid;
                if(isStageURL){
                 appurl = "https://appstage.capitaengage.co.uk/EngageService.svc/RegisterAndroidDevice/" + e.regid;
                }
                $.ajax({
                    dataType: "json",
                    beforeSend: function(request) {
                        request.setRequestHeader("deviceid", getEncryptedStorage('deviceid'));
                    },
                    url: appurl,
                    type: 'GET',
                    dataType: 'json',
                    success: function(data) {},
                    error: function() { alert("Not registered"); },
                });
            }
            break;
        case 'message':
            var date = new Date();
            var n = date.toDateString();
            var time = date.toLocaleTimeString();
            var notices = "<small>" + time + ' ' + n + "</small><br>" + e.message;
            if (getEncryptedStorage('notices') == null) {
                setEncryptedStorage('notices', notices);
            } else {
                setEncryptedStorage('notices', notices + "<hr>" + getEncryptedStorage('notices'));
            }

            if ($('#n1') != null) {
                $('#n1').html(getEncryptedStorage('notices'));
            }
            if (e.foreground) {
                cordova.plugins.notification.local.schedule({
                    id: noticecounter,
                    title: e.title,
                    text: e.message
                });
                noticecounter = noticecounter + 1;
            }
            break;
        default:
            break;
    }
}

function onNotificationAPN(e) {
    var date = new Date();
    var n = date.toDateString();
    var time = date.toLocaleTimeString();
    var notices = "<small>" + time + ' ' + n + "</small><br>" + e.alert;
    if (getEncryptedStorage('notices') == null) {
        setEncryptedStorage('notices', notices);
    } else {
        setEncryptedStorage('notices', notices + "<hr>" + getEncryptedStorage('notices'));
    }

    if ($('#n1') != null) {
        $('#n1').html(getEncryptedStorage('notices'));
    }
    if (e.foreground == 1) {
        if ($("#popupMessageBox") != null) {
            if ($("#popupMessage") != null) {
                $("#popupMessage").text(e.alert);
                $("#popupMessageBox").popup("open");
            }
        }
    }
}


function registerNotifications() {
    if(window.plugins && window.plugins.pushNotification) {
        if (device.platform == 'android' || device.platform == 'Android' || device.platform == "amazon-fireos") {
            pushNotification = window.plugins.pushNotification;
            pushNotification.register(
                successHandler,
                errorHandler, {
                    "senderID": "921820197008",
                    "ecb": "onNotification"  //Android
                });
        } else if (device.platform == 'ios' || device.platform == 'iOS' || device.platform == 'IOS'){
            pushNotification = window.plugins.pushNotification;
            pushNotification.register(
                tokenHandler,
                errorHandler, {
                    "badge": "true",
                    "sound": "true",
                    "alert": "true",
                    "ecb": "onNotificationAPN" //iOS
                });

        }
      } else if (device.platform == 'ios' || device.platform == 'iOS' || device.platform == 'IOS'){
       
      pushNotification = PushNotification.init({ "android": {"senderID": "921820197008"},
        "ios": {"alert": "true", "badge": "true", "sound": "true"} } );
       
        pushNotification.on('registration', function(data) {
        // data.registrationId
             tokenHandler(data.registrationId);

        });
        pushNotification.on('notification', function(data) {
            onNotificationAPN(data);
        });
        pushNotification.on('error', function(e) {
        // e.message
        });
    } else {
        console.log("PushNotification not found :");
    }
}

function tokenHandler(result) {
    var appUrl = "https://app.capitaengage.co.uk/EngageService.svc/RegisterIOSDevice/" + result;
    if(isStageURL){
        appUrl = "https://appstage.capitaengage.co.uk/EngageService.svc/RegisterIOSDevice/" + result;
    }
    $.ajax({
        dataType: "json",
        beforeSend: function(request) {
            request.setRequestHeader("deviceid", getEncryptedStorage('deviceid'));
        },
        url:appUrl,
        type: 'GET',
        dataType: 'json',
        success: function(data) {},
        error: function() {},
    });
}

function syncContent(label) {

  if (calledRegister == false) {
        calledRegister = true;
        registerNotifications();
        if (navigator.userAgent.match(/iemobile/i) == false) {
           // registerNotifications();
        }
    }

    if (navigator.onLine) {
        $.mobile.loading('show', { text: "Calling Server", textVisible: true });

        //appName 
        var deltaURL = "http://engagedelta.azurewebsites.net/fetchdelta.aspx?org=" + getEncryptedStorage('deviceid') + "&orgId=" + appId;
        if(isStageURL){
            deltaURL = "http://engagedelta-stage.azurewebsites.net/fetchdelta.aspx?org=" + getEncryptedStorage('deviceid') + "&orgId=" + appId;
        }
        lastSync = getEncryptedStorage('lastSync');
        if (lastSync != null) {
            deltaURL = deltaURL + "&lastSync=" + lastSync
        }
        syncId = "cache";
        if (label.length > 0) {
            syncId = syncId + "/" + label;
        }
        
        var sync = ContentSync.sync({ src: deltaURL, id: syncId, type: "merge" });
        sync.on('progress', function(data) {
            $.mobile.loading('show', { text: "Updating Content (" + data.progress + "%)", textVisible: true });
        });
        sync.on('complete', function(data) {
            $.mobile.loading('hide');
            setEncryptedStorage('localPath', data.localPath);
            var d = new Date();
            var n = d.getTime();
            setEncryptedStorage('lastSync', n);
            moveTo("home.html", false);
            cordova.exec(null, null, "SplashScreen", "hide", []);
        });

        sync.on('error', function(e) {
            $.mobile.loading('hide');
            cordova.exec(null, null, "SplashScreen", "hide", []);
            moveTo("home.html", false);
        });

        sync.on('cancel', function() {
            $.mobile.loading('hide');
            cordova.exec(null, null, "SplashScreen", "hide", []);
            moveTo("home.html", false);
        });
    } else {
        if (getEncryptedStorage('lastSync') == null) {
            alert("Please check internet connection");
            navigator.app.exitApp();
        } else {
            moveTo("home.html", false);
        }
    }
}

function moveTo(page, transition) {

    if (page == "#") return;
    if (page == "refresh.html") {
        startSync();

    } else {
        if (page == "0.html" | page == "0") {
            page = "home";
        }

        if (page.substring(0, 12) == "browser:geo:") {
            if (device.platform == "iOS") {
                page = "browser:http://maps.apple.com/?ll=" + page.substring(12);
            }
        }
        if (page.substring(0, 8) == "browser:") {
            url = page.substring(8);
            if (device.platform == "Win32NT" && url.substring(0, 4) == "tel:") {
                window.open(encodeURI(url), '_self');
            } else if (device.platform == "Win32NT" && url.substring(0, 7) == "mailto:") {
                window.open(encodeURI(url), '_self');
            } else {
                window.open(url, '_system');
            }
        } else {
            localPath = getEncryptedStorage('localPath');
            if ((cordova.file === undefined) == false) {
                localPath = cordova.file.dataDirectory + "cache";
            }

            if (page.indexOf(".html", page.length - 5) == -1) {
                page = page + ".html";
            }

            url = localPath + "/" + page;
            if (page == "home.html") {
                $(":mobile-pagecontainer").pagecontainer("change", url, {
                    transition: 'none',
                    reload: true
                });
            } else {
                if (transition == false) {
                    $(":mobile-pagecontainer").pagecontainer("change", page, {
                        transition: 'none',
                        reload: true
                    });
                } else {
                    $(":mobile-pagecontainer").pagecontainer("change", page, {
                        transition: 'slide',
                        reload: true
                    });
                }
            }
        }
    }
}