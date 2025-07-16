import express from "express";
import "dotenv/config";
import cors from "cors";
import connect from "./config/mangoDB.js";
const app = express();
app.use(cors());
app.use(express.json());
connect();
app.get("/", (req, res) => {
  res.send("hello world // API WORKING");
});
app.listen(process.env.PORT, () => {
  console.log(`listening on port:${process.env.PORT}`);
});
