// postToInstagram.js
const {IgApiClient} = require("instagram-private-api");
// const fs = require("fs");
// const util = require("util");
// const readFileAsync = util.promisify(fs.readFile);
const {get} = require("request-promise");

module.exports.postToInstagram = async function(username, password, path) {
  //   try {
  const ig = new IgApiClient();
  ig.state.generateDevice(username);
  await ig.account.login(username, password);

  //   const imageBuffer = await readFileAsync(image);
  const imageBuffer = await get({
    url: path,
    encoding: null,
  });

  const publishResult = await ig.publish.story({
    file: imageBuffer,
  });

  console.log("Post successful: " + publishResult);
  //   } catch (error) {
  //     console.error("Error posting to Instagram:", error.message);
  //   }
};
