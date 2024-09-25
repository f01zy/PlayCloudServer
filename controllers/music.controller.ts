import Joi from 'joi';
import { Request, Response } from "express";
import { ApiError } from "../exceptions/api.exception";
import { MusicService } from "../service/music.service";
import { UploadedFile } from "express-fileupload"
import { musicModel } from "../models/music.model";
import { TokenService } from "../service/token.service";
import { Types } from "mongoose";
import { getDataFromRedis } from "../utils/getDataFromRedis.utils";
import { setDataToRedis } from "../utils/setDataToRedis.utils";

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
      if (!req.files || Object.keys(req.files).length === 0) return next(ApiError.BadRequest("Файлы не были переданы"))

      const { files } = req.files
      const { name } = req.body

      const schema = Joi.object({
        name: Joi.string().required()
      });

      const { error } = schema.validate({ name });

      if (error) {
        throw ApiError.BadRequest(error.details[0].message)
      }

      const { refreshToken } = req.cookies

      const user = await musicService.create(files as UploadedFile[], name, refreshToken)

      return res.json(user)
    } catch (e) {
      next(e)
    }
  }

  public async getOneMusic(req: Request<RequestBodyId, {}, {}>, res: Response, next: Function) {
    try {
      const { id } = req.params
      if (!id) throw ApiError.BadRequest("The id field is required")
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
      return res.json(await musicService.getAllMusic())
    } catch (e) {
      next(e)
    }
  }

  public async listen(req: Request<{}, {}, RequestBodyId>, res: Response, next: Function) {
    try {
      const { id } = req.body
      const { refreshToken } = req.cookies

      if (!id) throw ApiError.BadRequest("The id field is required")
      if (!Types.ObjectId.isValid(id)) throw ApiError.NotFound()

      const user = await musicService.listen(refreshToken, id as any)

      return res.json(user)
    } catch (e) {
      next(e)
    }
  }

  public async like(req: Request<{}, {}, RequestBodyId>, res: Response, next: Function) {
    try {
      const { id } = req.body
      const { refreshToken } = req.cookies

      if (!id) throw ApiError.BadRequest("The id field is required")
      if (!Types.ObjectId.isValid(id)) throw ApiError.NotFound()

      const user = await tokenService.getUserByRefreshToken(refreshToken)
      const music = await musicModel.findById(id)

      if (!music) {
        throw ApiError.BadRequest("There is no song with this id")
      }

      user.likes.indexOf(music.id) != -1 ? user.likes = user.likes.filter(musicS => musicS != music.id) : user.likes.push(music.id)
      user.save()
      music.likes.indexOf(user.id) != -1 ? music.likes = music.likes.filter(userS => userS != user.id) : music.likes.push(user.id)
      music.save()

      return res.json(await musicService.populate(music))
    } catch (e) {
      next(e)
    }
  }
}