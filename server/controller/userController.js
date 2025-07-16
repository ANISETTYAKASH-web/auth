import userModel from "../Models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
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
    const token = jwt.sign({ id: createUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "null" : "Strict",
      maxAge: 86400000, //86400000 is 24 hrs in milliseconds
    });
    return res.json({ success: true });
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
    const user = await userModel.findOne({ user });
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
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "null" : "Strict",
      maxAge: 86400000, //86400000 is 24 hrs in milliseconds
    });
    return res.json({ success: true });
  } catch (error) {
    res.send({ success: false, error: error.message });
  }
};
