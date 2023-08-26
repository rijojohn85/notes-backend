import env from './util/validateEnv';
import app from './app';
import mongoose from "mongoose";

const port = env.PORT;

mongoose.connect(env.MONGO_CONNECTION_STRING)
  .then(() => {
    console.log("Mongoose Connected");

    app.listen(port, () => {
      console.log("Server running on port: " + port);
    });
  })
  .catch(() => console.log("Connection Failed"));

//48:31
// YPRWr4L5DQrAemVt DB :password
//
