/*
Class : Portal Integration
Author : Mohammad
Description : Integration of Portal in mobile app. User can authenticate and get profile data.
*/

/* Global Initilization */

var myPortalPINAuthenticate = true; //if PIN is already set
var isPortalAuthorize = false; // If Pin is invalid and To handle portal Expire after 30 min
var isScreenLockEnable = true;
var myPIN = myPIN || "";
var myGUID = myGUID || "";
var myOldGUID = myOldGUID || "";
var myTempToken = myTempToken || "";
var myShortLivedToken = myShortLivedToken || "";
var SecureStore = SecureStore || {"setItem":function(){},"getItem":function(){},"removeItem":function(){} };
var ss = null;
var Env = {0:"app",1:"appstage",2:"apptest"}
//"https://engage-services-dev.azurewebsites.net/EngageService.svc/PortalUserAuthenticate

//https://apptest.capitaengage.co.uk/EngageService.svc/OrganisationPortalSetting?orgId=374
function portal() {
   var that = this;
   var appdomain = Env[buildEnvironment] + ".capitaengage.co.uk";
   that.API = {
      "PortalUserAuthenticate": "https://"+appdomain+"/EngageService.svc/PortalUserAuthenticate",
      "PortalUserValidate": "https://"+appdomain+"/EngageService.svc/PortalUserValidate",
      "PortalUserProfile": "https://"+appdomain+"/EngageService.svc/PortalUserProfile",
      "PortalUserSLToken": "https://"+appdomain+"/EngageService.svc/PortalUserSLToken",
      "PortalDetails": "https://"+appdomain+"/EngageService.svc/OrganisationPortalSetting?orgId="+appId,
      "AppSettings": "https://"+appdomain+"/EngageService.svc/OrganisationConfigSetting?orgId="+appId,
      "PortalLogin": "",
      "PortalHome": "",
      "PortalLogout": ""
    };

  that.secureStoreInit();

  this.appConfigSettings();

  that.setPortalDefault().done(function(resp){
    if(resp.PortalEnabled){

        Portal.onPortalResume().done(function(){
        document.addEventListener('resume', Portal.onPortalResume.bind(this), false);
          that.userProfile = {};
          if(resp.LoggedInUrl && resp.SigninUrl && resp.LogoutUrl){
            that.defaultPINEnable =  resp.PortalEnabled;
            that.isPortalIntegrationEnable = resp.PortalEnabled;
            that.defaultExpireSession =  0.000694444 * resp.Expiry; //1 min 0.000694444; // 30 mnin in days;
            that.defaultShortLiveTokenExpire =  resp.Expiry-2;  
            that.API.PortalLogin = resp.LoggedInUrl; 
            that.API.PortalHome = resp.SigninUrl;
            that.API.PortalLogout = resp.LogoutUrl;

            if(localStorage.isPinEnable == "false" && localStorage.timeStampShortLiveToken){
               Portal.logoutPortal(function (resp) {
                
              });
            }
            
          } else {
             that.isPortalIntegrationEnable = false;
               that.defaultPINEnable = false;
          }
          
        });
    }
  }).fail(function(err){
    console.log(err);
        that.isPortalIntegrationEnable = false;
  });
}


portal.prototype.init = function () {
  //alert('init');
  var that = this;
    if (Portal.isPortalIntegrationEnable) {
        Portal.onPortalResume().done(function(){
          setTimeout(function(){
          Portal.validateToken().done(function () {
          
          });
          },1000)
        });
    } else if (myGUID) {
      Portal.logoutPortal(function (resp) {

      });
    }

  //All Event Handler  
  $("#lnkNormal").off();
  $("#lnkNormal").on("click", Portal.normalLogin.bind());  
  $(".pintxt").off();
  $(".pintxt").on("keyup", Portal.pinSetup.bind());
  $(".usersignin").off();
  $(".usersignin").on("click", Portal.authenticateUser.bind(that));
  $(".myportal").off();
  $(".myportal").on("click", Portal.validatePIN.bind(that));
}

