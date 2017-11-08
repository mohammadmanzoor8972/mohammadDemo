(function(){
var pushConfig = { 
    setupPush: function() {
    console.log('calling push init');
    var push = PushNotification.init({
        "android": {
            "senderID": "921820197008"
        },
        "browser": {},
        "ios": {
            "sound": true,
            "vibration": true,
            "badge": true
        },
        "windows": {}
    });

    push.on('registration', function(data) {
        console.log('registration event: ' + data.registrationId);

        
    });

    push.on('error', function(e) {
        console.log("push error = " + e.message);
    });

    push.on('notification', function(data) {
        console.log('notification event');
        navigator.notification.alert(
            data.message,         // message
            null,                 // callback
            data.title,           // title
            'Ok'                  // buttonName
        );
   });
}}
})();