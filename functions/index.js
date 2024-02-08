const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {getStorage} = require("firebase-admin/storage");
const logger = require("firebase-functions/logger");
const imageCreation = require("./createImage");
const imageUpload = require("./postToInstagram");
require("dotenv").config();
const path = require("path");

admin.initializeApp();
// const firestore = admin.firestore();

exports.scheduledFunction = functions.pubsub
    .schedule("* * * * *")
    .timeZone("UTC")
    .onRun(async () => {
      try {
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
          const finalImage = await imageCreation.createImage(imageBuffer);
          logger.log("Image created!");
          // Prefix 'thumb_' to file name.
          const finalFilePath = path.join(path.dirname(filePath), "final");

          // Upload the thumbnail.
          const metadata = {contentType: contentType};
          await bucket.file(filePath).save(finalImage, {
            metadata: metadata,
          });
          logger.log("Thumbnail uploaded!");
          // } catch (error) {
          //   logger.log("Error on image creation", error);
          // }

          // try {
          const username = process.env.IG_USERNAME;
          const password = process.env.IG_PASSWORD;
          await imageUpload.postToInstagram(username, password, finalFilePath);
          logger.log("Image uploaded!");
        } catch (error) {
          logger.log("Error on image upload", error);
        }

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

      // return null;
      } catch (error) {
        console.error("Error:", error);
        return null;
      }
    });
