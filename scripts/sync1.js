var target = "home.html";
var targetPage = null;
var noticecounter = 1;
var calledRegister = false;
var stageURL = "https://appstage.capitaengage.co.uk/EngageService.svc/GetDeviceId";
var testURL = "https://apptest.capitaengage.co.uk/EngageService.svc/GetDeviceId";
var isStageURL = buildEnvironment; // 1- Stage, 0- Live, 2- test; (from adconfig.js)
var defaultPage = "home.html";
var defaultNotifyPage = "home.html";
var anyNotify = false;

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

//Method Name : addLangQueryToUrl
//Description : This methpd is used to append language setting to the given url.
//Developer   : Lanping
//para omitEn : true - not to append if language is english
function addLangQueryToUrl(url, omitEn) {
    //amend2017/05: for translation
    var isTranslationEnable = getEncryptedStorage('isTranslationEnable');
    var lang = getEncryptedStorage('lang');
    if (isTranslationEnable && lang != null && lang.length > 0) {
        if (lang == "en" && omitEn) {
            return url;
        } else if (lang == "en" && omitEn == false) {
            url = url + "&lang=" + lang;
            return url;
        } else {
            url = url + "&lang=" + lang;
            return url;
        }
    }
    return url;
}


function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires=" + d.toGMTString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function convertXml2JSon(xmlcontent) {
  var x2jsobj = x2jsobj || new X2JS();
  return JSON.stringify(x2jsobj.xml2json(xmlcontent.documentElement));
};

function GoogleAnalyticsTrack(){
    if(gaU){
      //location.href.split("/")[location.href.split("/").length-1]
gaU('send','pageview',{'orgId':appId, 'title':appName,'page':$(".ui-header:first .ui-title").text()});
}
};

function GoogleAnalyticsInitilize(){
    gaU('create',Google_Anylatics_TrackID,{'storage':'none','clientId':device.uuid});
    gaU('set','checkProtocolTask',null);
    gaU('set','anonymizeIp',true);
    gaU('set','forceSSL',true);
}

function GoogleAdMobInit(){
    // Set AdMobAds options: 
      admobid = {
        banner: 'ca-app-pub-6605975537643533/'+googleAdBanner
      }
      
      admob.banner.config({
        id: admobid.banner,
        isTesting: false,
        autoShow: true,
    })
    
    admob.banner.prepare()
}


function pulltoRefresh() {
    $('.ui-content').ptrLight({

        // disable the plugin
        paused: false,

        // scroll distance in pixels that will not count towards the pull distance
        ignoreThreshold: 10,

        // amount of pixels the scroll element needs to get pulled down by in order to execute the 'refresh()' function
        pullThreshold: 200,

        // maximum amount of pixels the scroll element will be allowed to scroll down by
        maxPullThreshold: 500,

        // reset the pull to refresh indicator after this amount of time in ms
        spinnerTimeout: 100,

        // if not otherwise specified here, the parent node of your selected element is assumed as the scroll element of your page
        scrollingDom: null,

        refresh: function () {
           // console.log("heloo**");
            moveTo("refresh.html", false);

        }


        // true: a user can start his upward scroll/downward drag on a scroll position > 0, reaching the top and pulling even further to activate ptr
        // false: a user will have to scroll to the very top, release his tap/drag and drag again from scroll position 0 to activate the ptr
        // allowPtrWhenStartedWhile<a href="http://www.jqueryscript.net/tags.php?/Scroll/">Scroll</a>ed: false,

    });
}

