import { Schema } from "mongoose";

export interface IMusic {
  author: Schema.Types.ObjectId,
  name: string
}