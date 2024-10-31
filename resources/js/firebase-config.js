// firebase-config.js
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: "AIzaSyD9xbEpS5pPQ6X3PggFoAP1c9gPoO4wN28",
    authDomain: "dbedc-erp.firebaseapp.com",
    projectId: "dbedc-erp",
    storageBucket: "dbedc-erp.appspot.com",
    messagingSenderId: "551140686722",
    appId: "1:551140686722:web:d99b8829aad35e60232d9b",
    measurementId: "G-GRR20JHLW3"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
    try {
        const vapidKey = import.meta.env.VITE_VAPID_KEY;
        const token = await getToken(messaging, { vapidKey });
        if (token) {
            return token;
        } else {
            console.error('No registration token available');
        }
    } catch (err) {
        console.error('An error occurred while retrieving token:', err);
    }
};

export const onMessageListener = () => new Promise((resolve) => {
    onMessage(messaging, (payload) => {
        resolve(payload);
    });
});
