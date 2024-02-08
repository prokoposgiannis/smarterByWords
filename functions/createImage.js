const {createCanvas, loadImage} = require("canvas");

module.exports.createImage = async function(photo) {
  const canvas = createCanvas(1080, 1920);
  const context = canvas.getContext("2d");

  // Load the image
  const backgroundImage = await loadImage(photo);
  context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

  // Set up the title properties
  const titleFont = "bold 130px Helvetica";
  const titleText = "Ορεσίβιος";
  context.font = titleFont;
  context.fillStyle = "#141316";
  context.textAlign = "center";
  context.textBaseline = "top";

  // Position the title at the top middle
  const titleX = canvas.width / 2;
  const titleY = 200;
  context.fillText(titleText, titleX, titleY);

  // Set up the paragraph properties
  const paragraphFont = "50px Helvetica";
  const paragraphText =
    "λόγιο διαχρονικό δάνειο από τη μεσαιωνική ελληνική ὀρεσίβιος ή από την ελληνιστική κοινή [1] (o Ευστάθιος Θεσσαλονίκης το αποδίδει στον Αρριανό, συγγραφέα του 1ου αιώνα κε)[2] Ο γνωστός ελληνιστικός τύπος είναι ὀρέσβιος. Η μορφή ὀρεσίβιος, πιθανόν κατά το αρχαίο ὀρεσίτροφος[1] < ὀρεσι- + -βιος (< βίος), κυριολεκτικά, «αυτός που ζει στα βουνά». Συγχρονικά αναλύεται σε ορεσί- + -βιος";

  // Function to wrap text to fit within a specified width
  function wrapText(text, x, y, maxWidth) {
    const words = text.split(" ");
    let line = "";
    const lineHeight = 50; // Adjust as needed

    words.forEach((word) => {
      const testLine = line + word + " ";
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth) {
        // Draw the background for the current line
        context.fillStyle = "rgba(211, 211, 211, 0.4)"; // Faint white background
        context.fillRect(x, y, maxWidth, lineHeight);

        // Draw the text on top of the background
        context.fillStyle = "#141316"; // Paragraph text color
        context.fillText(line, x, y);

        line = word + " ";
        y += lineHeight;
      } else {
        line = testLine;
      }
    });

    // Draw the background and text for the last line
    context.fillStyle = "rgba(211, 211, 211, 0.4)"; // Faint white background
    context.fillRect(x, y, maxWidth, lineHeight);
    context.fillStyle = "#141316"; // Paragraph text color
    context.fillText(line, x, y);
  }

  context.font = paragraphFont;
  context.textAlign = "left";

  // Position and wrap the paragraph in the middle
  const paragraphX = 80; // Left margin
  const paragraphY = 400; // Adjust as needed
  const maxWidth = canvas.width - 2 * paragraphX;

  wrapText(paragraphText, paragraphX, paragraphY, maxWidth);

  // Save the canvas to a file or send it as a response
  const buffer = canvas.toBuffer("image/jpeg");

  return buffer;
};
