import express from "express";
import { PORT, mongoDBURL } from "./config.js";
import mongoose from "mongoose";
import recipeRoute from "./routes/recipeRoute.js";
//import { Recipe } from "./models/recipeModel.js";
const cors = express();
express = require("cors");
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  console.log(req);
  return res.status(234).send("Server is up gang");
});
app.use("/recipes", recipeRoute);

mongoose
  .connect(mongoDBURL)
  .then(() => {
    console.log("App connected to database");
    app.listen(PORT, () => {
      console.log(`App is listening to port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
