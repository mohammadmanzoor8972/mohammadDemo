// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.

var pushNotification;
var Portal;

(function () {
  "use strict";
  document.addEventListener('deviceready', onDeviceReady.bind(this), false);
  //var imageDiv;
  //zip asset
  // var imageZip = "https://engagedelta.azurewebsites.net/fetchdelta.aspx?org=Employee Benefits&orgId=226";

  function onDeviceReady() {
    Portal = new portal();
    isGoogleAnalytics ? GoogleAnalyticsInitilize() : "";
    isGoogleAnalytics ? GoogleAnalyticsTrack() : "";    
    isGoogleAdvertise ? GoogleAdMobInit() : "";
    //isTranslationEnable ? (Portal.isTranslationEnable=true) : (Portal.isTranslationEnable=false);
    
    
    document.addEventListener('resume', onResume.bind(this), false);
    document.addEventListener("backbutton", onBackKeyDown, false);
    
   
    startSync();
  }


  function onBackKeyDown(e) {
    e.preventDefault();
    if ($.mobile.activePage.attr('id') == "home") {
      // navigator.app.exitApp();
      // alert('home')
      navigator.Backbutton.goHome(function () {
        // alert('success')
      }, function () {
        // alert('fail')
      });
    } else {
      $.mobile.back();
      //window.history.back();
      //  navigator.app.backHistory();
      // window.dispatchEvent(new Event('resize'));
    }
  }

  function getVersion() {

    return navigator.appInfo.getVersion();
  }

  function onPause() {
    //alert("pause");
    //        moveTo("home");

    // TODO: This application has been suspended. Save application state here.
  };

  function onResume() {
    // myPortalPINAuthenticate = true;
    //alert("resume");
    //moveTo("home");
    // TODO: This application has been reactivated. Restore application state here.
    // alert("on resume");

  };
})();