portal.prototype.secureStoreInit = function(callback){
    var that = this;
    ss = ss || new cordova.plugins.SecureStorage(
    function () {
      if(!localStorage.isPinEnable){
        localStorage.isPinEnable = "true";
        that.defaultPINEnable = true;
      }

      SecureStore = {
        "setItem": function (keys, values) {
          ss.set(
            function (key) {
              console.log('Set ' + key);
                      },
            function (error) {

              console.log('Error ' + error);
            },
            keys, values);
        },
        "getItem": function (keys) {
          ss.get(
            function (value) {

              console.log('Success, got ' + value);
              return value;
            },
            function (error) {

              console.log('Error ' + error);
            },
            keys);

        },
        "removeItem": function (keys) {
          ss.remove(
            function (key) {

              console.log('Removed ' + key);
            },
            function (error) {
              i
              console.log('Error, ' + error);
            },
            keys);
        }
      }
     
      console.log('Success')
    // alert('secure initi')
    },
    function (error) {
      isScreenLockEnable = false;
      localStorage.isPinEnable = "false";
      that.defaultPINEnable = false;
      console.log('Error ' + error);
    },
    'my_portal');
}


portal.prototype.onPortalResume = function () {
  var deferred = $.Deferred();
  if (Portal.isPortalIntegrationEnable) {
   // localStorage.isScreenLockEnable = true;
    if (isScreenLockEnable) {
     
     /* if (!localStorage.timeStampShortLiveToken) {
        SecureStore.removeItem("GUID");
        SecureStore.removeItem("PIN");
      }*/

      ss.get(
        function (value) {
          myPIN = value;
        }, function () {
          myPIN = "";
        }, "PIN");

      ss.get(
        function (value) {
          myGUID = value;
        }, function () {
          myGUID = "";
        }, "GUID");

    }
    if (getCookie("portalSession") == "" && localStorage.isPinEnable == "true" && myGUID.length > 0) {
      isPortalAuthorize = false;
      myPortalPINAuthenticate = true;
      deferred.resolve();
    } else if (getCookie("portalSession") == "" && localStorage.isPinEnable == "false" && myGUID.length > 0 ) {
      Portal.logoutPortal(function (resp) {
        deferred.resolve();
      });
    } else {
       deferred.resolve();
    }
  } else{
    deferred.resolve();
  }
  return deferred.promise();
}

portal.prototype.setPortalDefault = function () {
  var that = this;
  var deferred = $.Deferred();
  setTimeout(function(){
  $.ajax({
    type: "GET",
    url: Portal.API.PortalDetails,
    data: "",
    success: function (resp) {
      deferred.resolve(resp);
    },
    error: function (err) {
      deferred.reject(err);
    }
  });
  },3000)
  return deferred.promise();
}


portal.prototype.appConfigSettings = function () {
  var that = this;
  $.ajax({
    type: "GET",
    url: that.API.AppSettings,
    data: "",
    success: function (resp) {
      that.isTranslationEnable = resp.TranslationEnabled;    
    },
    error: function (err) {
       that.isTranslationEnable = false;
    }
  });
}

portal.prototype.portalActive = function () {
  setCookie("portalSession", "Portal Active", Portal.defaultExpireSession);
}

/*  Description : When user tap on Sign Button this function get call to Login 
    Param : Callback function once this call successfully.
*/
portal.prototype.authenticateUser = function (callback) {
  var that = this;
  if (navigator.onLine) {
    myPIN = "";
    SecureStore.removeItem("PIN");
    var portalURLExec = window.open(that.API.PortalLogin, "_blank","location=no");
    portalURLExec.addEventListener('loadstart', function (event) {
      if (event.url.indexOf("token=") != -1) {
        var tokenId = event.url.split("=")[1].split("&")[0] || event.url.split("=")[2].split("&")[0];
        myTempToken = tokenId;
        Portal.portalActive();
        portalURLExec.close();
        if (localStorage.isPinEnable == "false") {
          that.portalUserSLToken("", myTempToken).done(function (res) {
            $(".usersignin").hide();
            $(".myportal").show();
            myGUID = res.result.shortLiveToken;
            SecureStore.setItem("shortLiveToken", res.result.shortLiveToken);
            localStorage.setItem("timeStampShortLiveToken", new Date().getMinutes());
            SecureStore.setItem("GUID", myGUID);
          }).fail(function (err) {
            alert(JSON.stringify(err));
          });
        } else {
          $(".usersignin").hide();
          $(".myportal").show();
          that.setPIN();
        }
      }
    });
  } else {
    alert("Please check internet connection");
  }
}

