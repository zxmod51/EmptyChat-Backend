const mongoose = require("mongoose");

exports.connect = () => {

  // Connecting to the database
  mongoose
    .connect(process.env.CONNECTION_STRING_MONGODB, {
      useNewUrlParser: true,
    })
    .then(() => {
      console.log("Erfolgreich mit der Database verbunden!");
    })
    .catch((error) => {
      console.log("Verbindung zur DB ist fehlgeschlagen. Exit...");
      console.error(error);
      process.exit(1);
    });
};