require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rate_limit = require("express-rate-limit");
const helmet = require("helmet");
const router = require("./src/routes/index.routes");
const { handle_error } = require("./src/middlewares/error.middleware");
const cookie_parser = require("cookie-parser");
const swagger_ui = require("swagger-ui-express");
const swagger_spec = require("./src/docs/swagger");
const path = require("path");
const app = express();
const { Server } = require("socket.io");
const { createServer: create_server } = require("http");
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json());
app.use(cookie_parser());
app.use("/api-docs", swagger_ui.serve, swagger_ui.setup(swagger_spec));
app.use("/api", router);
app.use("/api/uploads", express.static(path.join(__dirname, "src", "uploads")));
app.use(handle_error);

const server = create_server(app);
const initial_socket = require("./src/socket/socket");
const { set_io } = require("./src/socket/socketManager");
const io = initial_socket(server);
set_io(io);

module.exports = server;