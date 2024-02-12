const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { getStorage } = require("firebase-admin/storage");
const logger = require("firebase-functions/logger");
const imageCreation = require("./createImage");
const imageUpload = require("./postToInstagram");
require("dotenv").config();

admin.initializeApp();
const firestore = admin.firestore();

/* 
  Firebase scheduled function that runs once a day, at midnight, including the below logics:
  1) Checks if the index of the current word is the database's last one. If so, it resets the 
     ndex to 0 in order for the list to start over. Otherwise, it returns the index of the
     next word. Finally, when the index is updated, it returns the current word's data.
  2) Downloads a background image from Firebase Storage to create the final image.
  3) Creates the final image using the node-canvas module.
  4) Uploads the final image to Firestore Storage.
  4) Using the the final image's url on Firebase Storage, it uploads it to Instagram.
*/
exports.scheduledFunction = functions.pubsub
  .schedule("0 0 * * *")
  .timeZone("UTC")
  .onRun(async () => {
    // constants (will be moved to another file)
    const collectionName = "wordOfTheDay";
    const documentId = "Sdl6JoLY0ihvtgagMlhY";
    const currentWordRef = firestore.collection(collectionName).doc(documentId);

    const fileBucket = "gs://smarter-by-words.appspot.com";
    const filePath = "bg.png";

    const username = process.env.IG_USERNAME;
    const password = process.env.IG_PASSWORD;
    const finalFilePath =
      "https://firebasestorage.googleapis.com/v0/b/smarter-by-words.appspot.com/o/finalImage.jpg?alt=media&token=152f0698-0bfb-42d8-8c37-be97847addfb";

    // Basic try block including all 4 steps:
    try {
      const currentWord = await currentWordRef.get();

      //Get and Set the current word's data
      if (currentWord.exists) {
        const currentWordNum = currentWord.data().wordNum;

        const wordsCollectionRef = firestore.collection("words");
        const wordsCollectionSnapshot = await wordsCollectionRef.get();
        const numberOfDocuments = wordsCollectionSnapshot.size;

        const wordNumber =
          currentWordNum >= numberOfDocuments ? 1 : currentWordNum + 1;

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

      // Download the background image into memory from Firebase Storage.
      const bucket = getStorage().bucket(fileBucket);
      const downloadResponse = await bucket.file(filePath).download();
      const imageBuffer = downloadResponse[0];
      logger.log("Background image downloaded.");

      try {
        /*
        Getting the current word's data to pass them as arguments into node-camvas. It is
        for the second time, though, therefore it should be done once for both operations.
        It will be fixed.
        */
        const collectionName = "wordOfTheDay";
        const documentId = "Sdl6JoLY0ihvtgagMlhY";

        const currentWordRef = firestore
          .collection(collectionName)
          .doc(documentId);
        const currentWord = await currentWordRef.get();

        if (currentWord.exists) {
          const currentWordDT = currentWord.data();

          // Create the final image with node-canvas.
          const finalImage = await imageCreation.createImage(
            imageBuffer,
            currentWordDT.word,
            currentWordDT.definition
          );
          logger.log("Image created server-side");

          // Upload the final image to Firestore Storage.
          const metadata = { contentType: "image/jpg" };
          await bucket.file("finalImage.jpg").save(finalImage, {
            metadata: metadata,
          });
          logger.log("Final Image uploaded to Firestore Storage.");

          // Upload the final image to Instagram.
          await imageUpload.postToInstagram(username, password, finalFilePath);
          logger.log("Image uploaded to instagram.");
        }
      } catch (error) {
        logger.log("Error on image creation and upload:", error);
      }
    } catch (error) {
      console.error("Error on process:", error);
      return null;
    }
  });