portal.prototype.portalHome = function (callback) {
  var that = this;
  if (navigator.onLine) {
    $.mobile.loading('show', { text: "Validating user..", textVisible: true });
    var timeStamp = new Date().getMinutes() - localStorage.timeStampShortLiveToken;
    if (timeStamp > Portal.defaultShortLiveTokenExpire) {
      SecureStore.removeItem("shortLiveToken");
    }

    if(!isScreenLockEnable){
      that.portalUserSLToken("", myTempToken).done(function (res) {
        window.open(Portal.API.PortalHome + res.result.shortLiveToken, "_blank","location=no");
      });
    } else {
    ss.get(
      function (value) {
        window.open(Portal.API.PortalHome + value, "_blank","location=no");
        $.mobile.loading('hide');
      }, function () {
        that.portalUserSLToken(myGUID, "").done(function (res) {
          $.mobile.loading('hide');
          if (res.status) {
            SecureStore.setItem("shortLiveToken", res.result.shortLiveToken);
            localStorage.setItem("timeStampShortLiveToken", new Date().getMinutes())
            window.open(Portal.API.PortalHome + res.result.shortLiveToken, "_blank","location=no");
          }
       }).fail(function (err) {
           $.mobile.loading('hide');
        });
      }, "shortLiveToken");
    }
  } else {
    alert("Please check internet connection.")
  }

}

portal.prototype.validateToken = function () {
  var that = this;
  var tokenId = myGUID;
  var deferred = $.Deferred();

  if ((tokenId == "" && that.isPortalIntegrationEnable == false) || tokenId == "") {
    $(".usersignin").show();
    $(".myportal").hide();
    deferred.resolve();
  } else if (getCookie("portalSession") == "" && localStorage.isPinEnable == "true") {
    isPortalAuthorize = false;
    myPortalPINAuthenticate = true;
    $(".usersignin").hide();
    $(".myportal").show();
    deferred.resolve();
  } else if (getCookie("portalSession") == "" && localStorage.isPinEnable == "false") {
    Portal.logoutPortal(function (resp) {
      myGUID = "";
      $.mobile.loading('hide');
      deferred.resolve();
    });
  } else {
    $(".usersignin").hide();
    $(".myportal").show();
    $.mobile.loading('hide');
    deferred.resolve();
  }
  return deferred.promise();
}

portal.prototype.logoutPortal = function (callback) {
  var that = this;
  myOldGUID = myGUID; // Maintend old guid with new guid;
  if (isScreenLockEnable) {
    SecureStore.removeItem("GUID");
    SecureStore.removeItem("PIN");
    SecureStore.removeItem("shortLiveToken")
  }
  myGUID = "";
  myPIN = "";
  localStorage.removeItem("timeStampShortLiveToken");
  isPortalAuthorize = false;
  $(".usersignin").show();
  $(".myportal").hide();
  var logoutWindow = window.open(that.API.PortalLogout, "_blank","location=no");
  logoutWindow.addEventListener("loadstop", function () {
    if (callback) {
      callback(true);
    }
    logoutWindow.close();
  });

   logoutWindow.addEventListener("loaderror", function () {
    if (callback) {
      callback(true);
    }
    logoutWindow.close();
  });

}

portal.prototype.getCitizenPortalProfile = function () {
  var that = this;
  var tokenId = myGUID;//localStorage.secureToken;
  var deferred = $.Deferred();
  if (navigator.onLine) {
    that.getUserProfile(myPIN, myGUID).done(function (resp) {
      var datas = JSON.parse(resp).citizenPortalProfileDetailsField;
      that.userProfile = datas;
      console.log(datas);
      deferred.resolve(datas);
    })
  } else {
    deferred.resolve();
    //alert("Please check internet connection");
  }
  return deferred.promise();
}

portal.prototype.closePin = function () {
  $(".pintxt").val("");
  $("#popupDialog").popup("close", {});
}

