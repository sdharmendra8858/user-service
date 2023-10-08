const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const routes = require("./routes");

require("./db/connection");

const app = express();

app.use(bodyParser.json());

app.use(routes);

const server = app.listen(process.env.PORT, () => {
    console.log("Listening on server", server.address());
})