import { Schema } from "mongoose";
import { IUser } from "./user.interface";

export interface IMusic {
  author: Schema.Types.ObjectId,
  name: string,
  listening: Array<Schema.Types.ObjectId>,
  likes: Array<Schema.Types.ObjectId>
}