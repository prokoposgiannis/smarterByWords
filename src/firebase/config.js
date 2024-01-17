import { initializeApp } from 'firebase/app';

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
} from 'firebase/firestore/lite';

const firebaseConfig = {
  apiKey: 'AIzaSyDqbBy3umQpfu89NJEo5dl22yGlGUCt76g',
  authDomain: 'smarter-by-words.firebaseapp.com',
  projectId: 'smarter-by-words',
  storageBucket: 'smarter-by-words.appspot.com',
  messagingSenderId: '501095820892',
  appId: '1:501095820892:web:f6c9d651dbfbd6426e0099',
  measurementId: 'G-KZCHD7R28T',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const addCardToFirestore = (
  category,
  question,
  answer,
  isLoved = false,
  key,
  cardNumber
) => {
  const docRef = collection(db, 'cards');

  setDoc(doc(docRef), {
    category,
    question,
    answer,
    isLoved,
    key,
    cardNumber,
  });
};

// const getWordOfTheDay = () => {
//   const wordQuery = query(
//     collection(db, 'words'),
//     where('wordNumber', '==', 1)
//   );

//   getDocs(wordQuery)
//     .then((snapshot) => {
//       snapshot.forEach((doc) => {
//         let word = doc.data();
//         return word;
//       });
//     })
//     .catch((error) => {
//       console.log('Error getting articles:\n', error);
//     });
// };

const setWordIndex = async () => {
  try {
    const wordQuery = query(collection(db, 'wordOfTheDay'));

    const snapshot = await getDocs(wordQuery);

    if (snapshot.empty) {
      console.log('No matching documents.');
      return null;
    }

    const currentDate = new Date();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();

    const dateForComparison = `${year}${month < 10 ? `0${month}` : `${month}`}${
      day < 10 ? `0${day}` : `${day}`
    }`;

    const date = snapshot.docs[0].data();
    console.log(date, dateForComparison);
    if (dateForComparison > date.date) {
      const docRef = doc(db, 'wordOfTheDay', 'zQyKYyFP580S9nTp1rmO');

      updateDoc(docRef, {
        date: dateForComparison,
        wordNum: date.wordNum + 1,
      })
        .then(() => {
          console.log('Love state has been updated successfully.');
          return date.wordNum + 1;
        })
        .catch((error) => {
          console.log(error);
        });
    }
    console.log(date.wordNum);
    return date.wordNum;
  } catch (error) {
    console.error('Error getting word data:', error);
    throw error;
  }
};

const getWordOfTheDay = async () => {
  try {
    const wrdNmb = await setWordIndex();
    const wordQuery = query(
      collection(db, 'words'),
      where('wordNumber', '==', 0)
    );

    const snapshot = await getDocs(wordQuery);

    if (snapshot.empty) {
      console.log('No matching documents.');
      return null;
    }

    const word = snapshot.docs[0].data();
    return word;
  } catch (error) {
    console.error('Error getting word data:', error);
    throw error;
  }
};

const deleteCardToFirestore = (id) => {
  const docRef = doc(db, 'cards', id);

  deleteDoc(docRef)
    .then(() => {
      console.log('Document has been deleted successfully.');
    })
    .catch((error) => {
      console.log(error);
    });
};

const loveCardToFirestore = (id, newBooleanValue) => {
  const docRef = doc(db, 'cards', id);

  updateDoc(docRef, {
    isLoved: newBooleanValue,
  })
    .then(() => {
      console.log('Love state has been updated successfully.');
    })
    .catch((error) => {
      console.log(error);
    });
};

export {
  db,
  addCardToFirestore,
  collection,
  getDoc,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
  deleteCardToFirestore,
  loveCardToFirestore,
  query,
  where,
  getWordOfTheDay,
  setWordIndex,
};
