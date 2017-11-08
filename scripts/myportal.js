function myPortal() {

}
/* Properties */
myPortal.prototype.isPortalIntegrationEnable = true;
myPortal.prototype.isTranslationEnable = true;
myPortal.prototype.defaultPINEnable = true;
myPortal.prototype.defaultExpireSession = 0.0208333; //1 min
myPortal.prototype.API = {
    "CitizenPortalSecureToken": "https://esoltest.capita-software.co.uk/publicaccessbeta/ws/citizenportalsecuretoken",
    "CitizenPortalLogInStatus": "https://esoltest.capita-software.co.uk/publicaccessbeta/ws/citizenportalloginstatus",
    "CitizenPortalProfile": "https://esoltest.capita-software.co.uk/publicaccessbeta/ws/citizenportalprofile",
    "CitizenPortalLogAuditHistoryEvent": "https://esoltest.capita-software.co.uk/publicaccessbeta/ws/citizenportallogaudithistoryevent",
    "PortalLogin": "https://esoltest.capita-software.co.uk/publicaccessbeta/selfservice/citizenportal/thirdpartylogin.htm?notnow=true&redirect_url=file:///android_asset/www/portal-auth-complete.html",
    "PortalHome": "https://esoltest.capita-software.co.uk/publicaccessbeta/selfservice/citizenportal/integratethirdpartyaccess.htm?token=",
    "PortalLogout": "https://esoltest.capita-software.co.uk/publicaccessbeta/selfservice/citizenportal/logout.htm"
};

myPortal.prototype.init = function () {
    var that = this;
    if (that.isPortalIntegrationEnable) {
        that.checkScreenLockEnable();
        that.removeEventListners();
        that.addEventListners();
        that.validateGUID();
    }
}

myPortal.prototype.addEventListners = function () {
    var that = this;
    $(".usersignin").on("click", that.logInPortal.bind(that));
    $(".myportal").on("click", that.myServiceHome.bind(that));
    $(".pintxt").on("keyup", that.pinSetup.bind(that));
    $(".pintxt").on("blur", that.pinValidatePassword.bind(that));
    $(".pintxt").on("focus", that.pinValidateNumber.bind(that));
    $(".pintxt").on("click", that.pinValidateNumber.bind(that));
    $(".normalLogin").on("click", that.normalLogin.bind(that));
}

myPortal.prototype.removeEventListners = function () {
    $(".usersignin").unbind();
    $(".myportal").unbind();
    $(".pintxt").unbind();
    $(".normalLogin").unbind();
}


/* Events */
myPortal.prototype.logInPortal = function (callback) {
    var that = this;
    if (navigator.onLine) {

        var portalURLExec = window.open(that.API.PortalLogin, "_blank");

        portalURLExec.addEventListener('loadstart', function (event) {
            if (event.url.indexOf("token=") != -1) {
                var tempToken = event.url.split("=")[1].split("&")[0];
                portalURLExec.close();
                if (localStorage.isPinEnable) {
                    that.openPinDialog();
                } else {
                    that.getSecureGuid(tempToken);
                }
                if (callback) {
                    callback(true);
                }
            }
        });
    } else {
        alert("Please check internet connection");
    }
}

myPortal.prototype.logoutPortal = function (callback) {
    var that = this;
    //localStorage.removeItem("secureToken");

    if (isScreenLockEnable) {
        SecureStore.removeItem("secureTokens");
        myGUID = "";
        myPIN = "";
    }

    isPortalAuthorize = false;
    that.showLoginIcon();
    var logoutWindow = window.open(that.API.PortalLogout);
    logoutWindow.addEventListener("loadstop", function () {

        if (callback) {
            callback(true);
        }
        logoutWindow.close();

    });

}

myPortal.prototype.myServiceHome = function (guid) {
    var that = this;
   callAPI("GetPortalShortLivedToken","POST",myGUID).done(function(resp){
   
    var d = JSON.parse(resp);
    if(d && d.data){
     window.open(Portal.API.PortalHome + d.data);
    } 
  }).fail(function(rr){
    
  });
}

myPortal.prototype.normalLogin = function (event) {
    var that = this;

}

myPortal.prototype.pinValidatePassword = function (event) {
    var that = this;
    $(event.currenTarget).attr("type", "password");
}

myPortal.prototype.pinValidateNumber = function (event) {
    var that = this;
    $(event.currenTarget).attr("type", "number");
}



/* Methods */
myPortal.prototype.openPinDialog = function () {
    var that = this;
    $(".pintxt").val("");
    if (localStorage.isPinEnable) {
        $("#popupDialog").popup("open", {});
        $(".nd-title").text("Please create a Mobile PIN");
        $("#lnkNormal").show();

        setTimeout(function () {
            $(".pintxt").val("");
            $("#txtPin1").focus();
            $('#txtPin1').trigger('click');
            $("#lnkNormal").unbind();
            $("#lnkNormal").click(function () {
                Portal.validateGUID().done(function () {
                    localStorage.isPinEnable = false;
                    Portal.closePinDialog();
                    setCookie("portalSession", "Portal Active", Portal.defaultExpireSession);
                    Portal.myServiceHome();
                });
            });
        }, 1000)

    } else {
        $(".usersignin").hide();
        $(".myportal").show();
    }
}

