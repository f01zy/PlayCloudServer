import { Schema, model } from "mongoose";
import { IMusic } from "../interfaces/music.interface";

const MusicSchema = new Schema<IMusic>({
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true }
})

export const musicModel = model("Music", MusicSchema)