portal.prototype.setPIN = function () {
  var that = this;
  $(".pintxt").val("");
  if (localStorage.isPinEnable == "true") {
    $("#popupDialog").popup("open", {});
    $(".nd-title").text("Please create a Mobile PIN");
    $("#lnkNormal").show();
    setTimeout(function () {
      $(".pintxt").val("");
      $("#txtPin1").focus();
      $('#txtPin1').trigger('click');
    }, 1000)

  } else {
    $(".usersignin").hide();
    $(".myportal").show();
    isPortalAuthorize = true;
  }
}

portal.prototype.validatePIN = function () {
  var that = this;
  $(".pintxt").val("");
  if (getCookie("portalSession") == "" && localStorage.isPinEnable == "true") {
    isPortalAuthorize = false;
    myPortalPINAuthenticate = true;

  } else if (getCookie("portalSession") == "" && (localStorage.isPinEnable == "false") && myGUID) {
    that.logoutPortal(function (resp) {

    });
  }

  setTimeout(function () {

    if (localStorage.isPinEnable == "true") {
      //if (getEncryptedStorage("PIN")) {
      if (myPIN) {
        if (myPortalPINAuthenticate) {

          $("#popupDialog").popup("open", {});
          $(".nd-title").text("Please enter your Mobile Pin");

          setTimeout(function () {

            $("#txtPin1").focus();
            $('#txtPin1').trigger('click');          
          }, 1000)

        } else {
          setCookie("portalSession", "Portal Active", that.defaultExpireSession);
          //window.open(that.API.PortalHome + localStorage.secureToken);
          //window.open(that.API.PortalHome + mySecureToken);
          that.portalHome();
          console.log("Welcome to My Portal PIN");
        }
      } else {
        that.authenticateUser();
      }
    } else {
      //if(localStorage.secureToken){
      if (myGUID) {
        //that.validateToken().done(function () {
        myPortalPINAuthenticate = false;
        setCookie("portalSession", "Portal Active", that.defaultExpireSession);
        that.portalHome();
        //  });
      } else {
        that.authenticateUser();
      }
    }
  }, 1000)
}

portal.prototype.normalLogin = function(event){  
  Portal.logoutPortal(function (resp) {
      myPortalPINAuthenticate = false;
      localStorage.isPinEnable = "false";
      myPIN = "";
      SecureStore.removeItem("PIN");
      $("#popupDialog").popup("close", {});
      setCookie("portalSession", "Portal Active", Portal.defaultExpireSession);

      if(resp){
        $.mobile.loading('show', { text: "Login user..", textVisible: true });
        setTimeout(function(){
          $.mobile.loading('hide');
          Portal.authenticateUser();
        },5000)
      }
  });
}

portal.prototype.pinSetup = function(){
//debugger;
var pinvalue = $("#txtPin1").val()+$("#txtPin2").val()+$("#txtPin3").val()+$("#txtPin4").val();
var nexval = parseInt(event.currentTarget.id.substr(6,7))+1;
if($("#"+event.currentTarget.id.substr(0,6)+nexval)){
    $("#"+event.currentTarget.id.substr(0,6)+nexval).focus();
}
if(event.currentTarget.id=="txtPin4"){

	if(localStorage.isPinEnable == "true" && myPIN == ""){
		var hashPIN = CryptoJS.AES.encrypt(pinvalue.toString(), "PIN").toString();
		 Portal.portalUserAuthenticate(myTempToken,hashPIN,myOldGUID).done(function(resp){

			if(resp.status=="success"){
				myGUID = resp.result.guid;
				SecureStore.setItem("GUID",myGUID);
				SecureStore.setItem("PIN",hashPIN);
				myPIN = hashPIN;
				$(".usersignin").hide();
				$(".myportal").show();
				isPortalAuthorize = true;
				myPortalPINAuthenticate = false;
				$("#popupDialog").popup("close",{});
				setCookie("portalSession", "Portal Active", Portal.defaultExpireSession);
			 }
		  }).fail(function(err){
alert(JSON.stringify(err));
$("#popupDialog").popup("close",{});
		  });
	
	} else if(CryptoJS.AES.decrypt(myPIN, "PIN").toString(CryptoJS.enc.Utf8)==pinvalue){
		//validatePIN(CryptoJS.AES.encrypt(pinvalue.toString(), "PIN").toString(), myGUID).done(function (resp) {
		//if(resp.result){
			myPortalPINAuthenticate = false;			
			 $("#popupDialog").popup("close",{});
			Portal.portalActive();
			Portal.portalHome();
		
		//});
	} else {
	alert("Invalid Pin");
	isPortalAuthorize = false;
 $(".pintxt").val("");

setTimeout(function(){
$("#txtPin1").focus();
setTimeout(function(){
$("#txtPin1").trigger('click');
},1000);

},1000);
	}

}

}


