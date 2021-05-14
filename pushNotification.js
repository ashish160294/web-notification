// fetch config
// var configFile = document.createElement('script');
// configFile.src = "http://127.0.0.1:8080/pushNotificationConfig.js";
// document.getElementsByTagName("head")[0].appendChild(configFile);

var config = {
    firebaseConfig: {
    // fetch COnfig from firebase
    },
    registerToken: "url"   
}
// firebase app object
var app = document.createElement('script');
app.src = "https://www.gstatic.com/firebasejs/7.16.0/firebase-app.js";
document.getElementsByTagName("head")[0].appendChild(app);

// firebase message object
var message = document.createElement('script');
message.src = "https://www.gstatic.com/firebasejs/7.16.0/firebase-messaging.js";
document.getElementsByTagName("head")[0].appendChild(message);


var link = document.createElement('link');  
        link.rel = 'stylesheet';  
        link.type = 'text/css'; 
        link.href = './style.css';  
  
        // Get HTML head element to append  
        // link element to it  
        document.getElementsByTagName('head')[0].appendChild(link);
// function to set Cookie
document.setCookie = (cname, cvalue, expiryYear) => {
    var d = new Date();
    d.setFullYear(expiryYear ? expiryYear : 2088);
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires+';';
}

// function to getCookie
document.getCookie = (cname) => {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i <ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0) == ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
          }
        }
        return null;
}

document.uuidGenerator = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    })
}
(function(document){
    document.subscribeWebPushNotification = (productId, dataObj ={}, env) => {
        var subs = document.createElement('div');
        subs.setAttribute("class", "notificationBar");

        subs.setAttribute("id", "notifier");
        var subsText = document.createElement('span');
        subsText.setAttribute("class", "notifier");
        subsText.innerText = "text";
        var acceptButton = document.createElement('button');
        acceptButton.setAttribute("class", "acceptButton")
        acceptButton.innerText = "Yes, Subscribe";
        acceptButton.addEventListener("click", () => {
            document.registerWebPushToken(productId, dataObj);
        })
        var rejectButton = document.createElement('button');
        rejectButton.innerText = "No Thanks";
        rejectButton.setAttribute("class", "rejectButton")
        rejectButton.addEventListener("click", () => {
            document.clearNotifier();
        })
        subs.appendChild(subsText);
        subs.appendChild(acceptButton);
        subs.appendChild(rejectButton);
        document.getElementsByTagName("body")[0].appendChild(subs);
    }
    document.clearNotifier = () => {
        document.getElementById("notifier").remove();
    }
    document.registerWebPushToken = function(productId, dataObj={}) {
        // check cookie availablity
        let paisaWebPushClientId = document.getCookie('paisaWebPushClientId');
        if (paisaWebPushClientId == null) {
            paisaWebPushClientId = document.uuidGenerator();
            document.setCookie('paisaWebPushClientId', paisaWebPushClientId, null);
        }
        document.clearNotifier();
        new Promise((resolve, reject) => {
            try {
            navigator.serviceWorker.getRegistration('./sw.js').then(function(registration) {
            if(registration){ 
                return resolve(registration);
            } else {
                navigator.serviceWorker.register('./sw.js',{
                    scope: '/'
                  }).then((resp) => {
                    return resolve(resp);
                }).catch((err) => {
                    console.log('unable to register')
                    console.log(err);
                })
            }
            })}  catch(err) {
                console.log(err);
            }   
        }).then((sw) => {
        // Initialize Firebase
        // TODO: Replace with your project's customized code snippet
        var firebaseConfig = (config && config.firebaseConfig) ? config.firebaseConfig : null;
    // Initialize Firebase
        firebase.initializeApp(firebaseConfig);

        const messaging = firebase.messaging();
        messaging.useServiceWorker(sw);
        messaging
            .requestPermission()
            .then(() => {
                // get the token in the form of promise
                return messaging.getToken()
            })
            .then((token) => {
                // TokenElem.innerHTML = "token is : " + token
                fetch(config.registerToken, {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "token" : token,
                        "productId" : productId,
                        "paisaWebPushClientId": paisaWebPushClientId,
                        "customerId": dataObj && dataObj.customerId ? dataObj.customerId : null,
                        "visitorId": dataObj && dataObj.visitorId ? dataObj.visitorId : null,
                        "visitId": dataObj && dataObj.visitId ? dataObj.visitId : null,
                    })
                }).then(async (response) => {
                    let resp = await response.json()
                    return resp
                }).catch((err) => {
                    console.log(err);
                })
            }).catch(function (err) {  
                console.log("Unable to get permission to notify.", err);
                });
            }).catch((err) => {
                console.log(err);
            });
        }
    
    }
)(document)