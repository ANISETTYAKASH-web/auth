import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verifyOtp: { type: String, default: "" },
  verifyOtpExpiresAt: { type: Number, default: 0 },
  isAccountVerified: { type: Boolean, default: false },
  resendOtp: { type: String, default: "" },
  resendOtpExpiresAt: { type: Number, default: 0 },
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;
