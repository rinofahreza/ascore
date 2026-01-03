importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyCujs65yJCcCvg0pEF7PQzLjqpqi49unvY",
    authDomain: "ascorepwa.firebaseapp.com",
    projectId: "ascorepwa",
    storageBucket: "ascorepwa.firebasestorage.app",
    messagingSenderId: "790557368210",
    appId: "1:790557368210:web:08434eb6bd93009742eb4b"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // If payload contains a notification property, the browser/SDK automatically shows a notification.
    // We only need to manually show notification if we are sending "Data Messages" (without 'notification' key).

    // Check if it's a data-only message before showing notification manually
    // if (payload.data && !payload.notification) {
    //     const notificationTitle = payload.data.title || 'New Notification';
    //     const notificationOptions = {
    //         body: payload.data.body,
    //         icon: '/logo.png'
    //     };
    //     self.registration.showNotification(notificationTitle, notificationOptions);
    // }
});
