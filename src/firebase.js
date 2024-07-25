import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyD4wtnn5fTVPt2iHi28g8843fQxxfnYsIc",
  authDomain: "hipicogijon-2f62a.firebaseapp.com",
  projectId: "hipicogijon-2f62a",
  storageBucket: "hipicogijon-2f62a.appspot.com",
  messagingSenderId: "365800647726",
  appId: "1:365800647726:web:c5374995470cd3dc8443bf"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };