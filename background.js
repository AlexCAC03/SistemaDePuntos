// Configuración de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyD-CF8ef7oYd6ly1mKVYO-sHSgdjX3JTzg",
    authDomain: "sistema-de-puntos-0333.firebaseapp.com",
    projectId: "sistema-de-puntos-0333",
    storageBucket: "sistema-de-puntos-0333.appspot.com",
    messagingSenderId: "443691472552",
    appId: "1:443691472552:web:dc034847af677d5440d49d",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);
let user = null;

let watchTime = 0;
let points = 0;
let intervalId = null;
const pointsInterval = 60000 * 10; // 10 minutos

function checkIfLive(tab) {
  if (tab.url && tab.url.includes("youtube.com/watch") && tab.url.includes("live")) {
    return true;
  }
  return false;
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (checkIfLive(tab) && changeInfo.status === 'complete') {
    if (!intervalId) {
      startTimer();
    }
  } else {
    stopTimer();
  }
});

function startTimer() {
  intervalId = setInterval(() => {
    watchTime += 1;
    if (watchTime % 10 === 0) {
      points += 10; 
      savePoints();
    }
  }, pointsInterval); 
}

function stopTimer() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

// Autenticación y manejo de puntos con Firebase
async function savePoints() {
  if (user) {
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, { points }, { merge: true });
  }
}

// Verifica si el usuario está autenticado
onAuthStateChanged(auth, (loggedUser) => {
  if (loggedUser) {
    user = loggedUser;
    loadPoints();
  } else {
    user = null;
  }
});

// Cargar los puntos del usuario desde Firebase
async function loadPoints() {
  if (user) {
    const userDocRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      points = docSnap.data().points || 0;
    } else {
      points = 0;
    }
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getPoints') {
    sendResponse({ points });
  } else if (message.type === 'signIn') {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).then((result) => {
      user = result.user;
      loadPoints();
    }).catch((error) => {
      console.error("Error en la autenticación:", error);
    });
  }
});
