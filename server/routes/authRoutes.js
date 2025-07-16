import express from "express";
import { loginUser, logout, register } from "../controller/userController.js";
const authRouter = express.Router();
authRouter.post("/register", register);
authRouter.post("/login", loginUser);
authRouter.post("/logout", logout);
export default authRouter;
