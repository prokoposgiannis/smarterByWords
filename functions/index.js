const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const firestore = admin.firestore();

exports.scheduledFunction = functions.pubsub
  .schedule("0 0 * * *")
  .timeZone("UTC")
  .onRun(async (context) => {
    try {
      const collectionName = "wordOfTheDay";
      const documentId = "Sdl6JoLY0ihvtgagMlhY";

      const currentWordRef = firestore
        .collection(collectionName)
        .doc(documentId);
      const currentWord = await currentWordRef.get();

      if (currentWord.exists) {
        const currentWordNum = currentWord.data().wordNum;

        const nextWordQuerySnapshot = await firestore
          .collection("words")
          .where("wordNum", "==", currentWordNum + 1)
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
