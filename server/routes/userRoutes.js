import express from "express";
import getUserId from "../middleware/authToken.js";
import { getUserData } from "../controller/userController.js";
const userRouter = express.Router();

userRouter.get("/", getUserId, getUserData);
export default userRouter;
