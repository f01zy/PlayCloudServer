import { Schema, model } from "mongoose";
import { IMusic } from "../interfaces/music.interface";

const MusicSchema = new Schema<IMusic>({
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  listening: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  likes: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
})

export const musicModel = model("Music", MusicSchema)