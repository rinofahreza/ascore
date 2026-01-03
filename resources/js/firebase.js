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

export { app, messaging, getToken };
