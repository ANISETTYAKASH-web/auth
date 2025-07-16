import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

export const getUserId = async (req, res, next) => {
  const { token } = req.cookies;
  // console.log("req.cookies", req.cookies);
  // console.log("token:", token);
  if (!token) {
    return res.json({
      success: false,
      message: "Session invalid login again ",
    });
  }
  try {
    const verifyStatus = await jwt.verify(token, process.env.JWT_SECRET);
    console.log(verifyStatus);
    if (verifyStatus) {
      req.body.user_id = verifyStatus.user_id;
      console.log("user-id", req.body.user_id);
    } else {
      return res.json({
        success: false,
        message: "Session invalid login again ",
      });
    }
    next();
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};
export default getUserId;
