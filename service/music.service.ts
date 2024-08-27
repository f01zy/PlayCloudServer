import { UploadedFile } from "express-fileupload"
import { ApiError } from "../exceptions/api.exception"
import { TokenService } from "./token.service"
import { userModel } from "../models/user.model"
import { musicModel } from "../models/music.model"
import path from "path"
import { UserService } from "./user.service"
import { Document, Schema } from "mongoose"
import { IMusic } from "../interfaces/music.interface"
import { listeningModel } from "../models/listening.model"

const tokenService = new TokenService()
const userService = new UserService()

export class MusicService {
  public async create(files: UploadedFile[], name: string, refreshToken: string) {
    const user = await tokenService.getUserByRefreshToken(refreshToken)

    const musicSearch = await musicModel.findOne({ name })

    if (musicSearch) throw ApiError.BadRequest("Песня с таким названием уже существует")

    const musicCreated = await musicModel.create({ author: user._id, name, date: new Date() })

    if (files[0].name.endsWith("mp3")) { files[0].mv(path.join('static', "music", `${musicCreated._id}.mp3`)); files[1].mv(path.join('static', "cover", `${musicCreated._id}.jpg`)) } else { files[1].mv(path.join('static', "music", `${musicCreated._id}.mp3`)); files[0].mv(path.join('static', "cover", `${musicCreated._id}.jpg`)) }

    user.tracks.push(musicCreated.id)
    user.save()

    return await userService.populate(user)
  }

  public async listen(refreshToken: string, musicId: Schema.Types.ObjectId) {
    const user = await tokenService.getUserByRefreshToken(refreshToken)
    const music = await musicModel.findById(musicId)

    if (!music) {
      throw ApiError.BadRequest("Музыки с таким id не существует")
    }

    const listening = await listeningModel.create({ date: new Date(), user: user._id })

    music.listenings.push(listening.id)
    music.save()

    const history = user.history.filter(historyMusic => historyMusic != musicId)
    history.unshift(musicId)
    const newUser = await userModel.findOneAndUpdate(
      { _id: user._id, __v: user.__v },
      { $set: { history } },
      { new: true, runValidators: true }
    )

    if (!newUser) {
      throw ApiError.BadRequest("Неверный запрос")
    }

    return await userService.populate(newUser)
  }

  public async populate(music: Document<unknown, {}, IMusic> & IMusic) {
    return await music.populate([
      { path: "author" },
      { path: "listenings", populate: "user" }
    ])
  }
}