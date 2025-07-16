import userModel from "../Models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../config/nodemailer.js";
import cryptoRandomString from "crypto-random-string";
export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.send({ success: false, message: "Details missing" });
  }

  try {
    const userExists = await userModel.findOne({ email });
    if (userExists) {
      return res.json({ success: false, message: "user email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const createUser = new userModel({ name, email, password: hashedPassword });
    await createUser.save();
    const token = jwt.sign(
      { user_id: createUser._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
      maxAge: 86400000, //86400000 is 24 hrs in milliseconds
    });
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Hello Welcome to our Website",
      text: `thank u for signing with us using u r email Id ${email}`,
    };
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (error) {
    res.send({ success: false, error: error.message });
  }
};
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.send({ success: false, message: "Details missing" });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.send({
        success: false,
        message: "user with email doesn't exist",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.send({ success: false, message: "Incorrect Password" });
    }
    const token = jwt.sign({ user_id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
      maxAge: 86400000, //86400000 is 24 hrs in milliseconds
    });
    return res.json({ success: true });
  } catch (error) {
    res.send({ success: false, error: error.message });
  }
};
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
    });
    return res.json({ success: true });
  } catch (error) {
    res.send({ success: false, error: error.message });
  }
};

export const sendOtp = async (req, res) => {
  const { user_id } = req.body;
  try {
    const user = await userModel.findById(user_id);
    if (user.isAccountVerified) {
      res.json({ success: false, message: "Account is already verified" });
    }
    const otp = cryptoRandomString({ length: 6, type: "numeric" });
    user.verifyOtp = otp;
    user.verifyOtpExpiresAt = Date.now() + 5 * 30 * 1000;
    await user.save();
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Activation code for your accounf",
      text: `thank u for signing with us using u r  otp is ${otp} `,
    };
    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "otp sent successfully" });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};
export const verifyOtp = async (req, res) => {
  const { user_id, otp } = req.body;
  if (!user_id || !otp) {
    return res.json({ success: false, message: "Missing Details" });
  }
  try {
    const user = await userModel.findById(user_id);
    if (!user) {
      return res.json({ success: false, message: "user doesn't exist" });
    }
    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.json({ success: false, message: "OTP doesn't match" });
    }
    if (user.verifyOtpExpiresAt < Date.now()) {
      return res.json({ success: false, message: "OTP expired" });
    }
    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpiresAt = 0;
    await user.save();

    return res.json({ success: true, message: "Account succesfully verified" });
  } catch (error) {
    return res.json({ success: false, error: error.message });
  }
};
export const resendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.json({ success: false, message: "email id not found" });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "user not found" });
    }
    const resendOTP = cryptoRandomString({ length: 6, type: "numeric" });
    user.resendOtp = resendOTP;
    user.resendOtpExpiresAt = Date.now() + 5 * 60 * 1000;
    await user.save();
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "OTP to reset your password",
      text: `Here is the Otp ${resendOTP} to reset your password for account email ${email}`,
    };
    await transporter.sendMail(mailOptions);
    return res.json({
      success: true,
      message: "Otp sent succesfully to reset password",
    });
  } catch (error) {
    return res.json({ success: false, error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.json({
      success: false,
      message: "email or otp or new Password not found",
    });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "user not found" });
    }
    if (user.resendOtp === "" || user.resendOtp !== otp) {
      return res.json({ success: false, message: "otp is invalid " });
    }
    if (user.resendOtpExpiresAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resendOTP = "";
    user.resendOtpExpiresAt = 0;
    await user.save();
    return res.json({ success: true, message: "Password Changed succesfully" });
  } catch (error) {
    return res.json({ success: false, error: error.message });
  }
};
