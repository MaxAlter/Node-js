const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const contactsRoters = require("./API/ContactsRoutes");
require("dotenv").config();

const PORT = process.env.PORT;

class Server {
  constructor() {
    this.server = null;
  }
  initMiddlewares() {
    this.server.use(express.json());
    this.server.use(cors({ origin: "http://localhost:3000" }));
    this.server.use(
      morgan(":method :url :status :res[content-length] - :response-time ms")
    );
  }
  initServer() {
    this.server = express();
  }

  initRoutes() {
    this.server.use("/api", contactsRoters);
  }

  startListening() {
    this.server.listen(PORT, () => {
      console.log("Server started listening on port", PORT);
    });
  }

  start() {
    this.initServer();
    this.initMiddlewares();
    this.initRoutes();
    this.startListening();
  }
}

module.exports = new Server();