/* All Portal APIs */
portal.prototype.portalUserAuthenticate = function (tempToken, hashPIN, oldGUID) {
  $.mobile.loading('show', { text: "Validating user..", textVisible: true });
  var deferred = $.Deferred();
  var Param = {
    "orgId": appId,
    "token": tempToken,
    "hashPin": hashPIN,
    "oldGuid": oldGUID
  }
  $.ajax({
    type: "POST",
    url: Portal.API.PortalUserAuthenticate,
    datatype: 'json',
    beforeSend: function (request) {
      request.setRequestHeader("deviceid", getEncryptedStorage('deviceid'));
    },
    data: JSON.stringify(Param),
    success: function (resp) {
      $.mobile.loading('hide');
      if (resp && resp.resultField) {
        var data = { status: "success", "result": { "guid": resp.tokenField } };
        deferred.resolve(data);
      } else {
        deferred.reject("");
      }
    },
    error: function (err) {
      $.mobile.loading('hide');
      deferred.reject(err);
    }
  });

  return deferred.promise();
}

portal.prototype.portalUserValidate = function(hashPIN, guid) {
  var deferred = $.Deferred();
  setTimeout(function () {
    var data = { "status": "success", "result": true }
    deferred.resolve(data);
  }, 1000)
  return deferred.promise();
}

portal.prototype.getUserProfile = function (hashPIN, guid) {
  
  $.mobile.loading('show', { text: "Fetching data..", textVisible: true });
  var that = this;
  var Param = {}

  if(localStorage.isPinEnable=="true"){
     Param = {
      "orgId": appId.toString(),
      "token": "",
      "hashPin": myPIN,
      "guid":myGUID,
      }
  } else {
    Param = {
      "orgId": appId.toString(),
      "token": myGUID,
      "hashPin": "",
      "guid": "",
    }
  }

  var deferred = $.Deferred();

   $.ajax({
    type: "POST",
    url: Portal.API.PortalUserProfile,
    datatype: 'json',
    data: JSON.stringify(Param),
    success: function (resp) {
      $.mobile.loading('hide');
      var data = JSON.stringify(resp);
      deferred.resolve(data);
    },
    error: function (err) {
      $.mobile.loading('hide');
      deferred.reject(err);
    }
  });
  
  /*setTimeout(function () {
    $.getJSON(cordova.file.applicationDirectory + "www/stub/CitizenPortalProfile.json", function (resp) {
      var data = JSON.stringify(resp);
      deferred.resolve(data);
    })
  }, 1000)*/


  return deferred.promise();
}

portal.prototype.portalUserSLToken = function (myguid, tempToken) {
  $.mobile.loading('show', { text: "Fetching data..", textVisible: true });
  var that = this;
  var Param = {
    "orgId": appId.toString(),
    "token": myguid ? "" : tempToken,
    "hashPin": myguid ? myPIN : "",
    "guid": myguid,
  }
  var deferred = $.Deferred();
  $.ajax({
    type: "POST",
    url: Portal.API.PortalUserSLToken,
    datatype: 'json',
    data: JSON.stringify(Param),
    success: function (resp) {
      $.mobile.loading('hide');
      if (resp && resp.resultField) {
        var data = { status: "success", "result": { "shortLiveToken": resp.tokenField } }
        deferred.resolve(data);
      } else {
        deferred.reject("");
      }
    },
    error: function (err) {
      $.mobile.loading('hide');
      deferred.reject(err);
    }
  });
  return deferred.promise();
}

