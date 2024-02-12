import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./creds";

import {
  getFirestore,
  collection,
  getDoc,
  deleteDoc,
  getDocs,
  doc,
  setDoc,
  query,
  updateDoc,
  where,
} from "firebase/firestore/lite";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const getWordOfTheDay = async () => {
  try {
    const wordRef = doc(db, "wordOfTheDay", "Sdl6JoLY0ihvtgagMlhY");
    const snapshot = await getDoc(wordRef);

    if (snapshot.empty) {
      console.log("Fetching the word of the day returned empty.");
      return null;
    }

    const wordData = snapshot.data();
    console.log({ ...wordData });
    return wordData;
  } catch (error) {
    console.error("Error getting word data:", error);
    throw error;
  }
};

export {
  db,
  collection,
  getDoc,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  getWordOfTheDay,
};
