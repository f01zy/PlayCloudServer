import { Schema } from "mongoose";

export interface IUser {
  username: string
  email: string
  password: string
  isActivated: boolean
  activationLink: string
  liked: Array<Schema.Types.ObjectId>
  music: Array<Schema.Types.ObjectId>
  history: Array<Schema.Types.ObjectId>
}