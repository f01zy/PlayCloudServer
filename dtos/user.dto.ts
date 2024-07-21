import { Document, Schema } from "mongoose"
import { IUser } from "../interfaces/user.interface"

export class UserDto {
  username: string
  email: string
  isActivated: boolean
  liked: Array<Schema.Types.ObjectId>
  music: Array<Schema.Types.ObjectId>
  _id: string
  history: Array<Schema.Types.ObjectId>

  constructor(model: Document<unknown, {}, IUser> & IUser) {
    this.username = model.username
    this.email = model.email
    this.isActivated = model.isActivated
    this.liked = model.liked
    this.music = model.music
    this.history = model.history
    this._id = String(model._id)
  }
}