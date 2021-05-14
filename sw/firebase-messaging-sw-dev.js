importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-messaging.js');
var config = {
  firebaseConfig: {
  <firebaseConfig>
  },
  swFilePath: "http://127.0.0.1:8080/sw/firebase-messaging-sw-dev.js",
  registerToken: "https://staging-api-internal.paisabazaar.com/MSP/api/v1/webPush/registerToken"   
}

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp(config.firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();
self.addEventListener('notificationclick', function(event) {
    //add api to log event click
    const payloadData = {
      // Version Number
      v: 1,
      // Client ID
      cid: 1,
      // Tracking ID
      tid: "UA-136507308-8",
      // Hit Type
      t: "",
      // Event Category
      ec: "webpush",
      // Event Action
      ea: "Notification Clicked",
      // Event Label
      el: 'serviceworker',
      dp: "Notification Clicked",
      t:"event"
    };

    // Format hit data into URI
    const payloadString = Object.keys(payloadData)
    .filter(analyticsKey => {
      return payloadData[analyticsKey];
    })
    .map(analyticsKey => {
      return analyticsKey + '=' + encodeURIComponent(payloadData[analyticsKey]);
    })
    .join('&');

    // Post to Google Analytics endpoint
    fetch('https://www.google-analytics.com/collect', {
      method: 'post',
      headers: {
        'Content-Type': 'text/plain'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payloadString
    })
  .then(response => {
    console.log(payloadString);
    console.log(response);
    if (!response.ok) {
      console.log(response.text());
    } else {
      console.log("eventCategory" + '/' + "eventAction" +
        ' hit sent, check the Analytics dashboard');
    }
  })
  .catch(function(err) {
    console.warn('Unable to send the analytics event', err);
  });
    event.waitUntil(self.clients.openWindow(event.notification.data.clickAction));
});


messaging.setBackgroundMessageHandler((payload) =>  {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: payload.data.logo,
    clickAction: payload.data.clickAction,
    data: payload.data
  };
  const payloadData = {
    // Version Number
    v: 1,
    // Client ID
    cid: 1,
    // Tracking ID
    tid: "UA-136507308-8",
    // Hit Type
    t: "",
    // Event Category
    ec: "webpush",
    // Event Action
    ea: "Notification Displayed",
    // Event Label
    el: 'serviceworker',
    dp: "Notification Displayed",
    t:"event"
  };

  // Format hit data into URI
  const payloadString = Object.keys(payloadData)
  .filter(analyticsKey => {
    return payloadData[analyticsKey];
  })
  .map(analyticsKey => {
    return analyticsKey + '=' + encodeURIComponent(payloadData[analyticsKey]);
  })
  .join('&');

  // Post to Google Analytics endpoint
  fetch('https://www.google-analytics.com/collect', {
    method: 'post',
    headers: {
      'Content-Type': 'text/plain'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: payloadString
    }).then(response => {
    console.log(payloadString);
    console.log(response);
    if (!response.ok) {
      console.log(response.text());
    } else {
      console.log("eventCategory" + '/' + "eventAction" +
        'hit sent, check the Analytics dashboard');
    }
  }).catch(function(err) {
    console.warn('Unable to send the analytics event', err);
  });
  return self.registration.showNotification(notificationTitle,
      notificationOptions);
});