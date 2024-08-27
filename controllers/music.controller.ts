import { Request, Response } from "express";
import { ApiError } from "../exceptions/api.exception";
import { MusicService } from "../service/music.service";
import { UploadedFile } from "express-fileupload"
import { musicModel } from "../models/music.model";
import { Document, Schema } from "mongoose";
import { IMusic } from "../interfaces/music.interface";
import { TokenService } from "../service/token.service";
import { Types } from "mongoose";
import { getDataFromRedis } from "../utils/getDataFromRedis.utils";
import { setDataToRedis } from "../utils/setDataToRedis.utils";
import { UserService } from "../service/user.service";

interface RequestBodyCreate {
  name: string,
  refreshToken: string
}

interface RequestBodyId {
  id: string,
}

const musicService = new MusicService()
const tokenService = new TokenService()

export class MusicController {
  public async create(req: Request<{}, {}, RequestBodyCreate>, res: Response, next: Function) {
    try {
      if (!req.files || Object.keys(req.files).length === 0)
        return next(ApiError.BadRequest("Файлы не были переданы"))

      const { files } = req.files

      const name = req.body.name

      if (!name) return next(ApiError.BadRequest("Поле name не было указанно"))

      const { refreshToken } = req.cookies

      const user = await musicService.create(files as UploadedFile[], name, refreshToken)

      return res.json(user)
    } catch (e) {
      next(e)
    }
  }

  public async delete(req: Request<{}, {}, RequestBodyId>, res: Response, next: Function) {
    try {
      const id = req.body.id
      const { refreshToken } = req.cookies

      if (!id) return next(ApiError.BadRequest("id песни не был указан"))

      const user = await musicService.delete(id, refreshToken)

      return res.json(user)
    } catch (e) {
      next(e)
    }
  }

  public async getOneMusic(req: Request<RequestBodyId, {}, {}>, res: Response, next: Function) {
    try {
      const { id } = req.params

      if (!id) throw ApiError.BadRequest("id песни не был указан")

      if (!Types.ObjectId.isValid(id)) throw ApiError.NotFound()

      const redisMusic = await getDataFromRedis(id)
      if (redisMusic) return res.json(redisMusic)

      const music = await musicModel.findById(id)

      if (!music) throw ApiError.NotFound()

      await setDataToRedis(id, await musicService.populate(music))

      return res.json(await getDataFromRedis(id))
    } catch (e) {
      next(e)
    }
  }

  public async getAllMusic(req: Request, res: Response, next: Function) {
    try {
      const redisMusic = await getDataFromRedis("music")
      if (redisMusic) return res.json(redisMusic)

      const music = await musicModel.find()
      const musicPopulate: Array<Document<unknown, {}, IMusic>> = []

      for (const musicOnePopulate of music) {
        musicPopulate.push(await musicService.populate(musicOnePopulate))
      }

      await setDataToRedis("music", musicPopulate)

      return res.json(await getDataFromRedis("music"))
    } catch (e) {
      next(e)
    }
  }

  public async listen(req: Request<{}, {}, RequestBodyId>, res: Response, next: Function) {
    try {
      const { id } = req.body
      const { refreshToken } = req.cookies

      if (!id) {
        throw ApiError.BadRequest("id песни не был указан")
      }

      const user = await musicService.listen(refreshToken, id as unknown as Schema.Types.ObjectId)

      return res.json(user)
    } catch (e) {
      next(e)
    }
  }

  public async like(req: Request<{}, {}, RequestBodyId>, res: Response, next: Function) {
    try {
      const { id } = req.body
      const { refreshToken } = req.cookies

      const user = await tokenService.getUserByRefreshToken(refreshToken)
      const music = await musicModel.findById(id)

      if (!music) {
        throw ApiError.BadRequest("Песни с таким id не существует")
      }

      music.likes.indexOf(user.id) != -1 ? music.likes = music.likes.filter(userS => userS != user.id) : music.likes.push(user.id)
      music.save()

      return res.json(await musicService.populate(music))
    } catch (e) {
      next(e)
    }
  }
}