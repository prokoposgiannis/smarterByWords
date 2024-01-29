const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const firestore = admin.firestore();

exports.scheduledFunction = functions.pubsub
    .schedule("0 0 * * *")
    .timeZone("UTC")
    .onRun(async () => {
      try {
        const collectionName = "wordOfTheDay";
        const documentId = "Sdl6JoLY0ihvtgagMlhY";

        const currentWordRef = firestore
            .collection(collectionName)
            .doc(documentId);
        const currentWord = await currentWordRef.get();

        if (currentWord.exists) {
          const currentWordNum = currentWord.data().wordNum;

          const wordsCollectionRef = firestore.collection("words");
          const wordsCollectionSnapshot = await wordsCollectionRef.get();
          const numberOfDocuments = wordsCollectionSnapshot.size;

          const wordNumber =
          currentWordNum >= numberOfDocuments ? 0 : currentWordNum + 1;

          const nextWordQuerySnapshot = await firestore
              .collection("words")
              .where("wordNum", "==", wordNumber)
              .get();

          if (!nextWordQuerySnapshot.empty) {
            const nextWordData = nextWordQuerySnapshot.docs[0].data();

            const nextWord = {
              word: nextWordData.word,
              definition: nextWordData.definition,
              source: nextWordData.source,
              wordNum: nextWordData.wordNum,
            };

            await currentWordRef.update(nextWord);
          }
        }

        return null;
      } catch (error) {
        console.error("Error:", error);
        return null;
      }
    });