myPortal.prototype.closePinDialog = function () {
    var that = this;
    $(".pintxt").val("");
    $("#popupDialog").popup("close", {});
}

myPortal.prototype.validatePIN = function () {
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

                        $("#lnkNormal").unbind();
                        $("#lnkNormal").click(function () {

                            Portal.validateToken().done(function () {

                                myPortalPINAuthenticate = false;
                                localStorage.isPinEnable = "false";
                                $("#popupDialog").popup("close", {});
                                setCookie("portalSession", "Portal Active", Portal.defaultExpireSession);
                                //window.open(Portal.API.PortalHome + localStorage.secureToken);
                                window.open(Portal.API.PortalHome + mySecureToken);
                            });
                        });
                    }, 1000)

                } else {
                    setCookie("portalSession", "Portal Active", that.defaultExpireSession);
                    //window.open(that.API.PortalHome + localStorage.secureToken);
                    window.open(that.API.PortalHome + mySecureToken);
                   // console.log("Welcome to My Portal PIN");
                }
            } else {
                that.authenticateUser();
                //that.setPIN();
            }
        } else {
            //if(localStorage.secureToken){
            if (mySecureToken) {
                that.validateToken().done(function () {
                    myPortalPINAuthenticate = false;
                    setCookie("portalSession", "Portal Active", that.defaultExpireSession);
                    //window.open(that.API.PortalHome + localStorage.secureToken);
                    window.open(that.API.PortalHome + mySecureToken);
                });
            } else {
                that.authenticateUser();
            }
        }

    }, 1000)

}

myPortal.prototype.validateGUID = function () {
    var that = this;
    var deferred = $.Deferred();
    localStorage.isPinEnable = that.defaultPINEnable
    if (getCookie("portalSession") != "" && that.defaultPINEnable) {
        that.showMyServicesIcon();
        deferred.resolve();
    } else if (navigator.onLine) {
        $.mobile.loading('show', { text: "Validating user..", textVisible: true });
        $.getJSON(cordova.file.applicationDirectory + "www/stub/validateGUID.json", function (data) {
            var result = data.status;
            if (result) {
                that.showMyServicesIcon();
            } else {
                that.showLoginIcon();
            }
            $.mobile.loading('hide');
            deferred.resolve();
        });
    } else {
        alert("Please check internet connection");
        deferred.resolve();
    }

    return deferred.promise();
}

myPortal.prototype.getCitizenProfile = function (guid) {
    var that = this;

}

myPortal.prototype.showLoginIcon = function () {
    var that = this;
    $(".usersignin").show();
    $(".myportal").hide();
}

myPortal.prototype.showMyServicesIcon = function () {
    var that = this;
    $(".usersignin").hide();
    $(".myportal").show();
}

myPortal.prototype.pinSetup = function () {

    var pinvalue = $("#txtPin1").val() + $("#txtPin2").val() + $("#txtPin3").val() + $("#txtPin4").val();
    var nexval = parseInt(event.currentTarget.id.substr(6, 7)) + 1;
    if ($("#" + event.currentTarget.id.substr(0, 6) + nexval)) {
        $("#" + event.currentTarget.id.substr(0, 6) + nexval).focus();
    }
    if (event.currentTarget.id == "txtPin4") {
        //debugger;
        if (localStorage.isPinEnable == "true" && myPIN == false) {
            //setEncryptedStorage("PIN", pinvalue);
            var hashedPIN = CryptoJS.AES.encrypt(pinvalue.toString(), "hashedPIN");
            var hashedPINValue = hashedPIN.toString();
            that.getSecureGuid(Portal.tempToken, hashedPINValue).done(function (data) {

                SecureStore.setItem("GUID", data);

                $(".usersignin").hide();
                $(".myportal").show();
                isPortalAuthorize = true;
                myPortalPINAuthenticate = false;
                $("#popupDialog").popup("close", {});
                setCookie("portalSession", "Portal Active", Portal.defaultExpireSession);
            });


            // window.open(Portal.API.PortalHome + localStorage.secureToken);

        } else if (getEncryptedStorage("PIN") == pinvalue) {
            Portal.validateToken().done(function () {
                myPortalPINAuthenticate = false;
                $("#popupDialog").popup("close", {});
                setCookie("portalSession", "Portal Active", Portal.defaultExpireSession);
                $("#popupDialog").popup("close", {});
                window.open(Portal.API.PortalHome + localStorage.secureToken);
            });
        } else {
            alert("Invalid Pin");
            isPortalAuthorize = false;
            $(".pintxt").val("");
            $("#txtPin1").focus();
            $('#txtPin1').trigger('click');
        }
    }
}

myPortal.prototype.checkScreenLockEnable = function () {
    if (isScreenLockEnable && localStorage.isPinEnable == undefined) {
        localStorage.isPinEnable = true;
        this.defaultPINEnable = true;
    } else {
        localStorage.isPinEnable = false;
        this.defaultPINEnable = false;
    }
}

var Portal = new myPortal();


