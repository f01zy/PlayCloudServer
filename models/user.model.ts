import { Schema, model } from "mongoose";
import { IUser } from "../interfaces/user.interface";

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  isActivated: { type: Boolean, default: false },
  activationLink: { type: String, required: true },
  liked: [{ type: String, default: [], ref: "Music" }],
  music: [{ type: String, default: [], ref: "Music" }],
  history: [{ type: String, default: [], ref: "Music" }]
})

export const userModel = model("User", UserSchema)