function startSync() {
    if (getEncryptedStorage('deviceid') == null) {

        var myUrl = "https://app.capitaengage.co.uk/EngageService.svc/GetDeviceId";

        if (isStageURL == 1) {
            myUrl = "https://appstage.capitaengage.co.uk/EngageService.svc/GetDeviceId";
        } else if (isStageURL == 2) {
            myUrl = "https://apptest.capitaengage.co.uk/EngageService.svc/GetDeviceId";
        } // else default to Live

        $.mobile.loading('show', { text: "Loading...", textVisible: true });
        $.ajax({
            dataType: "json",
            beforeSend: function (request) {
                request.setRequestHeader("homepage", appName);
            },
            url: myUrl,
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                setEncryptedStorage('deviceid', data.GetDeviceIdResult);
                $.mobile.loading('hide');
                syncContent("");
            },
            error: function () {
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



function successHandler(result) { }

function errorHandler(error) {
    alert('Unable to register for notifications: ' + error);
}

function onNotification(e) {
    switch (e.event) {
        case 'registered':
            if (e.regid.length > 0) {
                localStorage.PushID = e.regid;
                var appurl = "https://app.capitaengage.co.uk/EngageService.svc/RegisterAndroidDevice/" + e.regid;

                if (isStageURL == 1) {
                    appurl = "https://appstage.capitaengage.co.uk/EngageService.svc/RegisterAndroidDevice/" + e.regid;
                } else if (isStageURL == 2) {
                    appurl = "https://apptest.capitaengage.co.uk/EngageService.svc/RegisterAndroidDevice/" + e.regid;
                } // else default to Live
                if (navigator.onLine) {
                    $.ajax({
                        dataType: "json",
                        beforeSend: function (request) {
                            request.setRequestHeader("deviceid", getEncryptedStorage('deviceid'));
                        },
                        url: appurl,
                        type: 'GET',
                        dataType: 'json',
                        success: function (data) { },
                        error: function () {

                            alert("Not registered");

                        },
                    });
                }
            }
            break;
        case 'message':
        debugger;
            var date = new Date();
            var n = date.toDateString();
            var time = date.toLocaleTimeString();
            var notices = "<small>" + time + ' ' + n + "</small><br>" + e.message;
            defaultNotifyType =  e.payload ? e.payload.action : "";
            if(e.payload.action=="apppage"){
                defaultNotifyPage = e.payload.item;
            } else if (e.payload.action=="wizard"){
                defaultNotifyPage = "-"+e.payload.item;
            } else if (e.payload.action=="webpage"){
                defaultNotifyPage = e.payload.item.toLowerCase();
            } else {
                defaultNotifyPage =  "home.html";
            }

            if (getEncryptedStorage('notices') == null) {
                setEncryptedStorage('notices', notices);
            } else {
                setEncryptedStorage('notices', notices + "<hr>" + getEncryptedStorage('notices'));
            }

            if ($('#n1') != null) {
                $('#n1').html(getEncryptedStorage('notices'));
            }
            if (e.foreground) {
                //alert(e.message);

                cordova.plugins.notification.local.schedule({
                    id: noticecounter,
                    title: e.title,
                    text: e.message
                });
                noticecounter = noticecounter + 1;
            };
            if(defaultNotifyPage != defaultPage){
                anyNotify = true;
                moveTo(defaultNotifyPage,false);
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

    if (window.plugins && window.plugins.pushNotification) {
        // alert('hin33 ***** 22')
        if (device.platform == 'android' || device.platform == 'Android' || device.platform == "amazon-fireos") {
            pushNotification = window.plugins.pushNotification;
            pushNotification.register(
                successHandler,
                errorHandler, {
                    "senderID": "921820197008",
                    "ecb": "onNotification"  //Android
                });
        } else if (device.platform == 'ios' || device.platform == 'iOS' || device.platform == 'IOS') {
            pushNotification = window.plugins.pushNotification;
            pushNotification.register(
                tokenHandler,
                errorHandler, {
                    "badge": "true",
                    "sound": "true",
                    "alert": "true",
                    "ecb": "onNotificationAPN" //iOS
                });

        } else {
            //WP8
            //  alert('hin33 for Wp8');
            pushNotification = window.plugins.pushNotification;

            if (!localStorage.getItem("wp8PushUriDec")) {
                // alert('register already....');
                pushNotification.register(
                    channelHandlerWp8,
                    errorHandler,
                    {
                        "channelName": "MyChannelwp8",
                        "ecb": "onNotificationWP8",
                        "uccb": "channelHandlerWp8",
                        "errcb": "jsonErrorHandler"
                    });
            }
        }
    } else if (device.platform == 'ios' || device.platform == 'iOS' || device.platform == 'IOS') {
        //  alert('hin33 for iOS');
        pushNotification = PushNotification.init({
            "android": { "senderID": "921820197008" },
            "ios": { "alert": "true", "badge": "true", "sound": "true" }
        });

        pushNotification.on('registration', function (data) {
            // data.registrationId
            tokenHandler(data.registrationId);

        });
        pushNotification.on('notification', function (data) {
            onNotificationAPN(data);
        });
        pushNotification.on('error', function (e) {
            // e.message
        });
    } else {
        alert("pushNotification not found");
        console.log("PushNotification not found :");
    }
}

function onNotificationWP8(e) {

    if (e.type == "toast" && e.jsonContent) {
        pushNotification.showToastNotification(successHandler, errorHandler,
            {
                "Title": e.jsonContent["wp:Text1"], "Subtitle": e.jsonContent["wp:Text2"], "NavigationUri": e.jsonContent["wp:Param"]
            });
    }

    if (e.type == "raw" && e.jsonContent) {
        alert(e.jsonContent.Body);
    }
}

function jsonErrorHandler(error) {
    console.log(error.code);
    console.log(error.message);
}

function channelHandlerWp8(data) {

    console.log("Channe Handler");
    console.log(data);
    console.log(data.uri);
    // alert(data.uri);
    if (data.uri == "") {
        registerNotifications();
    } else {
        setEncryptedStorage("wp8PushUri", data.uri);
        localStorage.setItem("wp8PushUriDec", data.uri)
    }
}


function tokenHandler(result) {
    var appUrl = "https://app.capitaengage.co.uk/EngageService.svc/RegisterIOSDevice/" + result;

    if (isStageURL == 1) {
        appUrl = "https://appstage.capitaengage.co.uk/EngageService.svc/RegisterIOSDevice/" + result;
    } else if (isStageURL == 2) {
        appUrl = "https://apptest.capitaengage.co.uk/EngageService.svc/RegisterIOSDevice/" + result;
    } // else default to Live

    $.ajax({
        dataType: "json",
        beforeSend: function (request) {
            request.setRequestHeader("deviceid", getEncryptedStorage('deviceid'));
            request.setRequestHeader("homepage", appName);
        },
        url: appUrl,
        type: 'GET',
        dataType: 'json',
        success: function (data) { },
        error: function () { },
    });
}

function syncContent(label) {
    defaultPage = "home.html";
    if (calledRegister == false && navigator.onLine) {
        calledRegister = true;
        registerNotifications();
        if (navigator.userAgent.match(/iemobile/i) == false) {
            // registerNotifications();
        }
    }

    if (navigator.onLine) {
        $.mobile.loading('show', { text: "Loading...", textVisible: true });

        //appName
        var deltaURL = "https://engagedelta.azurewebsites.net:443/fetchdelta.aspx?org=" + getEncryptedStorage('deviceid') + "&orgId=" + appId;

        if (isStageURL == 1) {
            deltaURL = "https://engagedelta-stage.azurewebsites.net:443/fetchdelta.aspx?org=" + getEncryptedStorage('deviceid') + "&orgId=" + appId;
        } else if (isStageURL == 2) {
            deltaURL = "https://engagedelta-test.azurewebsites.net:443/fetchdelta.aspx?org=" + getEncryptedStorage('deviceid') + "&orgId=" + appId;
        } // else default to Live

        console.log("Delta URL:")
        console.log(deltaURL)

        lastSync = getEncryptedStorage('lastSync');
        if (lastSync != null) {
            deltaURL = deltaURL + "&lastSync=" + lastSync
        }
        syncId = "cache";
        if (label.length > 0) {
            syncId = syncId + "/" + label;
        }
        //amend2017/05: for translation to append lang setting
        deltaURL = addLangQueryToUrl(deltaURL, true);

        var sync = ContentSync.sync({ src: deltaURL, id: syncId, type: "merge" });//amend2017/05: ?Q
        sync.on('progress', function (data) {
            // $.mobile.loading('show', { text: "Updating Content (" + data.progress + "%)", textVisible: true });
            $.mobile.loading('show', { text: "Loading...", textVisible: true });
        });
        sync.on('complete', function (data) {
            $.mobile.loading('hide');
            if(navigator.splashscreen){
                navigator.splashscreen.hide();
            }
            setEncryptedStorage('localPath', data.localPath);
            var d = new Date();
            var n = d.getTime();
            setEncryptedStorage('lastSync', n);
            moveTo(defaultPage, false);

            setTimeout(function(){
               // alert('called...')
            if(anyNotify && defaultNotifyPage != defaultPage){
                debugger;
                anyNotify = false;
                moveTo(defaultNotifyPage,false);
            }
            },2000)
          
            cordova.exec(null, null, "SplashScreen", "hide", []);

        });

        sync.on('error', function (e) {
            $.mobile.loading('hide');
            cordova.exec(null, null, "SplashScreen", "hide", []);
            moveTo("home.html", false);
        });

        sync.on('cancel', function () {
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
    var randomNumber = ~~(Math.random() * (99999 - 11111 + 1)) + 11111;
    
    if (page == "0.html" | page == "0") {
            page = "home";
        }
        
  if (page == "#" || (event && location.href.indexOf(page)!=-1)) return;
   // if (page == "#" || page == "") return;
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
                window.open(encodeURI(url), '_self', 'location=no');
            } else if (device.platform == "Win32NT" && url.substring(0, 7) == "mailto:") {
                window.open(encodeURI(url), '_self','location=no');
            } else {
                window.open(url, '_system');
            }
        } else if (page.indexOf("www") != -1 || page.indexOf("http") != -1) {
            window.open(page, "_blank",'location=no');
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
                $(":mobile-pagecontainer").pagecontainer("change", url +"?cache="+randomNumber, {
                    transition: 'none',
                    reload: true
                });
            } else {
                if (transition == false) {
                    $(":mobile-pagecontainer").pagecontainer("change", page+"?cache="+randomNumber, {
                        transition: 'none',
                        reload: true
                    });
                } else {
                    if (device.platform == 'Android' || device.platform == 'iOS') {
                        $(":mobile-pagecontainer").pagecontainer("change", page+"?cache="+randomNumber, {
                            transition: 'slide',
                            reload: true
                        });
                    } else {
                        $(":mobile-pagecontainer").pagecontainer("change", page+"?cache="+randomNumber, {
                            transition: 'none',
                            reload: true
                        });
                    }
                }
            }
        }
        GoogleAnalyticsTrack();
    }
}