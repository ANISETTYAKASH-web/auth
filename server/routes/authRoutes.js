import express from "express";
import {
  loginUser,
  logout,
  register,
  resendOtp,
  resetPassword,
  sendOtp,
  verifyOtp,
} from "../controller/authController.js";
import getUserId from "../middleware/authToken.js";
const authRouter = express.Router();
authRouter.post("/register", register);
authRouter.post("/login", loginUser);
authRouter.post("/logout", logout);
authRouter.post("/send-otp", getUserId, sendOtp);
authRouter.post("/verify-otp", getUserId, verifyOtp);
authRouter.post("/resend-otp", resendOtp);
authRouter.post("/reset-password", resetPassword);
export default authRouter;
