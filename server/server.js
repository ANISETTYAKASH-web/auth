import express from "express";
import "dotenv/config";
import cors from "cors";
import connect from "./config/mangoDB.js";
import authRouter from "./routes/authRoutes.js";
const app = express();
app.use(cors());
app.use(express.json());
connect();

//API ENDPOINTS
app.get("/", (req, res) => {
  res.send("hello world // API WORKING");
});
app.use("/api/auth", authRouter);
app.listen(process.env.PORT, () => {
  console.log(`listening on port:${process.env.PORT}`);
});
