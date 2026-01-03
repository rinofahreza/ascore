import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyCujs65yJCcCvg0pEF7PQzLjqpqi49unvY",
    authDomain: "ascorepwa.firebaseapp.com",
    projectId: "ascorepwa",
    storageBucket: "ascorepwa.firebasestorage.app",
    messagingSenderId: "790557368210",
    appId: "1:790557368210:web:08434eb6bd93009742eb4b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Messaging
let messaging = null;
try {
    messaging = getMessaging(app);
} catch (error) {
    console.error("Firebase Messaging not supported in this browser:", error);
}

const getFcmToken = async () => {
    if (!messaging) return null;
    try {
        // ZOMBIE KILLER: Unregister old 'firebase-messaging-sw.js' if found
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (let registration of registrations) {
                if (registration.active && registration.active.scriptURL.includes('firebase-messaging-sw.js')) {
                    console.log('Unregistering Zombie SW:', registration.active.scriptURL);
                    await registration.unregister();
                }
            }
        }

        const registration = await navigator.serviceWorker.register('/fcm-sw.js');
        return await getToken(messaging, {
            vapidKey: 'BMQTVMcqQn7J55MnRLb4bOi4pfX4iRv1-WXQ1ULv1qU31IV1OgE60iL13DfqC4NC14qfPe3it-HWe_wXS4RBP7g',
            serviceWorkerRegistration: registration
        });
    } catch (error) {
        console.error("An error occurred while retrieving token.", error);
        return null;
    }
};

export { app, messaging, getFcmToken };
