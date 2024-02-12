const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {getStorage} = require("firebase-admin/storage");
const logger = require("firebase-functions/logger");
const imageCreation = require("./createImage");
const imageUpload = require("./postToInstagram");
require("dotenv").config();
// const path = require("path");

admin.initializeApp();
const firestore = admin.firestore();

exports.scheduledFunction = functions.pubsub
    .schedule("0 0 * * *")
    .timeZone("UTC")
    .onRun(async () => {
      try {
      // const collectionName = "wordOfTheDay";
      // const documentId = "Sdl6JoLY0ihvtgagMlhY";

        // const currentWordRef = firestore
        //   .collection(collectionName)
        //   .doc(documentId);
        // const currentWord = await currentWordRef.get();

        // if (currentWord.exists) {
        //   const currentWordNum = currentWord.data().wordNum;

        //   const wordsCollectionRef = firestore.collection("words");
        //   const wordsCollectionSnapshot = await wordsCollectionRef.get();
        //   const numberOfDocuments = wordsCollectionSnapshot.size;

        //   const wordNumber =
        //     currentWordNum >= numberOfDocuments ? 0 : currentWordNum + 1;

        //   const nextWordQuerySnapshot = await firestore
        //     .collection("words")
        //     .where("wordNum", "==", wordNumber)
        //     .get();

        //   if (!nextWordQuerySnapshot.empty) {
        //     const nextWordData = nextWordQuerySnapshot.docs[0].data();

        //     const nextWord = {
        //       word: nextWordData.word,
        //       definition: nextWordData.definition,
        //       source: nextWordData.source,
        //       wordNum: nextWordData.wordNum,
        //     };

        //     await currentWordRef.update(nextWord);
        //   }
        // }

        const fileBucket = "gs://smarter-by-words.appspot.com";
        const filePath = "bg.png";
        const contentType = "image/png";

        if (!contentType.startsWith("image/")) {
          return logger.log("This is not an image.");
        }

        // Download file into memory from bucket.
        const bucket = getStorage().bucket(fileBucket);
        const downloadResponse = await bucket.file(filePath).download();
        const imageBuffer = downloadResponse[0];
        logger.log("Image downloaded!");

        try {
        // --------------------------------------------------------------------------
          const collectionName = "wordOfTheDay";
          const documentId = "Sdl6JoLY0ihvtgagMlhY";

          const currentWordRef = firestore
              .collection(collectionName)
              .doc(documentId);
          const currentWord = await currentWordRef.get();

          if (currentWord.exists) {
            const currentWordDT = currentWord.data();

            const finalImage = await imageCreation.createImage(
                imageBuffer,
                currentWordDT.word,
                currentWordDT.definition,
            );
            logger.log("Image created server-side");
            const metadata = {contentType: "image/jpg"};
            await bucket.file("finalImage.jpg").save(finalImage, {
              metadata: metadata,
            });
            logger.log("Image uploaded to storage");
            // } catch (error) {
            //   logger.log("Error on image creation", error);
            // }

            // try {
            const username = process.env.IG_USERNAME;
            const password = process.env.IG_PASSWORD;
            const finalFilePath =
            "https://firebasestorage.googleapis.com/v0/b/smarter-by-words.appspot.com/o/finalImage.jpg?alt=media&token=152f0698-0bfb-42d8-8c37-be97847addfb";
            await imageUpload.postToInstagram(username, password, finalFilePath);
            logger.log("Image uploaded to instagram");
          }
        } catch (error) {
          logger.log("Error on image upload", error);
        }
      } catch (error) {
        console.error("Error:", error);
        return null;
      }
    });
