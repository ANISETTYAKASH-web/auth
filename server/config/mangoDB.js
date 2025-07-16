import mongoose from "mongoose";

const connect = async () => {
  mongoose.connection.on("connected", () => {
    console.log("Succesfuly connected to mangoDb");
  });
  mongoose.connect(`${process.env.MANGODB_URL}/auth`);
};

export default connect;
