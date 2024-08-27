import { Schema } from "mongoose";

export interface IUser {
  username: string
  email: string
  password: string
  isActivated: boolean
  activationLink: string
  avatar: boolean,
  banner: boolean,
  likes: Array<Schema.Types.ObjectId>
  tracks: Array<Schema.Types.ObjectId>
  history: Array<Schema.Types.ObjectId>
  playlists: Array<Schema.Types.ObjectId>
}