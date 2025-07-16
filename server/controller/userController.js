import userModel from "../Models/userModel.js";

export const getUserData = async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) {
    res.json({ success: false, message: "user_id not found" });
  }
  try {
    const user = await userModel.findById(user_id);
    if (!user) {
      res.json({ success: false, message: "user not found" });
    }
    res.json({
      success: true,
      userData: {
        name: user.name,
        isAccountVerified: user.isAccountVerified,
      },
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};
