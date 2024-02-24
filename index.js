const express = require("express");

const routes = require("./routes/routes");

const app = express();

app.use(express.json());

app.listen(3000, () => {
  console.log(`Server Started at ${3000}`);
});
app.use("/api", routes);
